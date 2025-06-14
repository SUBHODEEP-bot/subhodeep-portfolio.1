
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from "sonner";
import { PlusCircle, Edit, Trash2, Loader2, Upload } from 'lucide-react';

type Award = {
  id: string;
  title: string;
  description: string | null;
  image_url: string;
  issued_date: string | null;
  order: number;
};

const awardSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  issued_date: z.string().optional(),
  order: z.preprocess(
    (a) => parseInt(z.string().parse(a), 10),
    z.number().int().min(0)
  ),
  image_url: z.string().min(1, 'Image is required'),
});

type AwardFormData = z.infer<typeof awardSchema>;

const AwardsEditor = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAward, setEditingAward] = useState<Award | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const { data: awards, isLoading } = useQuery<Award[]>({
    queryKey: ['awards'],
    // Using `as any` because the generated types might not be updated yet.
    queryFn: async () => {
      const { data, error } = await (supabase.from('awards') as any).select('*').order('order', { ascending: true });
      if (error) throw new Error(error.message);
      return data;
    },
  });

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<AwardFormData>({
    resolver: zodResolver(awardSchema),
  });
  
  useEffect(() => {
    if (editingAward) {
      setValue('title', editingAward.title);
      setValue('description', editingAward.description || '');
      setValue('issued_date', editingAward.issued_date ? new Date(editingAward.issued_date).toISOString().split('T')[0] : '');
      setValue('order', editingAward.order);
      setValue('image_url', editingAward.image_url);
    } else {
      reset({ title: '', description: '', issued_date: '', order: 0, image_url: '' });
    }
  }, [editingAward, setValue, reset]);

  const mutation = useMutation({
    mutationFn: async ({ awardData, id }: { awardData: Partial<AwardFormData>, id?: string }) => {
      if (id) {
        const { error } = await (supabase.from('awards') as any).update(awardData).eq('id', id);
        if (error) throw new Error(error.message);
      } else {
        const { error } = await (supabase.from('awards') as any).insert(awardData);
        if (error) throw new Error(error.message);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['awards'] });
      toast.success(editingAward ? 'Award updated successfully!' : 'Award added successfully!');
      setIsDialogOpen(false);
      setEditingAward(null);
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase.from('awards') as any).delete().eq('id', id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['awards'] });
      toast.success('Award deleted successfully!');
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  const handleImageUpload = async (file: File) => {
    if (!file) return;
    setIsUploading(true);
    const fileName = `${Date.now()}_${file.name}`;
    try {
      const { error: uploadError } = await supabase.storage.from('award_images').upload(fileName, file);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('award_images').getPublicUrl(fileName);
      setValue('image_url', publicUrl);
      toast.success('Image uploaded!');
    } catch (error: any) {
      toast.error(`Image upload failed: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };
  
  const onSubmit = (data: AwardFormData) => {
    mutation.mutate({ awardData: data, id: editingAward?.id });
  };

  return (
    <Card className="bg-slate-800/50 border-slate-700 text-white">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Awards & Certificates</CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingAward(null)}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add New
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-900 border-slate-700 text-white">
            <DialogHeader>
              <DialogTitle>{editingAward ? 'Edit' : 'Add'} Award</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Form fields */}
              <div>
                <Label htmlFor="title">Title</Label>
                <Input id="title" {...register('title')} className="bg-slate-800 border-slate-600" />
                {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" {...register('description')} className="bg-slate-800 border-slate-600" />
              </div>
              <div>
                <Label htmlFor="issued_date">Issued Date</Label>
                <Input id="issued_date" type="date" {...register('issued_date')} className="bg-slate-800 border-slate-600" />
              </div>
              <div>
                <Label htmlFor="order">Order</Label>
                <Input id="order" type="number" {...register('order')} className="bg-slate-800 border-slate-600" />
              </div>
              <div>
                <Label htmlFor="image">Image</Label>
                <div className="flex items-center gap-4">
                  <Input 
                    id="image" 
                    type="file" 
                    accept="image/*"
                    onChange={(e) => e.target.files && setImageFile(e.target.files[0])} 
                    className="bg-slate-800 border-slate-600 flex-grow"
                  />
                  <Button type="button" onClick={() => imageFile && handleImageUpload(imageFile)} disabled={!imageFile || isUploading}>
                    {isUploading ? <Loader2 className="animate-spin" /> : <Upload />}
                  </Button>
                </div>
                 {errors.image_url && <p className="text-red-500 text-xs mt-1">{errors.image_url.message}</p>}
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="secondary">Cancel</Button>
                </DialogClose>
                <Button type="submit" disabled={mutation.isPending || isUploading}>
                  {(mutation.isPending || isUploading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingAward ? 'Save Changes' : 'Add Award'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        ) : (
          <div className="space-y-4">
            {awards?.map((award) => (
              <Card key={award.id} className="bg-slate-800 border-slate-700/50 flex items-center p-4">
                <img src={award.image_url} alt={award.title} className="w-20 h-20 object-cover rounded-md mr-4"/>
                <div className="flex-grow">
                  <h3 className="font-bold">{award.title}</h3>
                  <p className="text-sm text-slate-400">{award.description}</p>
                  <p className="text-xs text-slate-500">Issued: {award.issued_date}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" onClick={() => { setEditingAward(award); setIsDialogOpen(true); }}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-400" onClick={() => deleteMutation.mutate(award.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AwardsEditor;
