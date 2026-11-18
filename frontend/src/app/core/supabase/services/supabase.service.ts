import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { getConfig } from '../../config/runtime-config';

/** Cliente único de Supabase para toda la app. */
@Injectable({ providedIn: 'root' })
export class SupabaseService {
  readonly client: SupabaseClient;

  constructor() {
    const { supabaseUrl, supabaseKey } = getConfig();
    this.client = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: true, autoRefreshToken: true, storageKey: 'coldwork-auth' },
    });
  }
}
