import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class SupabaseService {
    private readonly supabaseClient: SupabaseClient;

    constructor() {
        this.supabaseClient = this.initializeClient();
    }

    public getClient(): SupabaseClient {
        return this.supabaseClient;
    }


    private initializeClient(): SupabaseClient {
        return createClient(
            environment.supabase.url,
            environment.supabase.anonKey
        );
    }



}
