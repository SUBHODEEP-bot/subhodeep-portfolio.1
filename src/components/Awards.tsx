
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Award as AwardIcon } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type Award = Database['public']['Tables']['awards']['Row'];

const Awards = () => {
  const { data: awards, isLoading, error } = useQuery<Award[]>({
    queryKey: ['awards'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('awards')
        .select('*')
        .order('issued_date', { ascending: false, nullsFirst: false })
        .order('order', { ascending: true });
      if (error) throw new Error(error.message);
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="py-20 text-center text-white">
        <p>Loading Awards...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-20 text-center text-red-400">
        <p>Error loading awards: {(error as Error).message}</p>
      </div>
    );
  }

  if (!awards || awards.length === 0) {
    return null; // Don't render the section if there are no awards
  }

  return (
    <div className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-extrabold text-white sm:text-5xl">
            Awards & Certificates
          </h2>
          <p className="mt-4 text-xl text-slate-300">
            Recognition of my hard work and dedication.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {awards.map((award) => (
            <Card key={award.id} className="bg-black/30 backdrop-blur-sm border border-white/10 text-white transform hover:scale-105 transition-transform duration-300">
              <CardHeader>
                <img src={award.image_url} alt={award.title} className="w-full h-48 object-cover rounded-t-lg" />
              </CardHeader>
              <CardContent className="p-6">
                <CardTitle className="text-xl font-bold text-cyan-400">{award.title}</CardTitle>
                {award.issued_date && (
                  <p className="text-sm text-slate-400 mt-1">{new Date(award.issued_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}</p>
                )}
                <p className="mt-4 text-slate-300">{award.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Awards;
