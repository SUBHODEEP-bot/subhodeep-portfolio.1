import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Trash2, Save, RefreshCw, ExternalLink, Github } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Project {
  id?: string;
  title: string;
  description: string;
  tech_stack: string[];
  github_url: string;
  live_url: string;
  image_url: string;
  featured: boolean;
}

const ProjectsEditor = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [newProject, setNewProject] = useState<Project>({
    title: '',
    description: '',
    tech_stack: [],
    github_url: '',
    live_url: '',
    image_url: '',
    featured: false
  });
  const [techInput, setTechInput] = useState('');

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching projects:', error);
        throw error;
      }
      setProjects(data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast({
        title: "Error",
        description: "Failed to load projects",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addProject = async () => {
    if (!newProject.title.trim()) {
      toast({
        title: "Error",
        description: "Please enter a project title",
        variant: "destructive"
      });
      return;
    }

    try {
      console.log('Adding project:', newProject);
      const { data, error } = await supabase
        .from('projects')
        .insert([{
          title: newProject.title,
          description: newProject.description,
          tech_stack: newProject.tech_stack,
          github_url: newProject.github_url,
          live_url: newProject.live_url,
          image_url: newProject.image_url,
          featured: newProject.featured
        }])
        .select()
        .single();

      if (error) {
        console.error('Error adding project:', error);
        throw error;
      }

      console.log('Project added successfully:', data);
      setProjects([data, ...projects]);
      setNewProject({
        title: '',
        description: '',
        tech_stack: [],
        github_url: '',
        live_url: '',
        image_url: '',
        featured: false
      });
      
      toast({
        title: "Success",
        description: "Project added successfully!"
      });
    } catch (error) {
      console.error('Error adding project:', error);
      toast({
        title: "Error",
        description: `Failed to add project: ${error.message}`,
        variant: "destructive"
      });
    }
  };

  const deleteProject = async (id: string) => {
    try {
      console.log('Deleting project with id:', id);
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting project:', error);
        throw error;
      }

      setProjects(projects.filter(project => project.id !== id));
      
      toast({
        title: "Success",
        description: "Project deleted successfully!"
      });
    } catch (error) {
      console.error('Error deleting project:', error);
      toast({
        title: "Error",
        description: `Failed to delete project: ${error.message}`,
        variant: "destructive"
      });
    }
  };

  const updateProject = async (project: Project) => {
    try {
      console.log('Updating project:', project);
      const { id, ...projectData } = project;
      const { error } = await supabase
        .from('projects')
        .update(projectData)
        .eq('id', id);

      if (error) {
        console.error('Error updating project:', error);
        throw error;
      }

      toast({
        title: "Success",
        description: "Project updated successfully!"
      });
    } catch (error) {
      console.error('Error updating project:', error);
      toast({
        title: "Error",
        description: `Failed to update project: ${error.message}`,
        variant: "destructive"
      });
    }
  };

  const addTechToProject = (projectId: string | undefined, tech: string, isNewProject = false) => {
    if (!tech.trim()) return;

    if (isNewProject) {
      setNewProject({
        ...newProject,
        tech_stack: [...newProject.tech_stack, tech.trim()]
      });
    } else {
      const updatedProjects = projects.map(p => 
        p.id === projectId 
          ? { ...p, tech_stack: [...p.tech_stack, tech.trim()] }
          : p
      );
      setProjects(updatedProjects);
    }
  };

  const removeTechFromProject = (projectId: string | undefined, techIndex: number, isNewProject = false) => {
    if (isNewProject) {
      setNewProject({
        ...newProject,
        tech_stack: newProject.tech_stack.filter((_, index) => index !== techIndex)
      });
    } else {
      const updatedProjects = projects.map(p => 
        p.id === projectId 
          ? { ...p, tech_stack: p.tech_stack.filter((_, index) => index !== techIndex) }
          : p
      );
      setProjects(updatedProjects);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="animate-spin text-white" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4">Projects Manager</h1>
        <p className="text-gray-300">Manage your portfolio projects</p>
      </div>

      {/* Add New Project */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
        <h2 className="text-2xl font-bold text-white mb-6">Add New Project</h2>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Project Title</label>
              <input
                type="text"
                value={newProject.title}
                onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-colors"
                placeholder="Enter project title"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Image URL</label>
              <input
                type="url"
                value={newProject.image_url}
                onChange={(e) => setNewProject({ ...newProject, image_url: e.target.value })}
                className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-colors"
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
            <textarea
              value={newProject.description}
              onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-colors resize-none"
              placeholder="Enter project description"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">GitHub URL</label>
              <input
                type="url"
                value={newProject.github_url}
                onChange={(e) => setNewProject({ ...newProject, github_url: e.target.value })}
                className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-colors"
                placeholder="https://github.com/username/repo"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Live URL</label>
              <input
                type="url"
                value={newProject.live_url}
                onChange={(e) => setNewProject({ ...newProject, live_url: e.target.value })}
                className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-colors"
                placeholder="https://project-demo.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Tech Stack</label>
            <div className="flex space-x-2 mb-2">
              <input
                type="text"
                value={techInput}
                onChange={(e) => setTechInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    addTechToProject(undefined, techInput, true);
                    setTechInput('');
                  }
                }}
                className="flex-1 px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-colors"
                placeholder="Add technology (press Enter)"
              />
              <button
                onClick={() => {
                  addTechToProject(undefined, techInput, true);
                  setTechInput('');
                }}
                className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {newProject.tech_stack.map((tech, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm cursor-pointer hover:bg-red-500/20 hover:text-red-300"
                  onClick={() => removeTechFromProject(undefined, index, true)}
                >
                  {tech} ×
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={newProject.featured}
                onChange={(e) => setNewProject({ ...newProject, featured: e.target.checked })}
                className="rounded border-white/20 bg-white/5 text-cyan-500 focus:ring-cyan-400"
              />
              <span className="text-gray-300">Featured Project</span>
            </label>
            
            <button
              onClick={addProject}
              className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-300"
            >
              <Plus size={16} />
              <span>Add Project</span>
            </button>
          </div>
        </div>
      </div>

      {/* Projects List */}
      <div className="grid gap-6">
        {projects.map((project) => (
          <div key={project.id} className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <input
                  type="text"
                  value={project.title}
                  onChange={(e) => {
                    const updatedProjects = projects.map(p => 
                      p.id === project.id ? { ...p, title: e.target.value } : p
                    );
                    setProjects(updatedProjects);
                  }}
                  onBlur={() => updateProject(project)}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white font-semibold"
                />
                
                <textarea
                  value={project.description}
                  onChange={(e) => {
                    const updatedProjects = projects.map(p => 
                      p.id === project.id ? { ...p, description: e.target.value } : p
                    );
                    setProjects(updatedProjects);
                  }}
                  onBlur={() => updateProject(project)}
                  rows={3}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white resize-none"
                />

                <div className="flex flex-wrap gap-2">
                  {project.tech_stack.map((tech, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm cursor-pointer hover:bg-red-500/20 hover:text-red-300"
                      onClick={() => {
                        removeTechFromProject(project.id, index);
                        updateProject(project);
                      }}
                    >
                      {tech} ×
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <input
                  type="url"
                  value={project.image_url}
                  onChange={(e) => {
                    const updatedProjects = projects.map(p => 
                      p.id === project.id ? { ...p, image_url: e.target.value } : p
                    );
                    setProjects(updatedProjects);
                  }}
                  onBlur={() => updateProject(project)}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
                  placeholder="Image URL"
                />

                <input
                  type="url"
                  value={project.github_url}
                  onChange={(e) => {
                    const updatedProjects = projects.map(p => 
                      p.id === project.id ? { ...p, github_url: e.target.value } : p
                    );
                    setProjects(updatedProjects);
                  }}
                  onBlur={() => updateProject(project)}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
                  placeholder="GitHub URL"
                />

                <input
                  type="url"
                  value={project.live_url}
                  onChange={(e) => {
                    const updatedProjects = projects.map(p => 
                      p.id === project.id ? { ...p, live_url: e.target.value } : p
                    );
                    setProjects(updatedProjects);
                  }}
                  onBlur={() => updateProject(project)}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
                  placeholder="Live Demo URL"
                />

                <div className="flex items-center justify-between">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={project.featured}
                      onChange={(e) => {
                        const updatedProjects = projects.map(p => 
                          p.id === project.id ? { ...p, featured: e.target.checked } : p
                        );
                        setProjects(updatedProjects);
                        updateProject({ ...project, featured: e.target.checked });
                      }}
                      className="rounded border-white/20 bg-white/5 text-cyan-500 focus:ring-cyan-400"
                    />
                    <span className="text-gray-300">Featured</span>
                  </label>

                  <div className="flex space-x-2">
                    {project.github_url && (
                      <a
                        href={project.github_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors"
                      >
                        <Github size={16} />
                      </a>
                    )}
                    {project.live_url && (
                      <a
                        href={project.live_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
                      >
                        <ExternalLink size={16} />
                      </a>
                    )}
                    <button
                      onClick={() => deleteProject(project.id!)}
                      className="p-2 bg-red-500 hover:bg-red-600 text-white rounded transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectsEditor;
