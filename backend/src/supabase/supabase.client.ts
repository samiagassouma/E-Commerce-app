import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

function readSecret(file: string): string | undefined {
  try {
    return fs.readFileSync(path.join('/etc/secrets', file), 'utf8').trim();
  } catch {
    return undefined;
  }
}

const chatbotsupabaseUrl = readSecret('CHATBOT_URL')!;
const chatbotsupabaseKey = readSecret('CHATBOT_SERVICE_ROLE_KEY')!;
const chatbotsupabaseAdminKey = readSecret('CHATBOT_SERVICE_ROLE_KEY')!;


export const supabase = createClient(chatbotsupabaseUrl, chatbotsupabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export const supabaseAdmin = createClient(chatbotsupabaseUrl, chatbotsupabaseAdminKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Function to send magic link
async function sendMagicLink(email: string) {
  try {
    const { data, error } = await supabase.auth.signInWithOtp({ email });

    if (error) {
      console.error('Error sending magic link:', error.message);
      return { success: false, error: error.message };
    }

    console.log('Magic link sent to:', email);
    return { success: true, data };
  } catch (err) {
    console.error('Unexpected error:', err);
    return { success: false, error: 'An unexpected error occurred.' };
  }
}

export { sendMagicLink };
