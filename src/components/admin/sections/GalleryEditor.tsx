
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Save, Plus, Trash2, Upload, RefreshCw, Image as ImageIcon, Video } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface GalleryItem {
  id: string;
  title: string;
  description: string;
  media_url: string;
  media_type: 'image' | 'video';
  thumbnail_url: string;
  featured: boolean;
}

const GalleryEditor = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);

  useEffect(() => {
    fetchGallery();
  }, []);

  const fetchGallery = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('gallery')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGallery(data || []);
    } catch (error) {
      console.error('Error fetching gallery:', error);
      toast({
        title: "Error",
        description: "Failed to load gallery data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addGalleryItem = () => {
    const newItem: GalleryItem = {
      id: '',
      title: '',
      description: '',
      media_url: '',
      media_type: 'image',
      thumbnail_url: '',
      featured: false
    };
    setGallery([...gallery, newItem]);
  };

  const updateGalleryItem = (index: number, field: keyof GalleryItem, value: any) => {
    const updated = [...gallery];
    updated[index] = { ...updated[index], [field]: value };
    setGallery(updated);
  };

  const deleteGalleryItem = async (index: number) => {
    const item = gallery[index];
    if (item.id) {
      try {
        const { error } = await supabase
          .from('gallery')
          .delete()
          .eq('id', item.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Gallery item deleted successfully!"
        });
      } catch (error) {
        console.error('Error deleting gallery item:', error);
        toast({
          title: "Error",
          description: "Failed to delete gallery item",
          variant: "destructive"
        });
        return;
      }
    }

    const updated = gallery.filter((_, i) => i !== index);
    setGallery(updated);
  };

  const saveGallery = async () => {
    setSaving(true);
    try {
      for (const item of gallery) {
        if (!item.title || !item.media_url) continue;

        if (item.id) {
          const { error } = await supabase
            .from('gallery')
            .update({
              title: item.title,
              description: item.description,
              media_url: item.media_url,
              media_type: item.media_type,
              thumbnail_url: item.thumbnail_url,
              featured: item.featured
            })
            .eq('id', item.id);

          if (error) throw error;
        } else {
          const { error } = await supabase
            .from('gallery')
            .insert({
              title: item.title,
              description: item.description,
              media_url: item.media_url,
              media_type: item.media_type,
              thumbnail_url: item.thumbnail_url,
              featured: item.featured
            });

          if (error) throw error;
        }
      }

      await fetchGallery();
      toast({
        title: "Success",
        description: "Gallery updated successfully!"
      });
    } catch (error) {
      console.error('Error saving gallery:', error);
      toast({
        title: "Error",
        description: "Failed to save gallery data",
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
        <h1 className="text-4xl font-bold text-white mb-4">Gallery Editor</h1>
        <p className="text-gray-300">Manage your photos and videos</p>
      </div>

      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-white">Gallery Items</h2>
          <button
            onClick={addGalleryItem}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-300"
          >
            <Plus size={20} />
            <span>Add Media</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {gallery.map((item, index) => (
            <div key={index} className="bg-white/5 rounded-lg p-6 border border-white/10">
              <div className="flex items-center space-x-2 mb-4">
                {item.media_type === 'image' ? (
                  <ImageIcon className="text-cyan-400" size={20} />
                ) : (
                  <Video className="text-purple-400" size={20} />
                )}
                <h3 className="text-lg font-semibold text-white">
                  {item.media_type === 'image' ? 'Image' : 'Video'} #{index + 1}
                </h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={item.title}
                    onChange={(e) => updateGalleryItem(index, 'title', e.target.value)}
                    className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-colors"
                    placeholder="Enter title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Media Type
                  </label>
                  <select
                    value={item.media_type}
                    onChange={(e) => updateGalleryItem(index, 'media_type', e.target.value as 'image' | 'video')}
                    className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-colors"
                  >
                    <option value="image">Image</option>
                    <option value="video">Video</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Media URL *
                  </label>
                  <input
                    type="url"
                    value={item.media_url}
                    onChange={(e) => updateGalleryItem(index, 'media_url', e.target.value)}
                    className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-colors"
                    placeholder="https://example.com/media.jpg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Thumbnail URL (for videos)
                  </label>
                  <input
                    type="url"
                    value={item.thumbnail_url}
                    onChange={(e) => updateGalleryItem(index, 'thumbnail_url', e.target.value)}
                    className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-colors"
                    placeholder="https://example.com/thumbnail.jpg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={item.description}
                    onChange={(e) => updateGalleryItem(index, 'description', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-colors resize-none"
                    placeholder="Description of the media..."
                  />
                </div>

                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id={`featured-${index}`}
                    checked={item.featured}
                    onChange={(e) => updateGalleryItem(index, 'featured', e.target.checked)}
                    className="w-4 h-4 text-cyan-500 bg-white/5 border-white/20 rounded focus:ring-cyan-400 focus:ring-2"
                  />
                  <label htmlFor={`featured-${index}`} className="text-sm text-gray-300">
                    Featured item
                  </label>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-white/10">
                  <button
                    onClick={() => deleteGalleryItem(index)}
                    className="flex items-center space-x-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6">
          <button
            onClick={saveGallery}
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

export default GalleryEditor;
