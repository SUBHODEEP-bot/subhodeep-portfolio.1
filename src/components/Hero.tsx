import React, { useEffect, useState } from 'react';
import { ArrowDown, Github, Linkedin, Youtube, Twitter, LucideIcon, icons } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import ImageModal from './ImageModal';

interface HeroData {
  name: string;
  title: string;
  description: string;
  avatar_url?: string;
}
interface SocialLinkData {
  platform: string;
  url: string;
  icon: string; // Name of the Lucide icon (ensure it's a keyof typeof icons)
}

// Updated getIconComponent to use the generic Icon component approach for more flexibility
const getIconComponent = (iconName: string): LucideIcon => {
  const normalizedIconName = iconName.charAt(0).toUpperCase() + iconName.slice(1);
  // Check if the iconName is a valid key in the imported `icons` object
  if (normalizedIconName in icons) {
    return icons[normalizedIconName as keyof typeof icons];
  }
  console.warn(`Icon "${normalizedIconName}" not found. Defaulting to Github.`);
  return Github; // Default fallback to Github icon
};
const Hero = () => {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentRole, setCurrentRole] = useState(0);
  const [heroData, setHeroData] = useState<HeroData>({
    name: 'SUBHODEEP PAL',
    // Default
    title: 'Engineering Student | Innovator | Future Technologist | Full Stack Developer',
    // Default
    description: 'Passionate about creating innovative solutions that bridge technology and human needs. Building the future, one line of code at a time.',
    // Default
    avatar_url: ''
  });
  const [socialLinks, setSocialLinks] = useState<SocialLinkData[]>([]);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  useEffect(() => {
    const fetchHeroData = async () => {
      try {
        const {
          data,
          error
        } = await supabase.from('website_content').select('content_key, content_value').eq('section', 'hero');
        if (error) throw error;
        const heroContent = data.reduce((acc, item) => {
          const key = item.content_key as keyof HeroData;
          const value = item.content_value;
          if (value !== null && value !== undefined) {
            if (typeof value === 'object') {
              acc[key] = JSON.stringify(value);
            } else {
              acc[key] = String(value);
            }
          }
          return acc;
        }, {} as Partial<HeroData>);
        setHeroData(prevData => ({
          name: heroContent.name || prevData.name,
          title: heroContent.title || prevData.title,
          description: heroContent.description || prevData.description,
          avatar_url: heroContent.avatar_url || ''
        }));
      } catch (error) {
        console.error('Error fetching hero data:', error);
      }
    };
    const fetchSocialLinks = async () => {
      try {
        const {
          data,
          error
        } = await supabase.from('website_content').select('content_value').eq('section', 'social_links').eq('content_key', 'links').maybeSingle(); // Use maybeSingle to handle no rows gracefully

        if (error) throw error;
        if (data && data.content_value) {
          let parsedJson: unknown;
          if (typeof data.content_value === 'string') {
            try {
              parsedJson = JSON.parse(data.content_value);
            } catch (e) {
              parsedJson = [];
              console.error("Failed to parse social links JSON:", e);
            }
          } else {
            parsedJson = data.content_value;
          }
          if (Array.isArray(parsedJson)) {
            const isSocialLinkData = (link: any): link is SocialLinkData => link != null && typeof link === 'object' && typeof link.platform === 'string' && typeof link.url === 'string' && typeof link.icon === 'string';
            const validLinks = (parsedJson as any[]).filter(isSocialLinkData);
            setSocialLinks(validLinks);
          } else {
            console.warn('Social links from DB is not an array or is malformed. Using defaults.');
            setSocialLinks([{
              platform: "LinkedIn",
              url: "https://linkedin.com",
              icon: "Linkedin"
            }, {
              platform: "GitHub",
              url: "https://github.com",
              icon: "Github"
            }, {
              platform: "YouTube",
              url: "https://youtube.com",
              icon: "Youtube"
            }, {
              platform: "Twitter",
              url: "https://twitter.com",
              icon: "Twitter"
            }]);
          }
        } else {
          // Fallback to default hardcoded links if none in DB or data is null
          setSocialLinks([{
            platform: "LinkedIn",
            url: "https://linkedin.com",
            icon: "Linkedin"
          }, {
            platform: "GitHub",
            url: "https://github.com",
            icon: "Github"
          }, {
            platform: "YouTube",
            url: "https://youtube.com",
            icon: "Youtube"
          }, {
            platform: "Twitter",
            url: "https://twitter.com",
            icon: "Twitter"
          }]);
        }
      } catch (error) {
        console.error('Error fetching social links:', error);
        // Fallback to default hardcoded links on error
        setSocialLinks([{
          platform: "LinkedIn",
          url: "https://linkedin.com",
          icon: "Linkedin"
        }, {
          platform: "GitHub",
          url: "https://github.com",
          icon: "Github"
        }, {
          platform: "YouTube",
          url: "https://youtube.com",
          icon: "Youtube"
        }, {
          platform: "Twitter",
          url: "https://twitter.com",
          icon: "Twitter"
        }]);
      }
    };
    fetchHeroData();
    fetchSocialLinks();
  }, []); // Changed dependency array to run only once on mount

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
        setCurrentRole(prevRole => (prevRole + 1) % roles.length);
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [currentIndex, currentRole, roles]);
  const scrollToAbout = () => {
    const aboutSection = document.getElementById('about');
    if (aboutSection) {
      aboutSection.scrollIntoView({
        behavior: 'smooth'
      });
    }
  };

  const handleImageClick = () => {
    if (heroData.avatar_url) {
      setIsImageModalOpen(true);
    }
  };

    return <div className="relative min-h-[60vh] sm:min-h-screen flex items-center justify-center px-4 pt-16">
      <div className="text-center z-10">
        {/* Profile Image */}
        <div className="mb-8">
          <div className="relative mx-auto w-40 h-40 sm:w-48 sm:h-48 mb-6">
            <div className="w-full h-full rounded-full">
              {heroData.avatar_url ? (
                <img 
                  src={heroData.avatar_url} 
                  alt={heroData.name} 
                  className="w-full h-full rounded-full object-cover cursor-pointer hover:opacity-90 transition-opacity" 
                  onClick={handleImageClick}
                />
              ) : (
                <div className="w-full h-full rounded-full bg-gray-300 flex items-center justify-center text-6xl font-bold text-gray-600">
                  {heroData.name.split(" ").map(n => n[0]).join("").toUpperCase() || "SP"}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Name and Dynamic Title */}
        <h1 className="text-3xl sm:text-4xl md:text-7xl font-bold text-white mb-4">
          {heroData.name}
        </h1>
        
        <div className="text-xl md:text-3xl text-cyan-300 mb-8 h-12 flex items-center justify-center">
          <span className="font-light">
            {displayText}
            <span className="animate-pulse">|</span>
          </span>
        </div>

        {/* Description */}
        <p className="text-base md:text-xl text-gray-300 mb-5 sm:mb-8 max-w-2xl mx-auto leading-relaxed">
          {heroData.description}
        </p>

        {/* Social Links */}
        {socialLinks.length > 0}

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 mb-8 sm:mb-12">
          <button className="px-6 py-3 sm:px-8 sm:py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-full hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg">
            View Resume
          </button>
          <button onClick={scrollToAbout} className="px-6 py-3 sm:px-8 sm:py-4 border-2 border-cyan-400 text-cyan-400 font-semibold rounded-full hover:bg-cyan-400 hover:text-white transition-all duration-300 transform hover:scale-105">
            Explore Profile
          </button>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <button onClick={scrollToAbout} className="text-white hover:text-cyan-300 transition-colors animate-bounce">
            <ArrowDown size={32} />
          </button>
        </div>
      </div>

      {/* Image Modal */}
      <ImageModal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        imageUrl={heroData.avatar_url || ''}
        imageAlt={heroData.name}
        title={heroData.name}
      />
    </div>;
};

export default Hero;
