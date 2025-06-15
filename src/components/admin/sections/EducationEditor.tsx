import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Save, Plus, Trash2, Upload, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Education {
  id: string;
  institution: string;
  degree: string;
  field_of_study: string;
  start_date: string;
  end_date: string;
  description: string;
  certificate_url: string;
}

const EducationEditor = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [education, setEducation] = useState<Education[]>([]);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    fetchEducation();
    checkUserRole();
  }, []);

  const checkUserRole = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      console.log('Current user:', user);
      
      if (user) {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        
        console.log('User profile:', profile);
        console.log('Profile error:', error);
        setUserRole(profile?.role || null);
      }
    } catch (error) {
      console.error('Error checking user role:', error);
    }
  };

  const fetchEducation = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('education')
        .select('*')
        .order('start_date', { ascending: false });

      console.log('Fetch education data:', data);
      console.log('Fetch education error:', error);

      if (error) throw error;
      setEducation(data || []);
    } catch (error) {
      console.error('Error fetching education:', error);
      toast({
        title: "Error",
        description: "Failed to load education data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addEducation = () => {
    const newEducation: Education = {
      id: `temp-${Date.now()}`,
      institution: '',
      degree: '',
      field_of_study: '',
      start_date: '',
      end_date: '',
      description: '',
      certificate_url: ''
    };
    setEducation([...education, newEducation]);
  };

  const updateEducation = (index: number, field: keyof Education, value: string) => {
    const updated = [...education];
    updated[index] = { ...updated[index], [field]: value };
    setEducation(updated);
  };

  const deleteEducation = async (index: number) => {
    const educationItem = education[index];
    if (educationItem.id && !educationItem.id.startsWith('temp-')) {
      try {
        const { error } = await supabase
          .from('education')
          .delete()
          .eq('id', educationItem.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Education item deleted successfully!"
        });
      } catch (error) {
        console.error('Error deleting education:', error);
        toast({
          title: "Error",
          description: "Failed to delete education item",
          variant: "destructive"
        });
        return;
      }
    }

    const updated = education.filter((_, i) => i !== index);
    setEducation(updated);
  };

  const saveEducation = async () => {
    setSaving(true);
    try {
      console.log('Starting save operation...');
      console.log('User role:', userRole);
      
      // First check authentication
      const { data: { user } } = await supabase.auth.getUser();
      console.log('Auth user during save:', user);
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const validEducation = education.filter(item => item.institution && item.degree);
      console.log('Valid education items to save:', validEducation);

      if (validEducation.length === 0) {
        toast({
          title: "Warning",
          description: "No valid education items to save",
          variant: "destructive"
        });
        return;
      }

      // Prepare items for upsert
      const itemsToSave = validEducation.map(item => {
        const record = {
          institution: item.institution,
          degree: item.degree,
          field_of_study: item.field_of_study,
          start_date: item.start_date || null,
          end_date: item.end_date || null,
          description: item.description,
          certificate_url: item.certificate_url,
        };
        
        // Include ID only for existing items (not temp ones)
        if (!item.id.startsWith('temp-')) {
          return { ...record, id: item.id };
        }
        
        return record;
      });

      console.log('Items to save:', itemsToSave);

      // Try to save each item individually to get better error messages
      for (const item of itemsToSave) {
        console.log('Saving item:', item);
        
        const { data, error } = await supabase
          .from('education')
          .upsert(item)
          .select();
        
        console.log('Save result:', { data, error });
        
        if (error) {
          console.error('Individual save error:', error);
          throw error;
        }
      }

      await fetchEducation();
      toast({
        title: "Success",
        description: "Education timeline updated successfully!"
      });
    } catch (error) {
      console.error('Error saving education:', error);
      toast({
        title: "Error",
        description: `Failed to save education data: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="animate-spin text-white" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4">Education Timeline Editor</h1>
        <p className="text-gray-300">Manage your educational background and achievements</p>
        {userRole && (
          <p className="text-cyan-400 mt-2">Current role: {userRole}</p>
        )}
      </div>

      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-white">Education Items</h2>
          <button
            onClick={addEducation}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-300"
          >
            <Plus size={20} />
            <span>Add Education</span>
          </button>
        </div>

        <div className="space-y-6">
          {education.map((item, index) => (
            <div key={item.id} className="bg-white/5 rounded-lg p-6 border border-white/10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Institution *
                  </label>
                  <input
                    type="text"
                    value={item.institution}
                    onChange={(e) => updateEducation(index, 'institution', e.target.value)}
                    className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-colors"
                    placeholder="University of Engineering"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Degree *
                  </label>
                  <input
                    type="text"
                    value={item.degree}
                    onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                    className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-colors"
                    placeholder="Bachelor of Technology"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Field of Study
                  </label>
                  <input
                    type="text"
                    value={item.field_of_study}
                    onChange={(e) => updateEducation(index, 'field_of_study', e.target.value)}
                    className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-colors"
                    placeholder="Computer Science"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Certificate URL
                  </label>
                  <input
                    type="url"
                    value={item.certificate_url}
                    onChange={(e) => updateEducation(index, 'certificate_url', e.target.value)}
                    className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-colors"
                    placeholder="https://example.com/certificate.pdf"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={item.start_date}
                    onChange={(e) => updateEducation(index, 'start_date', e.target.value)}
                    className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={item.end_date}
                    onChange={(e) => updateEducation(index, 'end_date', e.target.value)}
                    className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-colors"
                  />
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={item.description}
                  onChange={(e) => updateEducation(index, 'description', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-colors resize-none"
                  placeholder="Description of your studies and achievements..."
                />
              </div>
              <button
                onClick={() => deleteEducation(index)}
                className="flex items-center space-x-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
              >
                <Trash2 size={16} />
                <span>Delete</span>
              </button>
            </div>
          ))}
        </div>

        <div className="mt-6">
          <button
            onClick={saveEducation}
            disabled={saving}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save size={20} />
            <span>{saving ? 'Saving...' : 'Save All Changes'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default EducationEditor;
