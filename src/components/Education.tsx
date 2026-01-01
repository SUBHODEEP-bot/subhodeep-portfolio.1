
import React, { useEffect, useState } from 'react';
import { GraduationCap, Calendar, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface EducationItem {
  id: string;
  institution: string;
  degree: string;
  field_of_study: string;
  start_date: string;
  end_date: string;
  description: string;
  certificate_url: string;
}

const Education = () => {
  const [education, setEducation] = useState<EducationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEducation = async () => {
      try {
        const { data, error } = await supabase
          .from('education')
          .select('*')
          .order('start_date', { ascending: false });

        if (error) throw error;
        setEducation(data || []);
      } catch (error) {
        console.error('Error fetching education:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEducation();
  }, []);

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short'
    });
  };

  if (loading) {
    return (
      <div className="relative py-12 sm:py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="animate-pulse">
            <div className="h-8 bg-white/20 rounded mb-4"></div>
            <div className="h-4 bg-white/10 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (education.length === 0) {
    return null;
  }

  return (
    <div className="relative py-12 sm:py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8 sm:mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-3 sm:mb-4">
            Education
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-cyan-400 to-purple-500 mx-auto"></div>
        </div>

        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-cyan-400 to-purple-500 transform md:-translate-x-1/2"></div>

          <div className="space-y-8 sm:space-y-12">
            {education.map((item, index) => (
              <div
                key={item.id}
                className={`relative flex items-center ${
                  index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                }`}
              >
                {/* Timeline dot */}
                <div className="absolute left-4 md:left-1/2 w-4 h-4 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full transform md:-translate-x-1/2 z-10"></div>

                {/* Content */}
                <div className={`w-full md:w-1/2 ${index % 2 === 0 ? 'md:pr-8' : 'md:pl-8'}`}>
                  <div className="ml-12 md:ml-0 bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <GraduationCap className="text-cyan-400 flex-shrink-0" size={24} />
                        <div>
                          <h3 className="text-xl font-semibold text-white">{item.degree}</h3>
                          {item.field_of_study && (
                            <p className="text-cyan-300">{item.field_of_study}</p>
                          )}
                        </div>
                      </div>
                      {item.certificate_url && (
                        <a
                          href={item.certificate_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-cyan-400 hover:text-cyan-300 transition-colors"
                        >
                          <ExternalLink size={20} />
                        </a>
                      )}
                    </div>

                    <div className="mb-4">
                      <h4 className="text-lg font-medium text-white mb-2">{item.institution}</h4>
                      <div className="flex items-center space-x-2 text-gray-300">
                        <Calendar size={16} />
                        <span>
                          {formatDate(item.start_date)} - {item.end_date ? formatDate(item.end_date) : 'Present'}
                        </span>
                      </div>
                    </div>

                    {item.description && (
                      <p className="text-gray-300 leading-relaxed">{item.description}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Education;
