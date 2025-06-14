import React, { useState } from 'react';
import { ExternalLink, Github, Eye } from 'lucide-react';

const Projects = () => {
  const [hoveredProject, setHoveredProject] = useState<number | null>(null);

  const projects = [
    {
      id: 1,
      title: 'AI-Powered Task Manager',
      description: 'A smart task management application that uses machine learning to predict task completion times and optimize workflows.',
      techStack: ['React', 'Node.js', 'Python', 'TensorFlow', 'MongoDB'],
      image: '/placeholder.svg',
      liveUrl: '#',
      githubUrl: '#',
      featured: true
    },
    {
      id: 2,
      title: 'Real-time Collaboration Platform',
      description: 'A web-based platform for real-time collaboration with video conferencing, document sharing, and project management features.',
      techStack: ['Next.js', 'Socket.io', 'WebRTC', 'PostgreSQL', 'Redis'],
      image: '/placeholder.svg',
      liveUrl: '#',
      githubUrl: '#',
      featured: true
    },
    {
      id: 3,
      title: 'Smart Home IoT Dashboard',
      description: 'An IoT dashboard for monitoring and controlling smart home devices with real-time data visualization.',
      techStack: ['Vue.js', 'Arduino', 'MQTT', 'InfluxDB', 'Grafana'],
      image: '/placeholder.svg',
      liveUrl: '#',
      githubUrl: '#',
      featured: false
    },
    {
      id: 4,
      title: 'E-commerce Mobile App',
      description: 'A cross-platform mobile application for e-commerce with payment integration and inventory management.',
      techStack: ['React Native', 'Firebase', 'Stripe', 'Redux', 'Node.js'],
      image: '/placeholder.svg',
      liveUrl: '#',
      githubUrl: '#',
      featured: false
    },
    {
      id: 5,
      title: 'Blockchain Voting System',
      description: 'A secure and transparent voting system built on blockchain technology to ensure election integrity.',
      techStack: ['Solidity', 'Web3.js', 'Ethereum', 'React', 'Truffle'],
      image: '/placeholder.svg',
      liveUrl: '#',
      githubUrl: '#',
      featured: false
    },
    {
      id: 6,
      title: 'Data Visualization Tool',
      description: 'An interactive data visualization tool for analyzing large datasets with custom chart types and filters.',
      techStack: ['D3.js', 'Python', 'Flask', 'Pandas', 'Chart.js'],
      image: '/placeholder.svg',
      liveUrl: '#',
      githubUrl: '#',
      featured: false
    }
  ];

  const featuredProjects = projects.filter(project => project.featured);
  const otherProjects = projects.filter(project => !project.featured);

  return (
    <div className="relative py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Project Portfolio
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-cyan-400 to-purple-500 mx-auto mb-6"></div>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            A showcase of my work spanning various technologies and domains, from AI and web development to IoT and blockchain.
          </p>
        </div>

        {/* Featured Projects */}
        <div className="mb-16">
          <h3 className="text-2xl font-semibold text-white mb-8 text-center">Featured Projects</h3>
          <div className="grid md:grid-cols-2 gap-8">
            {featuredProjects.map((project) => (
              <div
                key={project.id}
                className="group relative bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 transform hover:scale-105"
                onMouseEnter={() => setHoveredProject(project.id)}
                onMouseLeave={() => setHoveredProject(null)}
              >
                <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg mb-6 overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-purple-500/20"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Eye className="text-white/60" size={48} />
                  </div>
                  {hoveredProject === project.id && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center space-x-4 transition-all duration-300">
                      <a
                        href={project.liveUrl}
                        className="bg-cyan-500 hover:bg-cyan-600 text-white p-3 rounded-full transition-colors"
                      >
                        <ExternalLink size={20} />
                      </a>
                      <a
                        href={project.githubUrl}
                        className="bg-purple-500 hover:bg-purple-600 text-white p-3 rounded-full transition-colors"
                      >
                        <Github size={20} />
                      </a>
                    </div>
                  )}
                </div>

                <h4 className="text-xl font-semibold text-white mb-3">{project.title}</h4>
                <p className="text-gray-300 mb-4 leading-relaxed">{project.description}</p>

                <div className="flex flex-wrap gap-2 mb-4">
                  {project.techStack.map((tech) => (
                    <span
                      key={tech}
                      className="px-3 py-1 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-cyan-300 text-sm rounded-full border border-cyan-500/30"
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                <div className="flex space-x-4">
                  <a
                    href={project.liveUrl}
                    className="flex items-center space-x-2 text-cyan-400 hover:text-cyan-300 transition-colors"
                  >
                    <ExternalLink size={16} />
                    <span>Live Demo</span>
                  </a>
                  <a
                    href={project.githubUrl}
                    className="flex items-center space-x-2 text-purple-400 hover:text-purple-300 transition-colors"
                  >
                    <Github size={16} />
                    <span>Source Code</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Other Projects */}
        <div>
          <h3 className="text-2xl font-semibold text-white mb-8 text-center">Other Projects</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {otherProjects.map((project) => (
              <div
                key={project.id}
                className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300"
              >
                <h4 className="text-lg font-semibold text-white mb-2">{project.title}</h4>
                <p className="text-gray-300 text-sm mb-4 leading-relaxed">{project.description}</p>

                <div className="flex flex-wrap gap-2 mb-4">
                  {project.techStack.slice(0, 3).map((tech) => (
                    <span
                      key={tech}
                      className="px-2 py-1 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-cyan-300 text-xs rounded-full border border-cyan-500/30"
                    >
                      {tech}
                    </span>
                  ))}
                  {project.techStack.length > 3 && (
                    <span className="px-2 py-1 text-gray-400 text-xs">
                      +{project.techStack.length - 3} more
                    </span>
                  )}
                </div>

                <div className="flex space-x-4">
                  <a
                    href={project.liveUrl}
                    className="text-cyan-400 hover:text-cyan-300 transition-colors"
                  >
                    <ExternalLink size={14} />
                  </a>
                  <a
                    href={project.githubUrl}
                    className="text-purple-400 hover:text-purple-300 transition-colors"
                  >
                    <Github size={14} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Projects;
