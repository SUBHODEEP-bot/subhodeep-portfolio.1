
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Award, Plus, Edit, Trash, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { type Database } from '@/integrations/supabase/types';

type AwardItem = Database['public']['Tables']['awards']['Row'];

const fetchAwards = async () => {
  const { data, error } = await supabase.from('awards').select('*').order('order', { ascending: true });
  if (error) throw new Error(error.message);
  return data;
};

const AwardsEditor = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedAward, setSelectedAward] = useState<AwardItem | null>(null);

  const { data: awards, isLoading, error } = useQuery({
    queryKey: ['awards'],
    queryFn: fetchAwards,
  });

  const mutation = useMutation({
    mutationFn: async ({ award, imageFile }: { award: Omit<AwardItem, 'id' | 'created_at' | 'updated_at'>, imageFile?: File }) => {
      let imageUrl = award.image_url;

      if (imageFile) {
        const filePath = `public/${Date.now()}-${imageFile.name}`;
        const { error: uploadError } = await supabase.storage.from('awards').upload(filePath, imageFile);
        if (uploadError) throw new Error(`Image upload failed: ${uploadError.message}`);
        
        const { data: { publicUrl } } = supabase.storage.from('awards').getPublicUrl(filePath);
        imageUrl = publicUrl;
      }

      if (!imageUrl) throw new Error("Image is required.");

      const awardData = { ...award, image_url: imageUrl };

      if (selectedAward) {
        // Update
        const { error } = await supabase.from('awards').update(awardData).eq('id', selectedAward.id);
        if (error) throw new Error(error.message);
      } else {
        // Create
        const { error } = await supabase.from('awards').insert(awardData);
        if (error) throw new Error(error.message);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['awards'] });
      toast({ title: 'Success', description: `Award ${selectedAward ? 'updated' : 'saved'} successfully.` });
      setIsFormOpen(false);
      setSelectedAward(null);
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (awardToDelete: AwardItem) => {
      // Delete from DB
      const { error: dbError } = await supabase.from('awards').delete().eq('id', awardToDelete.id);
      if (dbError) throw new Error(`Database delete failed: ${dbError.message}`);
      
      // Delete from Storage
      const path = awardToDelete.image_url.split('/').pop();
      if(path) {
        const { error: storageError } = await supabase.storage.from('awards').remove([`public/${path}`]);
        // Don't throw error if file not found, it might have been cleaned up
        if (storageError && storageError.message !== 'The resource was not found') {
            console.warn(`Could not delete file from storage: ${storageError.message}`);
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['awards'] });
      toast({ title: 'Success', description: 'Award deleted successfully.' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });
  
  const handleEdit = (award: AwardItem) => {
    setSelectedAward(award);
    setIsFormOpen(true);
  };

  const handleAddNew = () => {
    setSelectedAward(null);
    setIsFormOpen(true);
  };
  
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const imageFile = formData.get('image') as File;

    const awardData: Omit<AwardItem, 'id' | 'created_at' | 'updated_at'> = {
        title: formData.get('title') as string,
        description: formData.get('description') as string,
        issued_date: formData.get('issued_date') as string || null,
        image_url: selectedAward?.image_url || '',
        order: selectedAward?.order || 0,
    };
    
    mutation.mutate({ award: awardData, imageFile: imageFile.size > 0 ? imageFile : undefined });
  };

  return (
    <Card className="border-slate-700 bg-slate-800/50 text-white">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-2xl flex items-center gap-2"><Award />Awards & Certificates</CardTitle>
          <CardDescription>Manage your awards and certificates.</CardDescription>
        </div>
        <Button onClick={handleAddNew}><Plus className="mr-2 h-4 w-4" /> Add New</Button>
      </CardHeader>
      <CardContent>
        {isLoading && <div className="flex justify-center p-8"><Loader2 className="animate-spin" size={32} /></div>}
        {error && <p className="text-red-500">{error.message}</p>}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {awards?.map(award => (
            <Card key={award.id} className="bg-slate-900/50 border-slate-700">
              <img src={award.image_url} alt={award.title} className="w-full h-40 object-cover rounded-t-lg"/>
              <CardHeader>
                <CardTitle>{award.title}</CardTitle>
                <CardDescription>{award.issued_date}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{award.description}</p>
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => handleEdit(award)}><Edit className="mr-2 h-4 w-4" /> Edit</Button>
                <Button variant="destructive" size="sm" onClick={() => deleteMutation.mutate(award)} disabled={deleteMutation.isPending}><Trash className="mr-2 h-4 w-4" /> Delete</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </CardContent>
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="bg-slate-900 text-white border-slate-700">
          <DialogHeader>
            <DialogTitle>{selectedAward ? 'Edit Award' : 'Add New Award'}</DialogTitle>
            <DialogDescription>Fill in the details below.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" name="title" defaultValue={selectedAward?.title} required className="bg-slate-800 border-slate-600" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" name="description" defaultValue={selectedAward?.description || ''} className="bg-slate-800 border-slate-600" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="issued_date">Issued Date</Label>
              <Input id="issued_date" name="issued_date" type="date" defaultValue={selectedAward?.issued_date || ''} className="bg-slate-800 border-slate-600" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="image">Image</Label>
              <Input id="image" name="image" type="file" accept="image/*" className="bg-slate-800 border-slate-600 file:text-white" />
              {selectedAward?.image_url && <img src={selectedAward.image_url} alt="Current" className="w-24 h-24 mt-2 object-cover rounded"/>}
            </div>
            <DialogFooter>
              <DialogClose asChild><Button type="button" variant="secondary">Cancel</Button></DialogClose>
              <Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? 'Saving...' : 'Save'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default AwardsEditor;
