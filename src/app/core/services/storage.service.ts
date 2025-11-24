import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { STORAGE_CONSTANTS } from '../../constants/storage.constants';
import { ImageUploadResult } from '../../models/ar-target.model';

/**
 * Storage Service
 * Handles all file upload and retrieval operations with Supabase Storage
 * Implements signed URLs for secure, temporary access
 */
@Injectable({
    providedIn: 'root'
})
export class StorageService {
    constructor(private readonly supabaseService: SupabaseService) { }

    /**
     * Upload an image file to Supabase Storage
     * @param file - The image file to upload
     * @param markerCode - The marker code (used in filename)
     * @returns Promise with upload result including signed URL
     * @throws Error if upload fails or file is invalid
     */
    public async uploadImage(
        file: File,
        markerCode: number
    ): Promise<ImageUploadResult> {
        this.validateFile(file);

        const filePath = this.generateFilePath(file, markerCode);
        const supabase = this.supabaseService.getClient();

        // Upload file to storage
        const { data, error } = await supabase.storage
            .from(STORAGE_CONSTANTS.BUCKET_NAME)
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: true // Allow overwriting if same marker code
            });

        if (error) {
            throw new Error(`Image upload failed: ${error.message}`);
        }

        // Generate signed URL (temporary, secure access)
        const signedUrl = await this.getSignedUrl(filePath);

        // Get public URL (permanent, if bucket is public)
        const { data: { publicUrl } } = supabase.storage
            .from(STORAGE_CONSTANTS.BUCKET_NAME)
            .getPublicUrl(filePath);

        return {
            publicUrl,
            signedUrl,
            path: filePath
        };
    }

    /**
     * Get a signed (temporary) URL for a file
     * @param filePath - Path to file in storage
     * @returns Promise with signed URL string
     * @private
     */
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

    /**
     * List all images from Supabase Storage bucket
     * @returns Promise with array of image metadata (name, url, path)
     */
    public async listImages(): Promise<Array<{ name: string; signedUrl: string; path: string }>> {
        const supabase = this.supabaseService.getClient();

        // List all files in bucket
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

        // Generate signed URLs for each image
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

    /**
     * Validate file before upload
     * @param file - File to validate
     * @throws Error if file is invalid
     * @private
     */
    private validateFile(file: File): void {
        // Check file size
        const fileSizeMB = file.size / (1024 * 1024);
        if (fileSizeMB > STORAGE_CONSTANTS.MAX_FILE_SIZE_MB) {
            throw new Error(
                `File size exceeds ${STORAGE_CONSTANTS.MAX_FILE_SIZE_MB}MB limit`
            );
        }

        // Check MIME type (cast to string array for type compatibility)
        const allowedTypes = STORAGE_CONSTANTS.ALLOWED_MIME_TYPES as readonly string[];
        if (!allowedTypes.includes(file.type)) {
            throw new Error(
                `Invalid file type. Allowed: ${STORAGE_CONSTANTS.ALLOWED_MIME_TYPES.join(', ')}`
            );
        }
    }

    /**
     * Generate a unique file path for storage
     * @param file - The file being uploaded
     * @param markerCode - Marker code for naming
     * @returns String path for storage
     * @private
     */
    private generateFilePath(file: File, markerCode: number): string {
        const timestamp = Date.now();
        const extension = this.getFileExtension(file.name);
        return `marker-${markerCode}-${timestamp}.${extension}`;
    }

    /**
     * Extract file extension from filename
     * @param filename - Original filename
     * @returns File extension without dot
     * @private
     */
    private getFileExtension(filename: string): string {
        return filename.split('.').pop()?.toLowerCase() || 'jpg';
    }
}
