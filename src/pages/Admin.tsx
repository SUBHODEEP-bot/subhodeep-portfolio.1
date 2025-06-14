
import React, { useState, useEffect } from 'react';
import AdminDashboard from '@/components/admin/AdminDashboard';
import AdminLogin from '@/components/admin/AdminLogin';
import { supabase } from '@/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';
import { RefreshCw } from 'lucide-react';

const Admin = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkCurrentSession = async (currentSession: Session | null) => {
      if (currentSession?.user) {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', currentSession.user.id)
            .single();

          if (error) throw error;
          setIsAdmin(data?.role === 'admin');
        } catch (error) {
          console.error("Error checking admin role:", error);
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    };

    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      checkCurrentSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setLoading(true);
      setSession(session);
      checkCurrentSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    setLoading(true);
    await supabase.auth.signOut();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <RefreshCw className="animate-spin text-white" size={48} />
      </div>
    );
  }

  if (session && isAdmin) {
    return <AdminDashboard onLogout={handleLogout} />;
  }
  
  // No need to pass onLogin, auth state change handles it
  return <AdminLogin />;
};

export default Admin;
