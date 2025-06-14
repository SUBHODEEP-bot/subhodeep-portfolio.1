
import React from 'react';
import { Calendar, MapPin, Globe, Quote } from 'lucide-react';

const About = () => {
  return (
    <div className="relative py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            About Me
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-cyan-400 to-purple-500 mx-auto"></div>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left Side - Personal Info */}
          <div className="space-y-8">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
              <h3 className="text-2xl font-semibold text-white mb-6">Personal Details</h3>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Calendar className="text-cyan-400" size={20} />
                  <span className="text-gray-300">Date of Birth: January 15, 2002</span>
                </div>
                
                <div className="flex items-center space-x-3">
                  <MapPin className="text-cyan-400" size={20} />
                  <span className="text-gray-300">Location: Kolkata, West Bengal, India</span>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Globe className="text-cyan-400" size={20} />
                  <span className="text-gray-300">Languages: English, Hindi, Bengali</span>
                </div>
              </div>
            </div>

            {/* Quote Section */}
            <div className="bg-gradient-to-r from-purple-500/20 to-cyan-500/20 backdrop-blur-md rounded-2xl p-8 border border-white/20">
              <Quote className="text-cyan-400 mb-4" size={32} />
              <blockquote className="text-xl text-white italic leading-relaxed">
                "Innovation distinguishes between a leader and a follower. I believe in creating technology that makes a difference."
              </blockquote>
              <cite className="text-cyan-300 mt-4 block">- My Philosophy</cite>
            </div>
          </div>

          {/* Right Side - Biography */}
          <div className="space-y-6">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
              <h3 className="text-2xl font-semibold text-white mb-6">My Journey</h3>
              
              <div className="text-gray-300 leading-relaxed space-y-4">
                <p>
                  Hello! I'm Subhodeep Pal, a passionate engineering student with an insatiable curiosity 
                  for technology and innovation. My journey in the world of engineering began with a simple 
                  fascination for how things work and has evolved into a deep commitment to creating solutions 
                  that matter.
                </p>
                
                <p>
                  Currently pursuing my engineering degree, I've immersed myself in various domains of 
                  technology, from software development to system design. I believe that the intersection 
                  of creativity and technology is where the most impactful innovations are born.
                </p>
                
                <p>
                  When I'm not coding or studying, you'll find me exploring new technologies, participating 
                  in hackathons, or contributing to open-source projects. I'm always eager to learn, grow, 
                  and collaborate with like-minded individuals who share my passion for making a positive 
                  impact through technology.
                </p>
              </div>
            </div>

            {/* Video Placeholder */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
              <h3 className="text-xl font-semibold text-white mb-4">Introduction Video</h3>
              <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white text-2xl">▶</span>
                  </div>
                  <p className="text-gray-400">Video coming soon...</p>
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
