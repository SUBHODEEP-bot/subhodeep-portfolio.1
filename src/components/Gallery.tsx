
import React, { useEffect, useState } from 'react';
import { Play, Image as ImageIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import ImageModal from './ImageModal';

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
        console.log('Fetching gallery items...');
        const { data, error } = await supabase
          .from('gallery')
          .select('*')
          .order('featured', { ascending: false })
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Gallery fetch error:', error);
          throw error;
        }
        
        console.log('Gallery items fetched:', data);
        
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

  const handleImageClick = (item: GalleryItem) => {
    setSelectedItem(item);
  };

  const closeModal = () => {
    setSelectedItem(null);
  };

  if (loading) {
    return (
      <div className="relative py-12 sm:py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="animate-pulse">
            <div className="h-8 bg-white/20 rounded mb-4 mx-auto w-48"></div>
            <div className="h-4 bg-white/10 rounded mx-auto w-96"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-16">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white/10 rounded-2xl h-80 animate-pulse"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (gallery.length === 0) {
    return (
      <div className="relative py-12 sm:py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
            Gallery
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-cyan-400 to-purple-500 mx-auto mb-6"></div>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-12 border border-white/20">
            <ImageIcon className="mx-auto mb-4 text-gray-400" size={64} />
            <p className="text-gray-300 text-lg">No gallery items available yet.</p>
            <p className="text-gray-400 text-sm mt-2">Check back soon for updates!</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative py-12 sm:py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8 sm:mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-3 sm:mb-4">
            Gallery
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-cyan-400 to-purple-500 mx-auto"></div>
          <p className="text-gray-300 mt-4 sm:mt-6 max-w-2xl mx-auto">
            A collection of moments, memories, and creative works
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {gallery.map((item) => (
            <div
              key={item.id}
              className="group relative bg-white/10 backdrop-blur-md rounded-2xl overflow-hidden border border-white/20 hover:border-cyan-400/50 transition-all duration-300 cursor-pointer"
              onClick={() => handleImageClick(item)}
            >
              <div className="relative aspect-square overflow-hidden">
                <img
                  src={item.media_type === 'video' ? item.thumbnail_url : item.media_url}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    console.error('Image load error for:', item.title, item.media_url);
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
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

        {/* Image/Video Modal */}
        {selectedItem && (
          <ImageModal
            isOpen={!!selectedItem}
            onClose={closeModal}
            imageUrl={selectedItem.media_type === 'video' ? selectedItem.media_url : selectedItem.media_url}
            imageAlt={selectedItem.title}
            title={selectedItem.title}
          />
        )}
      </div>
    </div>
  );
};

export default Gallery;
