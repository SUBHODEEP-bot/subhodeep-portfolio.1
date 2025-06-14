
import React, { useState, useEffect } from 'react';
import AdminDashboard from '@/components/admin/AdminDashboard';
import AdminLogin from '@/components/admin/AdminLogin';
import { supabase } from '@/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';
import { Loader2 } from 'lucide-react';

const Admin = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkAdminRole = async (userId: string) => {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();
    
    return profile?.role === 'admin';
  };

  useEffect(() => {
    const getInitialSession = async () => {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      if (session) {
        const admin = await checkAdminRole(session.user.id);
        setIsAdmin(admin);
      }
      setLoading(false);
    };

    getInitialSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setIsAdmin(false); // Reset on change
        if (session) {
          setTimeout(async () => {
            const admin = await checkAdminRole(session.user.id);
            setIsAdmin(admin);
          }, 0);
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900">
        <Loader2 className="h-16 w-16 animate-spin text-cyan-400" />
      </div>
    );
  }

  if (session && isAdmin) {
    return <AdminDashboard onLogout={handleLogout} />;
  }
  
  // The onLogin prop on AdminLogin is likely redundant if it uses supabase auth methods
  // as onAuthStateChange will capture the login event. We pass an empty function for compatibility.
  return <AdminLogin onLogin={() => {}} />;
};

export default Admin;
