import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { STORAGE_CONSTANTS } from '../../constants/storage.constants';
import { ImageUploadResult } from '../../models/ar-target.model';


@Injectable({
    providedIn: 'root'
})
export class StorageService {
    constructor(private readonly supabaseService: SupabaseService) { }

    public async uploadImage(
        file: File,
        markerCode: number
    ): Promise<ImageUploadResult> {
        this.validateFile(file);

        const filePath = this.generateFilePath(file, markerCode);
        const supabase = this.supabaseService.getClient();

      

        const { data, error } = await supabase.storage
            .from(STORAGE_CONSTANTS.BUCKET_NAME)
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: true 
            });

        if (error) {
            throw new Error(`Image upload failed: ${error.message}`);
        }

        const signedUrl = await this.getSignedUrl(filePath);

        const { data: { publicUrl } } = supabase.storage
            .from(STORAGE_CONSTANTS.BUCKET_NAME)
            .getPublicUrl(filePath);

        return {
            publicUrl,
            signedUrl,
            path: filePath
        };
    }
    private async getSignedUrl(filePath: string): Promise<string> {
        const supabase = this.supabaseService.getClient();

        const { data, error } = await supabase.storage
            .from(STORAGE_CONSTANTS.BUCKET_NAME)
            .createSignedUrl(filePath, STORAGE_CONSTANTS.SIGNED_URL_EXPIRY_SECONDS);

        if (error || !data) {
            throw new Error(`Failed to generate signed URL: ${error?.message}`);
        }

        return data.signedUrl;
    }


    public async listImages(): Promise<Array<{ name: string; signedUrl: string; path: string }>> {
        const supabase = this.supabaseService.getClient();

 
        const { data, error } = await supabase.storage
            .from(STORAGE_CONSTANTS.BUCKET_NAME)
            .list('', {
                limit: 100,
                sortBy: { column: 'created_at', order: 'asc' }
            });

        if (error || !data) {
            console.error('Error listing images:', error);
            return [];
        }

     
        const imagesWithUrls = await Promise.all(
            data.map(async (file) => {
                const signedUrl = await this.getSignedUrl(file.name);
                return {
                    name: file.name,
                    signedUrl,
                    path: file.name
                };
            })
        );

        return imagesWithUrls;
    }
    private validateFile(file: File): void {
    
        const fileSizeMB = file.size / (1024 * 1024);
        if (fileSizeMB > STORAGE_CONSTANTS.MAX_FILE_SIZE_MB) {
            throw new Error(
                `File size exceeds ${STORAGE_CONSTANTS.MAX_FILE_SIZE_MB}MB limit`
            );
        }

    
        const allowedTypes = STORAGE_CONSTANTS.ALLOWED_MIME_TYPES as readonly string[];
        if (!allowedTypes.includes(file.type)) {
            throw new Error(
                `Invalid file type. Allowed: ${STORAGE_CONSTANTS.ALLOWED_MIME_TYPES.join(', ')}`
            );
        }
    }

 
    private generateFilePath(file: File, markerCode: number): string {
        const timestamp = Date.now();
        const extension = this.getFileExtension(file.name);
        return `marker-${markerCode}-${timestamp}.${extension}`;
    }

    private getFileExtension(filename: string): string {
        return filename.split('.').pop()?.toLowerCase() || 'jpg';
    }
}
