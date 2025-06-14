
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Award as AwardIcon } from 'lucide-react';

type Award = {
  id: string;
  title: string;
  description: string | null;
  image_url: string;
  issued_date: string | null;
};

const Awards = () => {
  const { data: awards, isLoading, error } = useQuery<Award[]>({
    queryKey: ['awards'],
    // Using `as any` because the generated types might not be updated yet.
    queryFn: async () => {
      const { data, error } = await (supabase.from('awards') as any)
        .select('*')
        .order('order', { ascending: true });
      if (error) throw new Error(error.message);
      return data;
    },
  });

  return (
    <div className="py-20 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Awards & Certificates
          </h2>
          <p className="mt-2 text-lg leading-8 text-slate-400">
            A collection of my achievements and recognitions.
          </p>
        </div>
        {isLoading ? (
          <div className="flex justify-center mt-12">
            <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
          </div>
        ) : error ? (
          <p className="text-center text-red-500 mt-12">Failed to load awards.</p>
        ) : (
          <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-3">
            {awards?.map((award) => (
              <Card key={award.id} className="flex flex-col items-start justify-between bg-slate-800/50 border-slate-700/50 text-white overflow-hidden transform hover:scale-105 transition-transform duration-300">
                <CardHeader className="w-full p-0">
                  <img src={award.image_url} alt={award.title} className="w-full h-48 object-cover"/>
                </CardHeader>
                <CardContent className="w-full p-6">
                  <div className="flex items-center gap-x-4 text-xs">
                     {award.issued_date && (
                       <time dateTime={award.issued_date} className="text-slate-400">
                         {new Date(award.issued_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
                       </time>
                     )}
                  </div>
                  <div className="group relative">
                    <h3 className="mt-3 text-lg font-semibold leading-6 text-white group-hover:text-blue-400">
                      <span className="absolute inset-0" />
                      {award.title}
                    </h3>
                    <p className="mt-5 line-clamp-3 text-sm leading-6 text-slate-300">{award.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Awards;
