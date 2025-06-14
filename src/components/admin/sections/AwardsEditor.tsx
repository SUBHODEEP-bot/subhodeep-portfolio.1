
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { PlusCircle, Edit, Trash2, Loader2, Upload } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type Award = Database['public']['Tables']['awards']['Row'];

const awardSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  issued_date: z.string().optional(),
  image_url: z.string().min(1, 'Image is required'),
});

const AWARDS_BUCKET = 'awards';

const AwardsEditor = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedAward, setSelectedAward] = useState<Award | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof awardSchema>>({
    resolver: zodResolver(awardSchema),
    defaultValues: {
      title: '',
      description: '',
      issued_date: '',
      image_url: '',
    },
  });

  useEffect(() => {
    if (selectedAward) {
      form.reset({
        title: selectedAward.title,
        description: selectedAward.description || '',
        issued_date: selectedAward.issued_date ? new Date(selectedAward.issued_date).toISOString().split('T')[0] : '',
        image_url: selectedAward.image_url,
      });
    } else {
      form.reset({ title: '', description: '', issued_date: '', image_url: '' });
    }
  }, [selectedAward, form]);

  const { data: awards, isLoading: isLoadingAwards } = useQuery({
    queryKey: ['awards'],
    queryFn: async () => {
      const { data, error } = await supabase.from('awards').select('*').order('order', { ascending: true });
      if (error) throw new Error(error.message);
      return data;
    },
  });

  const upsertMutation = useMutation({
    mutationFn: async (values: z.infer<typeof awardSchema>) => {
      const { data, error } = await supabase
        .from('awards')
        .upsert({
          id: selectedAward?.id,
          ...values,
          issued_date: values.issued_date || null,
        })
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      toast.success(selectedAward ? 'Award updated successfully!' : 'Award added successfully!');
      queryClient.invalidateQueries({ queryKey: ['awards'] });
      setIsDialogOpen(false);
      setSelectedAward(null);
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('awards').delete().eq('id', id);
      if (error) throw new Error(error.message);
    },
    onSuccess: (_, id) => {
      toast.success('Award deleted successfully!');
      queryClient.invalidateQueries({ queryKey: ['awards'] });
      // Also delete image from storage
      const awardToDelete = awards?.find(a => a.id === id);
      if (awardToDelete) {
        const fileName = awardToDelete.image_url.split('/').pop();
        if (fileName) {
          supabase.storage.from(AWARDS_BUCKET).remove([fileName]);
        }
      }
    },
    onError: (error) => {
      toast.error(`Error deleting award: ${error.message}`);
    },
  });

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const fileName = `${Date.now()}-${file.name}`;
    try {
      const { error: uploadError } = await supabase.storage.from(AWARDS_BUCKET).upload(fileName, file);
      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from(AWARDS_BUCKET).getPublicUrl(fileName);
      form.setValue('image_url', data.publicUrl);
      toast.success('Image uploaded successfully!');
    } catch (error: any) {
      toast.error('Image upload failed: ' + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const onSubmit = (values: z.infer<typeof awardSchema>) => {
    upsertMutation.mutate(values);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-white">Awards & Certificates</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setSelectedAward(null)}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add Award
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] bg-slate-900 text-white border-slate-700">
            <DialogHeader>
              <DialogTitle>{selectedAward ? 'Edit Award' : 'Add New Award'}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input {...field} className="bg-slate-800 border-slate-600" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea {...field} className="bg-slate-800 border-slate-600" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="issued_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Issued Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} className="bg-slate-800 border-slate-600" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="image_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Image</FormLabel>
                      <FormControl>
                        <>
                          <Input
                            type="file"
                            id="image-upload"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="hidden"
                          />
                          <div className="flex items-center gap-4">
                            <label htmlFor="image-upload" className="cursor-pointer">
                              <Button type="button" variant="outline" asChild>
                                <span>
                                  {isUploading ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  ) : (
                                    <Upload className="mr-2 h-4 w-4" />
                                  )}
                                  Upload Image
                                </span>
                              </Button>
                            </label>
                            {field.value && <img src={field.value} alt="Preview" className="h-16 w-16 object-cover rounded-md" />}
                          </div>
                        </>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={upsertMutation.isPending || isUploading}>
                  {upsertMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {selectedAward ? 'Update Award' : 'Add Award'}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
      {isLoadingAwards ? (
        <div className="text-white flex items-center justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {awards?.map((award) => (
            <Card key={award.id} className="bg-slate-800 border-slate-700 text-white overflow-hidden">
              <CardHeader>
                <img src={award.image_url} alt={award.title} className="w-full h-40 object-cover" />
                <CardTitle className="pt-4">{award.title}</CardTitle>
                {award.issued_date && (
                  <CardDescription>{new Date(award.issued_date).toLocaleDateString()}</CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <p className="text-slate-400">{award.description}</p>
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => { setSelectedAward(award); setIsDialogOpen(true); }}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="destructive" size="sm" onClick={() => deleteMutation.mutate(award.id)} disabled={deleteMutation.isPending}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AwardsEditor;
