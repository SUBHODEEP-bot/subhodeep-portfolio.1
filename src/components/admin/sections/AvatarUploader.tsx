
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Upload, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const AvatarUploader = () => {
    const [uploading, setUploading] = useState(false);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const { toast } = useToast();
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);

    // Fetch current avatar
    useEffect(() => {
        const fetchAvatar = async () => {
            const { data, error } = await supabase
                .from('website_content')
                .select('content_value')
                .eq('section', 'hero')
                .eq('content_key', 'avatar_url')
                .maybeSingle();
            
            if (data && typeof data.content_value === 'string') {
                setAvatarUrl(data.content_value);
            }
        };
        fetchAvatar();
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const selectedFile = e.target.files[0];
            setFile(selectedFile);
            setPreview(URL.createObjectURL(selectedFile));
        }
    };

    const handleUpload = async () => {
        if (!file) {
            toast({ title: "No file selected", description: "Please select an image to upload.", variant: "destructive" });
            return;
        }

        setUploading(true);
        try {
            const fileName = `profile-${Date.now()}`;
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(fileName, file, {
                    cacheControl: '3600',
                    upsert: false,
                });

            if (uploadError) throw uploadError;

            const { data: urlData } = supabase.storage
                .from('avatars')
                .getPublicUrl(uploadData.path);
            
            const publicUrl = urlData.publicUrl;

            const { error: dbError } = await supabase
                .from('website_content')
                .upsert({
                    section: 'hero',
                    content_key: 'avatar_url',
                    content_value: publicUrl
                }, { onConflict: 'section,content_key' });

            if (dbError) throw dbError;

            setAvatarUrl(publicUrl);
            setFile(null);
            setPreview(null);
            toast({ title: "Success!", description: "Your new profile picture has been uploaded." });

        } catch (error: any) {
            toast({ title: "Upload failed", description: error.message, variant: "destructive" });
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="bg-slate-800/50 p-6 rounded-2xl mb-6 border border-slate-700">
            <h3 className="text-xl font-semibold text-white mb-4">Profile Picture</h3>
            <div className="flex items-center gap-6">
                <Avatar className="h-24 w-24">
                    <AvatarImage src={preview || avatarUrl || undefined} alt="Admin Avatar" />
                    <AvatarFallback className="bg-slate-700 text-white">
                        <ImageIcon size={40} />
                    </AvatarFallback>
                </Avatar>
                <div className="flex-grow">
                    <div className="flex items-center gap-4">
                        <label htmlFor="avatar-upload" className="cursor-pointer px-4 py-2 bg-slate-700 text-white font-semibold rounded-lg hover:bg-slate-600 transition-colors">
                            {file ? 'Change Image' : 'Choose Image'}
                        </label>
                        <input id="avatar-upload" type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                        {file && <span className="text-gray-400 text-sm max-w-xs truncate">{file.name}</span>}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Recommended size: 400x400px. Max 2MB.</p>
                </div>
                 <button
                    onClick={handleUpload}
                    disabled={uploading || !file}
                    className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                    {uploading ? (
                        <>
                            <Loader2 className="animate-spin" size={18} />
                            Uploading...
                        </>
                    ) : (
                        <>
                            <Upload size={18} />
                            Upload
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default AvatarUploader;
