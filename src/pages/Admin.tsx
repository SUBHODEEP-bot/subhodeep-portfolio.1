
import React, { useState, useEffect } from 'react';
import AdminDashboard from '@/components/admin/AdminDashboard';
import SupabaseAdminLogin from '@/components/admin/SupabaseAdminLogin';
import { supabase } from '@/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';

const Admin = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = () => {
    // This is handled by onAuthStateChange, so we don't need to do anything here.
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-white/30 border-t-cyan-400 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!session) {
    return <SupabaseAdminLogin onLogin={handleLogin} />;
  }

  return <AdminDashboard onLogout={handleLogout} />;
};

export default Admin;
