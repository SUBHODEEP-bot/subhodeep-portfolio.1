
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Award, Loader2 } from 'lucide-react';

const fetchAwards = async () => {
  const { data, error } = await supabase.from('awards').select('*').order('issued_date', { ascending: false });
  if (error) throw new Error(error.message);
  return data;
};

const Awards = () => {
  const { data: awards, isLoading, error } = useQuery({
    queryKey: ['publicAwards'],
    queryFn: fetchAwards,
  });

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <Loader2 className="animate-spin text-cyan-400" size={48} />
      </div>
    );
  }

  if (error || !awards || awards.length === 0) {
    return null; // Don't render the section if there's an error or no awards
  }

  return (
    <div className="container mx-auto px-4 py-16 text-white">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl flex items-center justify-center gap-4">
          <Award className="w-10 h-10 text-cyan-400" />
          Awards & Certificates
        </h2>
        <p className="mt-4 text-lg text-gray-300">A collection of my achievements and recognitions.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {awards.map((award) => (
          <Card key={award.id} className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50 overflow-hidden transform transition-transform duration-300 hover:scale-105 hover:shadow-cyan-400/20 shadow-lg">
            <img src={award.image_url} alt={award.title} className="w-full h-56 object-cover" />
            <CardHeader>
              <CardTitle className="text-xl font-bold">{award.title}</CardTitle>
              {award.issued_date && <CardDescription className="text-slate-400">{new Date(award.issued_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', timeZone: 'UTC' })}</CardDescription>}
            </CardHeader>
            <CardContent>
              <p className="text-slate-300">{award.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Awards;
