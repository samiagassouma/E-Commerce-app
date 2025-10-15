import { Injectable } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

function readSecret(file: string): string | undefined {
  try {
    return fs.readFileSync(path.join('/etc/secrets', file), 'utf8').trim();
  } catch {
    return undefined;
  }
}

@Injectable()
export class SupabaseService {

    private readonly supabase: SupabaseClient;

    constructor() {
      this.supabase = createClient(
        readSecret('CHATBOT_URL')!,
        readSecret('CHATBOT_SERVICE_ROLE_KEY')!,
      );
    }
  
    getClient(): SupabaseClient {
      return this.supabase;
    }


    

}
