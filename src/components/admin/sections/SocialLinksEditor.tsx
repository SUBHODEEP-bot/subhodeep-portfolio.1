
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Save, RefreshCw, PlusCircle, Trash2, Link as LinkIcon, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface SocialLink {
  id: string; // For local state management (React keys)
  platform: string;
  url: string;
  icon: string; // Lucide icon name e.g., 'Github', 'Linkedin'
}

const SocialLinksEditor = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);

  const knownIcons = ['Github', 'Linkedin', 'Youtube', 'Twitter', 'Instagram', 'Facebook', 'Gitlab', 'Dribbble', 'Behance', 'Codepen']; // Add more as needed

  useEffect(() => {
    fetchSocialLinks();
  }, []);

  const fetchSocialLinks = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('website_content')
        .select('content_value')
        .eq('section', 'social_links')
        .eq('content_key', 'links')
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116: Not found, which is fine
        throw error;
      }

      if (data && data.content_value) {
        let parsedLinks = data.content_value;
        if (typeof parsedLinks === 'string') {
          try {
            parsedLinks = JSON.parse(parsedLinks);
          } catch (e) {
            console.error("Failed to parse social links JSON:", e);
            parsedLinks = [];
          }
        }
        setSocialLinks(Array.isArray(parsedLinks) ? parsedLinks.map((link: any) => ({ ...link, id: crypto.randomUUID() })) : []);
      } else {
        setSocialLinks([]); // Default to empty or some initial links
      }
    } catch (error: any) {
      console.error('Error fetching social links:', error);
      toast({
        title: "Error",
        description: `Failed to load social links: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddLink = () => {
    setSocialLinks([...socialLinks, { id: crypto.randomUUID(), platform: '', url: '', icon: '' }]);
  };

  const handleUpdateLink = (id: string, field: keyof Omit<SocialLink, 'id'>, value: string) => {
    setSocialLinks(socialLinks.map(link => link.id === id ? { ...link, [field]: value } : link));
  };

  const handleDeleteLink = (id: string) => {
    setSocialLinks(socialLinks.filter(link => link.id !== id));
  };

  const saveSocialLinks = async () => {
    setSaving(true);
    // Filter out empty links before saving
    const validLinks = socialLinks.filter(link => link.platform.trim() && link.url.trim() && link.icon.trim());
    const linksToSave = validLinks.map(({ id, ...rest }) => rest); // Remove client-side id

    try {
      const { error } = await supabase
        .from('website_content')
        .upsert({
          section: 'social_links',
          content_key: 'links',
          content_value: JSON.stringify(linksToSave)
        }, { onConflict: 'section,content_key' });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Social links updated successfully!"
      });
      // Re-fetch or update local state to ensure consistency if needed, e.g. remove invalid ones.
      setSocialLinks(validLinks.map(link => ({...link, id: link.id || crypto.randomUUID() })));


    } catch (error: any) {
      console.error('Error saving social links:', error);
      toast({
        title: "Error",
        description: `Failed to save social links: ${error.message}`,
        variant: "destructive",
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
        <h1 className="text-4xl font-bold text-white mb-4">Social Links Editor</h1>
        <p className="text-gray-300">Manage links to your social media profiles.</p>
      </div>
      
      <div className="bg-slate-800/50 backdrop-blur-md rounded-2xl p-8 border border-slate-700/50">
        <div className="mb-4 p-4 bg-slate-700/50 rounded-lg border border-slate-600 flex items-start">
          <Info size={20} className="text-cyan-400 mr-3 mt-1 flex-shrink-0" />
          <div>
            <p className="text-sm text-gray-200">
              For the 'Icon Name', use exact Lucide icon names (case-sensitive). Examples: 
            </p>
            <p className="text-xs text-gray-400 mt-1">
              <code>Github</code>, <code>Linkedin</code>, <code>Youtube</code>, <code>Twitter</code>, <code>Instagram</code>, <code>Facebook</code>. Ensure the icon exists in <code>lucide-react</code>.
            </p>
          </div>
        </div>

        {socialLinks.map((link) => (
          <div key={link.id} className="space-y-4 p-4 mb-4 border border-slate-700 rounded-lg bg-slate-900/30">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor={`platform-${link.id}`} className="text-gray-300">Platform Name</Label>
                <Input
                  id={`platform-${link.id}`}
                  type="text"
                  placeholder="e.g., GitHub"
                  value={link.platform}
                  onChange={(e) => handleUpdateLink(link.id, 'platform', e.target.value)}
                  className="w-full mt-1 bg-slate-800 border-slate-600 text-white placeholder-gray-500 focus:border-cyan-400"
                />
              </div>
              <div>
                <Label htmlFor={`url-${link.id}`} className="text-gray-300">URL</Label>
                <Input
                  id={`url-${link.id}`}
                  type="url"
                  placeholder="https://github.com/yourprofile"
                  value={link.url}
                  onChange={(e) => handleUpdateLink(link.id, 'url', e.target.value)}
                  className="w-full mt-1 bg-slate-800 border-slate-600 text-white placeholder-gray-500 focus:border-cyan-400"
                />
              </div>
              <div>
                <Label htmlFor={`icon-${link.id}`} className="text-gray-300">Icon Name (Lucide)</Label>
                 <Input
                  id={`icon-${link.id}`}
                  type="text"
                  placeholder="e.g., Github"
                  value={link.icon}
                  onChange={(e) => handleUpdateLink(link.id, 'icon', e.target.value)}
                  className="w-full mt-1 bg-slate-800 border-slate-600 text-white placeholder-gray-500 focus:border-cyan-400"
                  list="known-icons"
                />
                <datalist id="known-icons">
                  {knownIcons.map(iconName => <option key={iconName} value={iconName} />)}
                </datalist>
              </div>
            </div>
            <Button variant="ghost" onClick={() => handleDeleteLink(link.id)} className="text-red-500 hover:text-red-400 px-2 py-1">
              <Trash2 size={18} className="mr-1" /> Remove
            </Button>
          </div>
        ))}
        
        <div className="flex items-center justify-between mt-6">
          <Button onClick={handleAddLink} variant="outline" className="text-cyan-400 border-cyan-400 hover:bg-cyan-400/10">
            <PlusCircle size={18} className="mr-2" /> Add Link
          </Button>
          <Button
            onClick={saveSocialLinks}
            disabled={saving}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 disabled:opacity-50"
          >
            <Save size={20} />
            <span>{saving ? 'Saving...' : 'Save Social Links'}</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SocialLinksEditor;
