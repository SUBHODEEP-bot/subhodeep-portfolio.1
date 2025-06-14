
import React, { useEffect, useState } from 'react';
import Hero from '../components/Hero';
import About from '../components/About';
import Education from '../components/Education';
import Skills from '../components/Skills';
import Projects from '../components/Projects';
import Gallery from '../components/Gallery';
import Blog from '../components/Blog';
import Contact from '../components/Contact';
import Navigation from '../components/Navigation';
import ParticleBackground from '../components/ParticleBackground';
import { supabase } from '@/integrations/supabase/client';

const Index = () => {
  const [activeSection, setActiveSection] = useState('hero');
  const [sectionVisibility, setSectionVisibility] = useState({
    show_education: true,
    show_gallery: true,
    show_blog: true
  });

  useEffect(() => {
    // Fetch section visibility settings
    const fetchSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('website_content')
          .select('content_key, content_value')
          .eq('section', 'settings');

        if (error) throw error;

        const settings = data.reduce((acc, item) => {
          acc[item.content_key] = typeof item.content_value === 'string' 
            ? JSON.parse(item.content_value) 
            : item.content_value;
          return acc;
        }, {} as any);

        setSectionVisibility(prev => ({
          ...prev,
          ...settings
        }));
      } catch (error) {
        console.error('Error fetching settings:', error);
      }
    };

    fetchSettings();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['hero', 'about'];
      
      // Add conditional sections based on visibility
      if (sectionVisibility.show_education) sections.push('education');
      sections.push('skills', 'projects');
      if (sectionVisibility.show_gallery) sections.push('gallery');
      if (sectionVisibility.show_blog) sections.push('blog');
      sections.push('contact');

      const scrollPosition = window.scrollY + 100;

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const offsetTop = element.offsetTop;
          const offsetHeight = element.offsetHeight;
          
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [sectionVisibility]);

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      <ParticleBackground />
      <Navigation activeSection={activeSection} />
      
      <section id="hero">
        <Hero />
      </section>
      
      <section id="about">
        <About />
      </section>
      
      {sectionVisibility.show_education && (
        <section id="education">
          <Education />
        </section>
      )}
      
      <section id="skills">
        <Skills />
      </section>
      
      <section id="projects">
        <Projects />
      </section>
      
      {sectionVisibility.show_gallery && (
        <section id="gallery">
          <Gallery />
        </section>
      )}
      
      {sectionVisibility.show_blog && (
        <section id="blog">
          <Blog />
        </section>
      )}
      
      <section id="contact">
        <Contact />
      </section>
    </div>
  );
};

export default Index;
