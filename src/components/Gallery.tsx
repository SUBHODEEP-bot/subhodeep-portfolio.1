
import React, { useEffect, useState } from 'react';
import { Play } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface GalleryItem {
  id: string;
  title: string;
  description: string;
  media_url: string;
  media_type: 'image' | 'video';
  thumbnail_url: string;
  featured: boolean;
}

const Gallery = () => {
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const { data, error } = await supabase
          .from('gallery')
          .select('*')
          .order('featured', { ascending: false })
          .order('created_at', { ascending: false });

        if (error) throw error;
        
        // Type assertion to ensure media_type is properly typed
        const typedData = (data || []).map(item => ({
          ...item,
          media_type: item.media_type as 'image' | 'video'
        }));
        
        setGallery(typedData);
      } catch (error) {
        console.error('Error fetching gallery:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGallery();
  }, []);

  if (loading) {
    return (
      <div className="relative py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="animate-pulse">
            <div className="h-8 bg-white/20 rounded mb-4"></div>
            <div className="h-4 bg-white/10 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (gallery.length === 0) {
    return null;
  }

  return (
    <div className="relative py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Gallery
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-cyan-400 to-purple-500 mx-auto"></div>
          <p className="text-gray-300 mt-6 max-w-2xl mx-auto">
            A collection of moments, memories, and creative works
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {gallery.map((item) => (
            <div
              key={item.id}
              className="group relative bg-white/10 backdrop-blur-md rounded-2xl overflow-hidden border border-white/20 hover:border-cyan-400/50 transition-all duration-300 cursor-pointer"
              onClick={() => setSelectedItem(item)}
            >
              <div className="relative aspect-square overflow-hidden">
                <img
                  src={item.media_type === 'video' ? item.thumbnail_url : item.media_url}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                
                {item.media_type === 'video' && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center group-hover:bg-white/30 transition-colors">
                      <Play className="text-white ml-1" size={24} />
                    </div>
                  </div>
                )}

                {item.featured && (
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-sm font-medium rounded-full">
                      Featured
                    </span>
                  </div>
                )}
              </div>

              <div className="p-6">
                <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                {item.description && (
                  <p className="text-gray-300 text-sm line-clamp-2">{item.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Modal */}
        {selectedItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
            <div className="relative max-w-4xl w-full max-h-[90vh] bg-white/10 backdrop-blur-md rounded-2xl overflow-hidden border border-white/20">
              <button
                onClick={() => setSelectedItem(null)}
                className="absolute top-4 right-4 z-10 w-10 h-10 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
              >
                ×
              </button>

              <div className="aspect-video">
                {selectedItem.media_type === 'video' ? (
                  <video
                    src={selectedItem.media_url}
                    controls
                    className="w-full h-full object-cover"
                    poster={selectedItem.thumbnail_url}
                  />
                ) : (
                  <img
                    src={selectedItem.media_url}
                    alt={selectedItem.title}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>

              <div className="p-6">
                <h3 className="text-2xl font-bold text-white mb-2">{selectedItem.title}</h3>
                {selectedItem.description && (
                  <p className="text-gray-300">{selectedItem.description}</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Gallery;
