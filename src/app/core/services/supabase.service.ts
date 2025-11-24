import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';

/**
 * Supabase Service
 * Singleton service that manages the Supabase client connection
 * @singleton provided in root
 */
@Injectable({
    providedIn: 'root'
})
export class SupabaseService {
    private readonly supabaseClient: SupabaseClient;

    constructor() {
        this.validateEnvironmentConfig();
        this.supabaseClient = this.initializeClient();
    }

    /**
     * Get the Supabase client instance
     * @returns Configured Supabase client
     */
    public getClient(): SupabaseClient {
        return this.supabaseClient;
    }

    /**
     * Initialize Supabase client with environment credentials
     * @private
     */
    private initializeClient(): SupabaseClient {
        return createClient(
            environment.supabase.url,
            environment.supabase.anonKey
        );
    }

    /**
     * Validate that required environment variables are present
     * @private
     * @throws Error if configuration is invalid
     */
    private validateEnvironmentConfig(): void {
        const { url, anonKey } = environment.supabase;

        if (!url || url === 'YOUR_SUPABASE_URL_HERE') {
            throw new Error('SUPABASE_URL is not configured in environment');
        }

        if (!anonKey || anonKey === 'YOUR_SUPABASE_ANON_KEY_HERE') {
            throw new Error('SUPABASE_ANON_KEY is not configured in environment');
        }
    }
}
