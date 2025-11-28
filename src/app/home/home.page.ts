import { Component, OnInit } from '@angular/core';
import { ModalController, AlertController, LoadingController, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { ArLauncherPage } from '../pages/ar-launcher/ar-launcher.page';
import { StorageService } from '../core/services/storage.service';
import { AuthService } from '../services/auth.service';
import { ARTarget, MarkerType, ContentType } from '../models/ar-target.model';
import { LOCAL_STORAGE_KEYS } from '../constants/storage.constants';

/**
 * Home Page Component
 * Main landing page for the AR application
 * Handles AR camera initialization and target management
 */
@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage implements OnInit {

  constructor(
    private readonly modalController: ModalController,
    private readonly alertController: AlertController,
    private readonly loadingController: LoadingController,
    private readonly toastController: ToastController,
    private readonly storageService: StorageService,
    private readonly authService: AuthService,
    private readonly router: Router
  ) { }

  /**
   * Initialize component and auto-assign images from Supabase
   */
  async ngOnInit() {
    // Always try to sync on load to ensure fresh data from Supabase
    await this.syncTargetsFromSupabase();
  }

  /**
   * Sync images from Supabase and map them to barcodes
   * @private
   */
  private async syncTargetsFromSupabase(): Promise<void> {
    const loading = await this.loadingController.create({
      message: 'Sincronizando targets...',
      spinner: 'crescent',
      duration: 5000 // Timeout safety
    });
    await loading.present();

    try {
      console.log('🔄 Starting Supabase sync...');

      // Fetch all images from Supabase
      const images = await this.storageService.listImages();
      console.log(`📸 Found ${images.length} images in cloud`);

      if (images.length === 0) {
        console.log('⚠️ No images found in Supabase');
        await loading.dismiss();
        return;
      }

      // Map images to Barcode Targets (0 to N)
      // This REPLACES local targets to ensure Supabase is the source of truth
      const autoTargets: ARTarget[] = images.map((image, index) => ({
        markerType: MarkerType.BARCODE,
        value: index, // Auto-increment barcode ID
        content: {
          type: ContentType.IMAGE,
          src: image.signedUrl
        }
      }));

      // Save to localStorage
      localStorage.setItem(LOCAL_STORAGE_KEYS.AR_TARGETS, JSON.stringify(autoTargets));
      console.log(`✅ Synced ${autoTargets.length} targets from cloud`);

      // Optional: Show toast only if changes were made or on first load
      // await this.showToast(`${autoTargets.length} targets sincronizados`, 'success');

    } catch (error) {
      console.error('❌ Sync failed:', error);
      await this.showToast('Error de conexión con Supabase', 'danger');
    } finally {
      await loading.dismiss();
    }
  }

  /**
   * Open AR camera modal
   */
  public async openAR(): Promise<void> {
    const modal = await this.modalController.create({
      component: ArLauncherPage,
      componentProps: {
        arType: ContentType.IMAGE
      }
    });

    await modal.present();
  }

  /**
   * Logout user
   */
  public async logout(): Promise<void> {
    try {
      await this.authService.logout();
      this.router.navigate(['/login'], { replaceUrl: true });
    } catch (error) {
      console.error('Logout error:', error);
      await this.showToast('Error al cerrar sesión', 'danger');
    }
  }

  /**
   * Show dialog to add a new AR target
   * Allows user to upload image and associate with barcode marker
   */
  public async addTarget(): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Nuevo Target AR',
      message: 'Selecciona una imagen y asigna un código de marcador',
      inputs: [
        {
          name: 'code',
          type: 'number',
          placeholder: 'Código de Barcode (ej. 20)',
          min: 0,
          max: 63
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary'
        },
        {
          text: 'Seleccionar Imagen',
          handler: async (data) => {
            if (!data.code || data.code < 0 || data.code > 63) {
              await this.showToast('Por favor ingresa un código válido (0-63)', 'warning');
              return false;
            }
            await this.openFilePicker(parseInt(data.code));
            return true;
          }
        }
      ]
    });

    await alert.present();
  }

  /**
   * Open file picker to select image
   * @param markerCode - The barcode marker code
   * @private
   */
  private async openFilePicker(markerCode: number): Promise<void> {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';

    input.onchange = async (event: any) => {
      const file = event.target?.files?.[0];
      if (file) {
        await this.handleImageUpload(file, markerCode);
      }
    };

    input.click();
  }

  /**
   * Handle image upload and target creation
   * @param file - Selected image file
   * @param markerCode - Associated barcode marker
   * @private
   */
  private async handleImageUpload(file: File, markerCode: number): Promise<void> {
    const loading = await this.showLoading('Subiendo imagen...');

    try {
      // Upload to Supabase
      const uploadResult = await this.storageService.uploadImage(file, markerCode);

      // Create AR target with signed URL
      const newTarget: ARTarget = {
        markerType: MarkerType.BARCODE,
        value: markerCode,
        content: {
          type: ContentType.IMAGE,
          src: uploadResult.signedUrl // Using signed URL for security
        }
      };

      // Save to local storage
      this.saveTargetToStorage(newTarget);

      await this.showToast('¡Target creado exitosamente!', 'success');
    } catch (error: any) {
      console.error('Upload error:', error);
      await this.showToast(
        error.message || 'Error al subir la imagen',
        'danger'
      );
    } finally {
      await loading.dismiss();
    }
  }

  /**
   * Save target to localStorage with existing targets
   * @param newTarget - Target to save
   * @private
   */
  private saveTargetToStorage(newTarget: ARTarget): void {
    const existingData = localStorage.getItem(LOCAL_STORAGE_KEYS.AR_TARGETS);
    let targets: ARTarget[] = existingData ? JSON.parse(existingData) : [];

    // Initialize with defaults if first time
    if (!existingData) {
      targets = this.getDefaultTargets();
    }

    // Check if marker code already exists
    const existingIndex = targets.findIndex(
      t => t.markerType === MarkerType.BARCODE && t.value === newTarget.value
    );

    if (existingIndex !== -1) {
      // Replace existing
      targets[existingIndex] = newTarget;
    } else {
      // Add new
      targets.push(newTarget);
    }

    localStorage.setItem(LOCAL_STORAGE_KEYS.AR_TARGETS, JSON.stringify(targets));
  }

  /**
   * Get default AR targets configuration
   * @returns Array of default targets
   * @private
   */
  private getDefaultTargets(): ARTarget[] {
    // Retornar vacío para obligar a usar Supabase
    return [];
  }

  /**
   * Show loading indicator
   * @param message - Loading message
   * @returns Loading controller instance
   * @private
   */
  private async showLoading(message: string): Promise<HTMLIonLoadingElement> {
    const loading = await this.loadingController.create({
      message,
      spinner: 'crescent'
    });
    await loading.present();
    return loading;
  }

  /**
   * Show toast notification
   * @param message - Toast message
   * @param color - Toast color theme
   * @private
   */
  private async showToast(
    message: string,
    color: 'success' | 'danger' | 'warning' = 'success'
  ): Promise<void> {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      position: 'bottom',
      color
    });
    await toast.present();
  }
}
