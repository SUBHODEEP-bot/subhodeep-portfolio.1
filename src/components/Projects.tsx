
import React, { useEffect, useState } from 'react';
import { ExternalLink, Github, Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Project {
  id: string;
  title: string;
  description: string;
  tech_stack: string[];
  github_url: string;
  live_url: string;
  image_url: string;
  featured: boolean;
}

const Projects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .order('featured', { ascending: false })
          .order('created_at', { ascending: false });

        if (error) throw error;
        setProjects(data || []);
      } catch (error) {
        console.error('Error fetching projects:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  if (loading) {
    return (
      <div className="relative py-12 sm:py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <div className="animate-pulse text-white text-xl">Loading projects...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative py-12 sm:py-20 px-4">
      <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
            Featured Projects
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-cyan-400 to-purple-500 mx-auto mb-6"></div>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            A showcase of my recent work, featuring innovative solutions and cutting-edge technologies
          </p>
        </div>

        {projects.length === 0 ? (
          <div className="text-center text-gray-400 py-12">
            <p className="text-xl">No projects available yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {projects.map((project) => (
              <div
                key={project.id}
                className="bg-white/10 backdrop-blur-md rounded-2xl overflow-hidden border border-white/20 hover:bg-white/15 transition-all duration-300 group"
              >
                {/* Project Image */}
                <div className="relative h-40 sm:h-48 bg-gradient-to-br from-gray-800 to-gray-900 overflow-hidden">
                  {project.featured && (
                    <div className="absolute top-4 right-4 z-10">
                      <div className="flex items-center space-x-1 bg-yellow-500 text-black px-2 py-1 rounded-full text-xs font-semibold">
                        <Star size={12} fill="currentColor" />
                        <span>Featured</span>
                      </div>
                    </div>
                  )}
                  
                  {project.image_url ? (
                    <img
                      src={project.image_url}
                      alt={project.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-6xl font-bold text-gray-600">
                        {project.title.charAt(0)}
                      </div>
                    </div>
                  )}
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                </div>

                {/* Project Content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-cyan-400 transition-colors">
                    {project.title}
                  </h3>
                  
                  <p className="text-gray-300 mb-4 line-clamp-3">
                    {project.description}
                  </p>

                  {/* Tech Stack */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {project.tech_stack.map((tech, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs font-medium"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    {project.github_url && (
                      <a
                        href={project.github_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full sm:flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                      >
                        <Github size={16} />
                        <span>Code</span>
                      </a>
                    )}

                    {project.live_url && (
                      <a
                        href={project.live_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full sm:flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white rounded-lg transition-all duration-300"
                      >
                        <ExternalLink size={16} />
                        <span>Demo</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Projects;
