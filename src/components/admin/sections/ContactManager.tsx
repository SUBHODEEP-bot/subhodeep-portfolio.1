
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Save, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ContactMessagesViewer from './ContactMessagesViewer';

const ContactManager = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [contactData, setContactData] = useState({
    email: '',
    phone: '',
    location: '',
    resume_url: '',
    socials: {
      linkedin: '',
      github: '',
      youtube: '',
    },
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
        let value = item.content_value;
        if (typeof value === 'string') {
          try {
            value = JSON.parse(value);
          } catch {
            // If parsing fails, use the string as is
          }
        }
        acc[item.content_key] = value;
        return acc;
      }, {} as any);

      setContactData({
        email: contactContent.email || '',
        phone: contactContent.phone || '',
        location: contactContent.location || '',
        resume_url: contactContent.resume_url || '',
        socials: contactContent.socials || { linkedin: '', github: '', youtube: '' },
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
        content_value: value,
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
  
  const handleSocialChange = (e: React.ChangeEvent<HTMLInputElement>, platform: 'linkedin' | 'github' | 'youtube') => {
    setContactData(prev => ({
      ...prev,
      socials: {
        ...prev.socials,
        [platform]: e.target.value
      }
    }));
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
        <h1 className="text-4xl font-bold text-white mb-4">Contact Section Manager</h1>
        <p className="text-gray-300">Edit contact details and view incoming messages</p>
      </div>
      
      <Tabs defaultValue="details" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="details">Contact Details</TabsTrigger>
          <TabsTrigger value="messages">Messages</TabsTrigger>
        </TabsList>
        <TabsContent value="details">
          <div className="bg-slate-800/50 backdrop-blur-md rounded-2xl p-8 border border-slate-700/50 mt-4">
            <div className="space-y-6">
              {/* Contact Info */}
              <h3 className="text-xl font-semibold text-white border-b border-slate-700 pb-2">Contact Information</h3>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
                <input type="email" value={contactData.email} onChange={(e) => setContactData({ ...contactData, email: e.target.value })} className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600/50 rounded-lg text-white placeholder-gray-400 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-colors" placeholder="your.email@example.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Phone Number</label>
                <input type="tel" value={contactData.phone} onChange={(e) => setContactData({ ...contactData, phone: e.target.value })} className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600/50 rounded-lg text-white placeholder-gray-400 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-colors" placeholder="+91 XXXXXXXXXX" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Location</label>
                <input type="text" value={contactData.location} onChange={(e) => setContactData({ ...contactData, location: e.target.value })} className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600/50 rounded-lg text-white placeholder-gray-400 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-colors" placeholder="City, State, Country" />
              </div>

              {/* Social and Resume Links */}
              <h3 className="text-xl font-semibold text-white border-b border-slate-700 pb-2 pt-4">Links</h3>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Resume URL</label>
                <input type="text" value={contactData.resume_url} onChange={(e) => setContactData({ ...contactData, resume_url: e.target.value })} className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600/50 rounded-lg text-white placeholder-gray-400 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-colors" placeholder="URL to your resume PDF" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">LinkedIn URL</label>
                <input type="text" value={contactData.socials.linkedin} onChange={(e) => handleSocialChange(e, 'linkedin')} className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600/50 rounded-lg text-white placeholder-gray-400 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-colors" placeholder="https://linkedin.com/in/..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">GitHub URL</label>
                <input type="text" value={contactData.socials.github} onChange={(e) => handleSocialChange(e, 'github')} className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600/50 rounded-lg text-white placeholder-gray-400 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-colors" placeholder="https://github.com/..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">YouTube URL</label>
                <input type="text" value={contactData.socials.youtube} onChange={(e) => handleSocialChange(e, 'youtube')} className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600/50 rounded-lg text-white placeholder-gray-400 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-colors" placeholder="https://youtube.com/c/..." />
              </div>

              <button onClick={saveContactData} disabled={saving} className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed">
                <Save size={20} />
                <span>{saving ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="messages">
          <ContactMessagesViewer />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ContactManager;
