import React, { useState, useEffect } from 'react';
import { Mail, MapPin, Phone, Send, Download, Linkedin, Github, Youtube, Twitter, Instagram, Facebook, Gitlab } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SocialLink {
  platform: string;
  url: string;
  icon: string;
}

const iconComponents: { [key: string]: React.ElementType } = {
  Linkedin,
  Github,
  Youtube,
  Twitter,
  Instagram,
  Facebook,
  Gitlab,
};

const Contact = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);

  const [contactData, setContactData] = useState({
    email: 'subhodeep.pal@example.com',
    phone: '+91 9876543210',
    location: 'Kolkata, West Bengal, India',
    resume_url: '',
  });

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [contactRes, socialRes] = await Promise.all([
          supabase
            .from('website_content')
            .select('content_key, content_value')
            .eq('section', 'contact'),
          supabase
            .from('website_content')
            .select('content_value')
            .eq('section', 'social_links')
            .eq('content_key', 'links')
            .maybeSingle()
        ]);

        if (contactRes.error) throw contactRes.error;
        if (contactRes.data) {
          const contactContent = contactRes.data.reduce((acc, item) => {
            if (item.content_key !== 'socials') {
              let value = item.content_value;
              if (typeof value === 'string') {
                try { value = JSON.parse(value); } catch (e) { /* Not JSON */ }
              }
              acc[item.content_key] = value;
            }
            return acc;
          }, {} as any);
          
          if (Object.keys(contactContent).length > 0) {
            setContactData(prev => ({
              ...prev,
              email: contactContent.email || prev.email,
              phone: contactContent.phone || prev.phone,
              location: contactContent.location || prev.location,
              resume_url: contactContent.resume_url || prev.resume_url,
            }));
          }
        }
        
        if (socialRes.error) throw socialRes.error;
        if (socialRes.data && socialRes.data.content_value) {
          let parsedLinks = socialRes.data.content_value;
          if (typeof parsedLinks === 'string') {
            try { parsedLinks = JSON.parse(parsedLinks); } catch (e) { parsedLinks = []; }
          }
          setSocialLinks(Array.isArray(parsedLinks) ? parsedLinks as SocialLink[] : []);
        }

      } catch (error) {
        console.error('Error fetching contact page data:', error);
      }
    };

    fetchAllData();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('contact_messages').insert(formData);
      if (error) throw error;
      toast({
        title: 'Message Sent!',
        description: "Thank you for your message! I'll get back to you soon.",
      });
      setFormData({ name: '', email: '', message: '' });
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: 'Error',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Get In Touch
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-cyan-400 to-purple-500 mx-auto mb-6"></div>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            I'm always open to discussing new opportunities, collaborations, or just having a conversation about technology and innovation.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div className="space-y-8">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
              <h3 className="text-2xl font-semibold text-white mb-6">Contact Information</h3>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Mail className="text-white" size={20} />
                  </div>
                  <div>
                    <h4 className="text-white font-medium mb-1">Email</h4>
                    <p className="text-gray-300">{contactData.email}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Phone className="text-white" size={20} />
                  </div>
                  <div>
                    <h4 className="text-white font-medium mb-1">Phone</h4>
                    <p className="text-gray-300">{contactData.phone}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <MapPin className="text-white" size={20} />
                  </div>
                  <div>
                    <h4 className="text-white font-medium mb-1">Location</h4>
                    <p className="text-gray-300">{contactData.location}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
              <h3 className="text-xl font-semibold text-white mb-6">Connect with Me</h3>
              <div className="flex flex-wrap gap-4">
                {socialLinks.map((social) => {
                  const IconComponent = iconComponents[social.icon];
                  if (!IconComponent) return null; // or a default icon

                  return (
                    <a
                      key={social.platform}
                      href={social.url || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-white transition-all duration-300 hover:bg-white/20 transform hover:scale-110"
                      aria-label={social.platform}
                    >
                      <IconComponent size={20} />
                    </a>
                  );
                })}
              </div>
            </div>

            {/* Resume Download */}
            <div className="bg-gradient-to-r from-cyan-500/20 to-purple-500/20 backdrop-blur-md rounded-2xl p-8 border border-white/20">
              <h3 className="text-xl font-semibold text-white mb-4">Download Resume</h3>
              <p className="text-gray-300 mb-6">
                Get a comprehensive overview of my skills, experience, and achievements.
              </p>
              <a href={contactData.resume_url || '#'} download target="_blank" rel="noopener noreferrer">
                <button 
                  disabled={!contactData.resume_url}
                  className="flex items-center space-x-2 bg-gradient-to-r from-cyan-500 to-purple-500 text-white px-6 py-3 rounded-full font-medium hover:from-cyan-600 hover:to-purple-600 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Download size={20} />
                  <span>Download Resume</span>
                </button>
              </a>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
            <h3 className="text-2xl font-semibold text-white mb-6">Send a Message</h3>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-white font-medium mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-300"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-white font-medium mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-300"
                  placeholder="Enter your email address"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-white font-medium mb-2">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  rows={6}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-300 resize-none"
                  placeholder="Tell me about your project or just say hello..."
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-cyan-500 to-purple-500 text-white px-6 py-4 rounded-lg font-medium hover:from-cyan-600 hover:to-purple-600 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={20} />
                <span>{isSubmitting ? 'Sending...' : 'Send Message'}</span>
              </button>
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-16 pt-8 border-t border-white/20">
          <p className="text-gray-400">
            © 2024 Subhodeep Pal. Built with passion and powered by innovation.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Contact;
