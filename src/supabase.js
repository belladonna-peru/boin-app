import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';

export const SUPABASE_URL = 'https://wrjpuenuhtramrdgfyhv.supabase.co/rest/v1/';
export const SUPABASE_KEY = 'sb_publishable_cb7lGogGY4I1H3Gh_YU8KA_xmUgBprG';

export const supabase = SUPABASE_URL.startsWith('https')
  ? createClient(SUPABASE_URL, SUPABASE_KEY)
  : null;