import React, { useEffect, useState } from 'react';
import { ArrowDown, Github, Linkedin, Youtube, Twitter, LucideIcon, Icon as LucideDynamicIcon } from 'lucide-react';
import * as icons from 'lucide-react'; // Import all icons for dynamic access
import { supabase } from '@/integrations/supabase/client';

interface HeroData {
  name: string;
  title: string;
  description: string;
}

interface SocialLinkData {
  platform: string;
  url: string;
  icon: string; // Name of the Lucide icon
}

const DynamicIcon = ({ name, ...props }: { name: string } & React.ComponentProps<LucideIcon>) => {
  const IconComponent = (icons as Record<string, LucideIcon>)[name];
  if (!IconComponent) {
    // Fallback icon or null if preferred
    return <LucideDynamicIcon className="text-gray-400" {...props} />; 
  }
  return <IconComponent {...props} />;
};

const Hero = () => {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentRole, setCurrentRole] = useState(0);
  const [heroData, setHeroData] = useState<HeroData>({
    name: 'SUBHODEEP PAL', // Default
    title: 'Engineering Student | Innovator | Future Technologist | Full Stack Developer', // Default
    description: 'Passionate about creating innovative solutions that bridge technology and human needs. Building the future, one line of code at a time.' // Default
  });
  const [socialLinks, setSocialLinks] = useState<SocialLinkData[]>([]);

  useEffect(() => {
    const fetchHeroData = async () => {
      try {
        const { data, error } = await supabase
          .from('website_content')
          .select('content_key, content_value')
          .eq('section', 'hero');

        if (error) throw error;

        const heroContent = data.reduce((acc, item) => {
          let value = item.content_value;
          if (typeof value === 'string') {
            try { value = JSON.parse(value); } catch { /* keep as string */ }
          }
          acc[item.content_key] = value;
          return acc;
        }, {} as any);

        if (heroContent.name || heroContent.title || heroContent.description) {
          setHeroData({
            name: heroContent.name || heroData.name,
            title: heroContent.title || heroData.title,
            description: heroContent.description || heroData.description
          });
        }
      } catch (error) {
        console.error('Error fetching hero data:', error);
      }
    };

    const fetchSocialLinks = async () => {
      try {
        const { data, error } = await supabase
          .from('website_content')
          .select('content_value')
          .eq('section', 'social_links')
          .eq('content_key', 'links')
          .single();
        
        if (error && error.code !== 'PGRST116') throw error;

        if (data && data.content_value) {
          let parsedLinks = data.content_value;
          if (typeof parsedLinks === 'string') {
            try { parsedLinks = JSON.parse(parsedLinks); } catch (e) { parsedLinks = []; }
          }
          setSocialLinks(Array.isArray(parsedLinks) ? parsedLinks : []);
        } else {
           // Fallback to default hardcoded links if none in DB
          setSocialLinks([
            { platform: "LinkedIn", url: "https://linkedin.com", icon: "Linkedin" },
            { platform: "GitHub", url: "https://github.com", icon: "Github" },
            { platform: "YouTube", url: "https://youtube.com", icon: "Youtube" },
            { platform: "Twitter", url: "https://twitter.com", icon: "Twitter" },
          ]);
        }
      } catch (error) {
        console.error('Error fetching social links:', error);
         // Fallback to default hardcoded links on error
        setSocialLinks([
          { platform: "LinkedIn", url: "https://linkedin.com", icon: "Linkedin" },
          { platform: "GitHub", url: "https://github.com", icon: "Github" },
          { platform: "YouTube", url: "https://youtube.com", icon: "Youtube" },
          { platform: "Twitter", url: "https://twitter.com", icon: "Twitter" },
        ]);
      }
    };

    fetchHeroData();
    fetchSocialLinks();
  }, []);

  const roles = heroData.title.split(' | ').filter(role => role.trim());

  useEffect(() => {
    if (roles.length === 0) return; // Guard against empty roles array
    const currentRoleText = roles[currentRole % roles.length] || ' '; // Ensure currentRole is always valid index
    
    if (currentIndex < currentRoleText.length) {
      const timeout = setTimeout(() => {
        setDisplayText(currentRoleText.slice(0, currentIndex + 1));
        setCurrentIndex(currentIndex + 1);
      }, 100);
      return () => clearTimeout(timeout);
    } else {
      const timeout = setTimeout(() => {
        setCurrentIndex(0);
        setDisplayText('');
        setCurrentRole((prevRole) => (prevRole + 1) % roles.length);
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [currentIndex, currentRole, roles]);

  const scrollToAbout = () => {
    const aboutSection = document.getElementById('about');
    if (aboutSection) {
      aboutSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 pt-16">
      <div className="text-center z-10">
        {/* Profile Image */}
        <div className="mb-8">
          <div className="relative mx-auto w-48 h-48 mb-6">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-400 to-purple-500 p-1">
              <div className="w-full h-full rounded-full bg-gray-300 flex items-center justify-center text-6xl font-bold text-gray-600">
                {heroData.name.split(" ").map(n => n[0]).join("").toUpperCase() || "SP"}
              </div>
            </div>
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-400 to-purple-500 opacity-20 animate-pulse"></div>
          </div>
        </div>

        {/* Name and Dynamic Title */}
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-4">
          {heroData.name}
        </h1>
        
        <div className="text-2xl md:text-3xl text-cyan-300 mb-8 h-12 flex items-center justify-center">
          <span className="font-light">
            {displayText}
            <span className="animate-pulse">|</span>
          </span>
        </div>

        {/* Description */}
        <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
          {heroData.description}
        </p>

        {/* Social Links */}
        {socialLinks.length > 0 && (
          <div className="flex justify-center space-x-6 mb-12">
            {socialLinks.map((link) => (
              <a 
                key={link.platform} 
                href={link.url} 
                target="_blank" 
                rel="noopener noreferrer" 
                aria-label={link.platform}
                className="text-gray-300 hover:text-cyan-400 transition-colors"
              >
                <DynamicIcon name={link.icon} size={28} />
              </a>
            ))}
          </div>
        )}

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16">
          <button className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-full hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg">
            View Resume
          </button>
          <button 
            onClick={scrollToAbout}
            className="px-8 py-4 border-2 border-cyan-400 text-cyan-400 font-semibold rounded-full hover:bg-cyan-400 hover:text-white transition-all duration-300 transform hover:scale-105"
          >
            Explore Profile
          </button>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <button
            onClick={scrollToAbout}
            className="text-white hover:text-cyan-300 transition-colors animate-bounce"
          >
            <ArrowDown size={32} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Hero;
