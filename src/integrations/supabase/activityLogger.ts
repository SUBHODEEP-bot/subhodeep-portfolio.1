
import { supabase } from './client';

export const logActivity = async (action: string, details?: object) => {
  try {
    const { error } = await supabase.from('activity_log').insert({ action, details: details || {} });
    if (error) {
      console.error('Error logging activity:', error);
    }
  } catch (error) {
    console.error('Error in logActivity:', error);
  }
};
