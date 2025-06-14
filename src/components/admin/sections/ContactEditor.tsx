
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Save, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const ContactEditor = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [contactData, setContactData] = useState({
    email: '',
    phone: '',
    location: ''
  });

  useEffect(() => {
    fetchContactData();
  }, []);

  const fetchContactData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('website_content')
        .select('content_key, content_value')
        .eq('section', 'contact');

      if (error) throw error;

      const contactContent = data.reduce((acc, item) => {
        // Handle both JSON and plain string values
        let value = item.content_value;
        if (typeof value === 'string') {
          try {
            // Try to parse as JSON first
            value = JSON.parse(value);
          } catch {
            // If parsing fails, use the string as is
            value = value;
          }
        }
        acc[item.content_key] = value;
        return acc;
      }, {} as any);

      setContactData({
        email: contactContent.email || '',
        phone: contactContent.phone || '',
        location: contactContent.location || ''
      });
    } catch (error) {
      console.error('Error fetching contact data:', error);
      toast({
        title: "Error",
        description: "Failed to load contact content",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const saveContactData = async () => {
    setSaving(true);
    try {
      const updates = Object.entries(contactData).map(([key, value]) => ({
        section: 'contact',
        content_key: key,
        content_value: JSON.stringify(value)
      }));

      for (const update of updates) {
        const { error } = await supabase
          .from('website_content')
          .upsert(update, { onConflict: 'section,content_key' });

        if (error) throw error;
      }

      toast({
        title: "Success",
        description: "Contact section updated successfully!"
      });
    } catch (error) {
      console.error('Error saving contact data:', error);
      toast({
        title: "Error",
        description: "Failed to save contact content",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="animate-spin text-cyan-400" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4">Contact Section Editor</h1>
        <p className="text-gray-300">Edit your contact information</p>
      </div>

      <div className="bg-slate-800/50 backdrop-blur-md rounded-2xl p-8 border border-slate-700/50">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={contactData.email}
              onChange={(e) => setContactData({ ...contactData, email: e.target.value })}
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600/50 rounded-lg text-white placeholder-gray-400 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-colors"
              placeholder="your.email@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              value={contactData.phone}
              onChange={(e) => setContactData({ ...contactData, phone: e.target.value })}
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600/50 rounded-lg text-white placeholder-gray-400 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-colors"
              placeholder="+91 XXXXXXXXXX"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Location
            </label>
            <input
              type="text"
              value={contactData.location}
              onChange={(e) => setContactData({ ...contactData, location: e.target.value })}
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600/50 rounded-lg text-white placeholder-gray-400 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-colors"
              placeholder="City, State, Country"
            />
          </div>

          <button
            onClick={saveContactData}
            disabled={saving}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save size={20} />
            <span>{saving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContactEditor;
