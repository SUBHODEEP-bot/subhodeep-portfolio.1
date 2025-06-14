
import { supabase } from './client';
import type { Json } from './types';

export const logActivity = async (action: string, details?: Json) => {
  try {
    const { error } = await supabase.from('activity_log').insert({ action, details: details || {} });
    if (error) {
      console.error('Error logging activity:', error);
    }
  } catch (error) {
    console.error('Error in logActivity:', error);
  }
};
