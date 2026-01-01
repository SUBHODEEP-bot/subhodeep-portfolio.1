
import React, { useEffect, useState } from 'react';
import { Calendar, MapPin, Globe, Quote } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const About = () => {
  const [aboutData, setAboutData] = useState({
    bio: "Hello! I'm Subhodeep Pal, a passionate engineering student with an insatiable curiosity for technology and innovation. My journey in the world of engineering began with a simple fascination for how things work and has evolved into a deep commitment to creating solutions that matter.",
    quote: "Innovation distinguishes between a leader and a follower. I believe in creating technology that makes a difference.",
    dob: 'January 15, 2002',
    location: 'Kolkata, West Bengal, India',
    languages: 'English, Hindi, Bengali'
  });

  useEffect(() => {
    const fetchAboutData = async () => {
      try {
        const { data, error } = await supabase
          .from('website_content')
          .select('content_key, content_value')
          .eq('section', 'about');

        if (error) throw error;

        const aboutContent = data.reduce((acc, item) => {
          let value = item.content_value;
          if (typeof value === 'string') {
            try {
              // Try to parse as JSON first
              value = JSON.parse(value);
            } catch {
              // If parsing fails, use the string as is
            }
          }
          acc[item.content_key] = value;
          return acc;
        }, {} as any);

        setAboutData(prev => ({
          bio: aboutContent.bio || prev.bio,
          quote: aboutContent.quote || prev.quote,
          dob: aboutContent.dob || prev.dob,
          location: aboutContent.location || prev.location,
          languages: aboutContent.languages || prev.languages,
        }));
      } catch (error) {
        console.error('Error fetching about data:', error);
      }
    };

    fetchAboutData();
  }, []);

  return (
    <div className="relative py-12 sm:py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8 sm:mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-3 sm:mb-4">
            About Me
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-cyan-400 to-purple-500 mx-auto mb-4 sm:mb-6"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 md:gap-12 items-center">
          {/* Left Side - Personal Info */}
          <div className="space-y-4 sm:space-y-8">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-6 md:p-8 border border-white/20">
              <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-white mb-4 sm:mb-6">Personal Details</h3>
              
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center space-x-3">
                  <Calendar className="text-cyan-400 flex-shrink-0" size={18} />
                  <span className="text-xs sm:text-sm md:text-base text-gray-300">Date of Birth: {aboutData.dob}</span>
                </div>
                
                <div className="flex items-center space-x-3">
                  <MapPin className="text-cyan-400 flex-shrink-0" size={18} />
                  <span className="text-xs sm:text-sm md:text-base text-gray-300">Location: {aboutData.location}</span>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Globe className="text-cyan-400 flex-shrink-0" size={18} />
                  <span className="text-xs sm:text-sm md:text-base text-gray-300">Languages: {aboutData.languages}</span>
                </div>
              </div>
            </div>

            {/* Quote Section */}
            <div className="bg-gradient-to-r from-purple-500/20 to-cyan-500/20 backdrop-blur-md rounded-2xl p-4 sm:p-6 md:p-8 border border-white/20">
              <Quote className="text-cyan-400 mb-3 sm:mb-4" size={24} />
              <blockquote className="text-sm sm:text-base md:text-lg text-white italic leading-relaxed">
                "{aboutData.quote}"
              </blockquote>
              <cite className="text-cyan-300 mt-3 sm:mt-4 block text-xs sm:text-sm">- My Philosophy</cite>
            </div>
          </div>

          {/* Right Side - Biography */}
          <div className="space-y-4 sm:space-y-6">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-6 md:p-8 border border-white/20">
              <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-white mb-4 sm:mb-6">My Journey</h3>
              
              <div className="text-xs sm:text-sm md:text-base text-gray-300 leading-relaxed">
                <p>{aboutData.bio}</p>
              </div>
            </div>

            {/* Video Placeholder */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-6 md:p-8 border border-white/20">
              <h3 className="text-base sm:text-lg md:text-xl font-semibold text-white mb-3 sm:mb-4">Introduction Video</h3>
              <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <div className="w-12 sm:w-14 md:w-16 h-12 sm:h-14 md:h-16 bg-cyan-500 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-4">
                    <span className="text-white text-lg sm:text-xl md:text-2xl">▶</span>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-400">Video coming soon...</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
