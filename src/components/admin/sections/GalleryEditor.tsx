
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Save, RefreshCw, UploadCloud, Image as ImageIcon, Video as VideoIcon, Trash2, PlusCircle, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';

interface GalleryItem {
  id: string;
  title: string;
  description: string;
  media_url: string;
  media_type: 'image' | 'video';
  thumbnail_url: string;
  featured: boolean;
  order: number;
  file_name?: string;
}

interface UploadProgress {
  [key: string]: {
    progress: number;
    status: 'uploading' | 'success' | 'error' | 'generating_thumbnail';
    error?: string;
    galleryItemId?: string;
  };
}

const GalleryEditor = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [filesToUpload, setFilesToUpload] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchGalleryItems = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('gallery')
        .select('*')
        .order('order', { ascending: true });

      if (error) throw error;
      
      const typedData = (data || []).map(item => ({
        ...item,
        media_type: item.media_type as 'image' | 'video',
        order: item.order ?? 0
      }));
      
      setGalleryItems(typedData);
    } catch (error) {
      console.error('Error fetching gallery items:', error);
      toast({
        title: "Error",
        description: "Failed to load gallery content",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGalleryItems();
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newFiles = Array.from(event.target.files);
      const validFiles = newFiles.filter(file => {
        const isValidType = file.type.startsWith('image/') || file.type.startsWith('video/');
        const isValidSize = file.size <= 100 * 1024 * 1024; // 100MB
        
        if (!isValidType) {
          toast({
            title: "Invalid File Type",
            description: `${file.name} is not a valid image or video file`,
            variant: "destructive"
          });
          return false;
        }
        
        if (!isValidSize) {
          toast({
            title: "File Too Large",
            description: `${file.name} exceeds 100MB limit`,
            variant: "destructive"
          });
          return false;
        }
        
        return true;
      });
      
      setFilesToUpload(prevFiles => [...prevFiles, ...validFiles.filter(nf => !prevFiles.some(pf => pf.name === nf.name && pf.size === nf.size))]);
    }
  };

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (event.dataTransfer.files) {
      const newFiles = Array.from(event.dataTransfer.files);
      const validFiles = newFiles.filter(file => {
        const isValidType = file.type.startsWith('image/') || file.type.startsWith('video/');
        const isValidSize = file.size <= 100 * 1024 * 1024;
        return isValidType && isValidSize;
      });
      setFilesToUpload(prevFiles => [...prevFiles, ...validFiles.filter(nf => !prevFiles.some(pf => pf.name === nf.name && pf.size === nf.size))]);
    }
  }, []);

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  }, []);

  const removeFileToUpload = (fileName: string) => {
    setFilesToUpload(prev => prev.filter(f => f.name !== fileName));
    setUploadProgress(prev => {
      const newState = { ...prev };
      delete newState[fileName];
      return newState;
    });
  };
  
  const generateVideoThumbnail = async (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.src = URL.createObjectURL(file);
      video.onloadedmetadata = () => {
        video.currentTime = Math.min(1, video.duration / 2);
      };
      video.onseeked = () => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          canvas.toBlob((blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to generate thumbnail blob'));
            }
          }, 'image/jpeg', 0.8);
        } else {
          reject(new Error('Failed to get canvas context for thumbnail'));
        }
        URL.revokeObjectURL(video.src);
      };
      video.onerror = (e) => {
        reject(new Error(`Video error for thumbnail: ${e}`));
        URL.revokeObjectURL(video.src);
      };
    });
  };

  const handleFileUpload = async (file: File) => {
    const fileId = crypto.randomUUID();
    const fileExtension = file.name.split('.').pop();
    const filePath = `media/${fileId}.${fileExtension}`;
    const mediaType = file.type.startsWith('image/') ? 'image' : 'video';

    console.log('Starting upload for:', file.name, 'Type:', mediaType);
    
    setUploadProgress(prev => ({ 
      ...prev, 
      [file.name]: { progress: 10, status: 'uploading' } 
    }));

    try {
      // Upload main file
      console.log('Uploading to path:', filePath);
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('gallery')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type,
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      console.log('Upload successful:', uploadData);
      
      setUploadProgress(prev => ({ 
        ...prev, 
        [file.name]: { ...prev[file.name], progress: 50 } 
      }));

      const { data: publicUrlData } = supabase.storage.from('gallery').getPublicUrl(filePath);
      const media_url = publicUrlData.publicUrl;
      
      console.log('Media URL:', media_url);

      let thumbnail_url = media_url;
      
      // Generate thumbnail for videos
      if (mediaType === 'video') {
        setUploadProgress(prev => ({ 
          ...prev, 
          [file.name]: { ...prev[file.name], status: 'generating_thumbnail', progress: 60 } 
        }));
        
        try {
          const thumbnailBlob = await generateVideoThumbnail(file);
          const thumbFileName = `thumb_${fileId}.jpg`;
          const thumbFilePath = `media/thumbnails/${thumbFileName}`;
          
          const { data: thumbUploadData, error: thumbUploadError } = await supabase.storage
            .from('gallery')
            .upload(thumbFilePath, thumbnailBlob, { contentType: 'image/jpeg' });
            
          if (thumbUploadError) {
            console.warn('Thumbnail upload failed, using media URL:', thumbUploadError);
          } else {
            thumbnail_url = supabase.storage.from('gallery').getPublicUrl(thumbFilePath).data.publicUrl;
            console.log('Thumbnail URL:', thumbnail_url);
          }
        } catch (thumbError) {
          console.warn('Thumbnail generation failed, using media URL:', thumbError);
        }
      }
      
      setUploadProgress(prev => ({ 
        ...prev, 
        [file.name]: { ...prev[file.name], progress: 80 } 
      }));

      // Create database entry
      const newGalleryItem = {
        title: file.name.substring(0, file.name.lastIndexOf('.')) || file.name,
        description: '',
        media_url,
        media_type: mediaType,
        thumbnail_url,
        featured: false,
        order: galleryItems.length,
      };

      console.log('Inserting gallery item:', newGalleryItem);

      const { data: insertedItem, error: insertError } = await supabase
        .from('gallery')
        .insert(newGalleryItem)
        .select()
        .single();

      if (insertError) {
        console.error('Database insert error:', insertError);
        throw new Error(`Database insert failed: ${insertError.message}`);
      }

      console.log('Gallery item created:', insertedItem);

      if (insertedItem) {
        setGalleryItems(prev => [...prev, { 
          ...insertedItem, 
          media_type: insertedItem.media_type as 'image' | 'video', 
          order: insertedItem.order ?? prev.length 
        }]);
        
        setUploadProgress(prev => ({ 
          ...prev, 
          [file.name]: { progress: 100, status: 'success', galleryItemId: insertedItem.id } 
        }));
        
        toast({ 
          title: "Upload Successful", 
          description: `${file.name} uploaded and added to gallery.` 
        });

        // Remove from upload queue after successful upload
        setTimeout(() => {
          removeFileToUpload(file.name);
        }, 2000);
      }

    } catch (error: any) {
      console.error('Error in upload process:', error);
      setUploadProgress(prev => ({ 
        ...prev, 
        [file.name]: { progress: 0, error: error.message, status: 'error' } 
      }));
      toast({
        title: "Upload Failed",
        description: `Failed to upload ${file.name}: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const handleBulkUpload = () => {
    if (filesToUpload.length === 0) {
      toast({
        title: "No Files Selected",
        description: "Please select files to upload first.",
        variant: "destructive"
      });
      return;
    }

    filesToUpload.forEach(file => {
      if (!uploadProgress[file.name] || uploadProgress[file.name]?.status === 'error') {
        handleFileUpload(file);
      }
    });
  };
  
  const updateGalleryItem = (id: string, field: keyof GalleryItem, value: any) => {
    setGalleryItems(prevItems =>
      prevItems.map(item => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const deleteGalleryItem = async (id: string) => {
    const itemToDelete = galleryItems.find(item => item.id === id);
    if (itemToDelete) {
      try {
        // Extract file path from URL for deletion
        const urlParts = itemToDelete.media_url.split('/');
        const storageIndex = urlParts.findIndex(part => part === 'gallery');
        if (storageIndex !== -1 && storageIndex < urlParts.length - 2) {
          const fileNameWithPrefix = urlParts.slice(storageIndex + 2).join('/');
          await supabase.storage.from('gallery').remove([fileNameWithPrefix]);
        }
        
        // Delete thumbnail if different
        if (itemToDelete.thumbnail_url !== itemToDelete.media_url) {
          const thumbUrlParts = itemToDelete.thumbnail_url.split('/');
          const thumbStorageIndex = thumbUrlParts.findIndex(part => part === 'gallery');
          if (thumbStorageIndex !== -1 && thumbStorageIndex < thumbUrlParts.length - 2) {
            const thumbFileNameWithPrefix = thumbUrlParts.slice(thumbStorageIndex + 2).join('/');
            await supabase.storage.from('gallery').remove([thumbFileNameWithPrefix]);
          }
        }
      } catch (storageError) {
        console.warn("Could not delete from storage:", storageError);
      }
    }

    try {
      const { error } = await supabase.from('gallery').delete().eq('id', id);
      if (error) throw error;
      setGalleryItems(prevItems => prevItems.filter(item => item.id !== id));
      toast({ title: "Success", description: "Gallery item deleted." });
    } catch (error) {
      console.error('Error deleting gallery item:', error);
      toast({ title: "Error", description: "Failed to delete gallery item.", variant: "destructive" });
    }
  };

  const saveAllChanges = async () => {
    setSaving(true);
    try {
      const orderedItems = galleryItems.map((item, index) => ({ ...item, order: index }));
      setGalleryItems(orderedItems);

      const updates = orderedItems.map(item => {
        const { file_name, ...dbItem } = item;
        return supabase.from('gallery').update(dbItem).eq('id', item.id);
      });
      
      await Promise.all(updates);
      toast({ title: "Success", description: "All changes saved successfully!" });
    } catch (error) {
      console.error('Error saving gallery changes:', error);
      toast({ title: "Error", description: "Failed to save changes.", variant: "destructive" });
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
        <h1 className="text-4xl font-bold text-white mb-4">Gallery Editor</h1>
        <p className="text-gray-300">Manage your visual media content</p>
      </div>

      {/* Upload Section */}
      <div className="bg-slate-800/50 backdrop-blur-md rounded-2xl p-8 border border-slate-700/50">
        <h2 className="text-2xl font-semibold text-white mb-6">Upload Media</h2>
        <div 
          className="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center cursor-pointer hover:border-cyan-400 transition-colors"
          onClick={() => fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <UploadCloud className="mx-auto text-cyan-400 mb-4" size={48} />
          <p className="text-white mb-2">Drag and drop your images or videos here</p>
          <p className="text-sm text-gray-400 mb-4">Support for JPG, PNG, GIF, MP4, MOV, AVI (max 100MB)</p>
          <Button variant="outline" className="bg-slate-700 hover:bg-slate-600 border-slate-500 text-white">
            Browse Files
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            multiple
            onChange={handleFileChange}
            className="hidden"
            accept="image/*,video/*"
          />
        </div>

        {filesToUpload.length > 0 && (
          <div className="mt-6 space-y-4">
            <h3 className="text-xl font-medium text-white">Files to Upload ({filesToUpload.length})</h3>
            {filesToUpload.map(file => (
              <div key={file.name} className="bg-slate-700/50 p-4 rounded-lg flex items-center justify-between">
                <div className="flex-grow">
                  <div className="flex items-center space-x-2">
                    {file.type.startsWith('image/') ? <ImageIcon className="text-cyan-400" /> : <VideoIcon className="text-purple-400" />}
                    <span className="text-white truncate max-w-xs sm:max-w-md md:max-w-lg">{file.name}</span>
                    <span className="text-xs text-gray-400">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                  </div>
                  {uploadProgress[file.name] && (
                    <div className="mt-2">
                      <Progress value={uploadProgress[file.name]?.progress || 0} className="w-full h-2 [&>*]:bg-cyan-400" />
                      {uploadProgress[file.name]?.status === 'error' && (
                        <p className="text-red-400 text-sm mt-1 flex items-center">
                          <XCircle size={16} className="mr-1" /> {uploadProgress[file.name]?.error}
                        </p>
                      )}
                      {uploadProgress[file.name]?.status === 'uploading' && <p className="text-cyan-400 text-sm mt-1">Uploading...</p>}
                      {uploadProgress[file.name]?.status === 'generating_thumbnail' && <p className="text-yellow-400 text-sm mt-1">Generating thumbnail...</p>}
                      {uploadProgress[file.name]?.status === 'success' && <p className="text-green-400 text-sm mt-1 flex items-center"><CheckCircle size={16} className="mr-1" /> Uploaded successfully!</p>}
                    </div>
                  )}
                </div>
                <Button variant="ghost" size="icon" onClick={() => removeFileToUpload(file.name)} className="text-gray-400 hover:text-red-500">
                  <XCircle size={20} />
                </Button>
              </div>
            ))}
            <Button 
              onClick={handleBulkUpload} 
              disabled={filesToUpload.every(f => uploadProgress[f.name]?.status === 'success' || uploadProgress[f.name]?.status === 'uploading')}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white"
            >
              <UploadCloud size={18} className="mr-2" /> Start Uploads
            </Button>
          </div>
        )}
      </div>

      {/* Gallery Items Editor */}
      <div className="bg-slate-800/50 backdrop-blur-md rounded-2xl p-8 border border-slate-700/50">
        <h2 className="text-2xl font-semibold text-white mb-6">Gallery Items ({galleryItems.length})</h2>
        {galleryItems.length === 0 && !loading && (
          <p className="text-gray-400 text-center py-4">No gallery items yet. Upload some media to get started.</p>
        )}
        <div className="space-y-6">
          {galleryItems.map((item, index) => (
            <div key={item.id} className="bg-slate-700/50 p-6 rounded-lg border border-slate-600/50 flex flex-col md:flex-row gap-6 items-start">
              <div className="flex-shrink-0 w-full md:w-48 h-32 rounded-md overflow-hidden bg-slate-600">
                {item.media_type === 'image' ? (
                  <img src={item.thumbnail_url || item.media_url} alt={item.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="relative w-full h-full">
                    <img src={item.thumbnail_url} alt={`${item.title} thumbnail`} className="w-full h-full object-cover" />
                    <VideoIcon className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white/70" size={32} />
                  </div>
                )}
              </div>
              <div className="flex-grow space-y-3">
                <Input
                  type="text"
                  value={item.title}
                  onChange={(e) => updateGalleryItem(item.id, 'title', e.target.value)}
                  placeholder="Title"
                  className="bg-slate-900/50 border-slate-600/50 text-white focus:border-cyan-400"
                />
                <Textarea
                  value={item.description}
                  onChange={(e) => updateGalleryItem(item.id, 'description', e.target.value)}
                  placeholder="Description (optional)"
                  rows={2}
                  className="bg-slate-900/50 border-slate-600/50 text-white resize-none focus:border-cyan-400"
                />
                <div className="flex items-center space-x-3">
                  <label className="text-sm text-gray-300 flex items-center">
                    <input
                      type="checkbox"
                      checked={item.featured}
                      onChange={(e) => updateGalleryItem(item.id, 'featured', e.target.checked)}
                      className="mr-2 h-4 w-4 rounded border-gray-300 text-cyan-500 focus:ring-cyan-500"
                    />
                    Featured
                  </label>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => deleteGalleryItem(item.id)} className="text-gray-400 hover:text-red-500 md:ml-auto">
                <Trash2 size={20} />
              </Button>
            </div>
          ))}
        </div>
        {galleryItems.length > 0 && (
          <Button
            onClick={saveAllChanges}
            disabled={saving}
            className="mt-8 flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 disabled:opacity-50"
          >
            <Save size={20} />
            <span>{saving ? 'Saving All Changes...' : 'Save All Changes'}</span>
          </Button>
        )}
      </div>
    </div>
  );
};

export default GalleryEditor;
