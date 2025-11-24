import { Component, OnInit } from '@angular/core';
import { ModalController, AlertController, LoadingController, ToastController } from '@ionic/angular';
import { ArLauncherPage } from '../pages/ar-launcher/ar-launcher.page';
import { StorageService } from '../core/services/storage.service';
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
    private readonly storageService: StorageService
  ) { }

  /**
   * Initialize component and auto-assign images from Supabase
   */
  async ngOnInit() {
    await this.autoAssignImagesFromSupabase();
  }

  /**
   * Auto-assign Supabase images to existing targets (by order)
   * @private
   */
  private async autoAssignImagesFromSupabase(): Promise<void> {
    try {
      console.log('🔍 Checking for Supabase images...');

      // Fetch all images from Supabase
      const images = await this.storageService.listImages();
      console.log('📸 Images found in Supabase:', images.length);

      if (images.length === 0) {
        console.log('⚠️ No images in Supabase bucket');
        return;
      }

      // Get existing targets
      const existingData = localStorage.getItem(LOCAL_STORAGE_KEYS.AR_TARGETS);
      let targets: ARTarget[] = existingData ? JSON.parse(existingData) : [];
      console.log('💾 Existing targets in localStorage:', targets.length);

      // Create default target codes (starting from 0)
      const autoTargets: ARTarget[] = images.map((image: { name: string; signedUrl: string; path: string }, index: number) => ({
        markerType: MarkerType.BARCODE,
        value: index,
        content: {
          type: ContentType.IMAGE,
          src: image.signedUrl
        }
      }));

      console.log('✅ Auto-generated targets:', autoTargets);

      // Save to localStorage (replace all)
      localStorage.setItem(LOCAL_STORAGE_KEYS.AR_TARGETS, JSON.stringify(autoTargets));

      console.log(`✨ Auto-assigned ${autoTargets.length} images to targets (codes 0-${autoTargets.length - 1})`);

      // Show success toast
      await this.showToast(`${autoTargets.length} marcadores creados automáticamente`, 'success');
    } catch (error) {
      console.error('❌ Auto-assignment failed:', error);
      await this.showToast('Error al cargar imágenes de Supabase', 'danger');
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
