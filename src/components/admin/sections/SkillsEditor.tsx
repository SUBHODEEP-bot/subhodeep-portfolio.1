
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Trash2, Save, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Skill {
  id?: string;
  name: string;
  category: string;
  proficiency: number;
  icon_name: string;
}

const SkillsEditor = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [newSkill, setNewSkill] = useState<Skill>({
    name: '',
    category: 'programming',
    proficiency: 50,
    icon_name: 'Code'
  });

  const categories = ['programming', 'tools', 'soft'];
  const iconOptions = ['Code', 'Globe', 'Terminal', 'Server', 'FileCode', 'GitBranch', 'Box', 'Cloud', 'Users', 'MessageSquare', 'Lightbulb', 'Database', 'Smartphone', 'Monitor'];

  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('skills')
        .select('*')
        .order('category, name');

      if (error) throw error;
      setSkills(data || []);
    } catch (error) {
      console.error('Error fetching skills:', error);
      toast({
        title: "Error",
        description: "Failed to load skills",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addSkill = async () => {
    if (!newSkill.name.trim()) {
      toast({
        title: "Error",
        description: "Please enter a skill name",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('skills')
        .insert([newSkill])
        .select()
        .single();

      if (error) throw error;

      setSkills([...skills, data]);
      setNewSkill({ name: '', category: 'programming', proficiency: 50, icon_name: 'Code' });
      
      toast({
        title: "Success",
        description: "Skill added successfully!"
      });
    } catch (error) {
      console.error('Error adding skill:', error);
      toast({
        title: "Error",
        description: "Failed to add skill",
        variant: "destructive"
      });
    }
  };

  const deleteSkill = async (id: string) => {
    try {
      const { error } = await supabase
        .from('skills')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setSkills(skills.filter(skill => skill.id !== id));
      
      toast({
        title: "Success",
        description: "Skill deleted successfully!"
      });
    } catch (error) {
      console.error('Error deleting skill:', error);
      toast({
        title: "Error",
        description: "Failed to delete skill",
        variant: "destructive"
      });
    }
  };

  const updateSkill = async (skill: Skill) => {
    try {
      const { error } = await supabase
        .from('skills')
        .update({
          name: skill.name,
          category: skill.category,
          proficiency: skill.proficiency,
          icon_name: skill.icon_name
        })
        .eq('id', skill.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Skill updated successfully!"
      });
    } catch (error) {
      console.error('Error updating skill:', error);
      toast({
        title: "Error",
        description: "Failed to update skill",
        variant: "destructive"
      });
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
        <h1 className="text-4xl font-bold text-white mb-4">Skills Manager</h1>
        <p className="text-gray-300">Manage your technical and soft skills</p>
      </div>

      {/* Add New Skill */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
        <h2 className="text-2xl font-bold text-white mb-6">Add New Skill</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Skill Name</label>
            <input
              type="text"
              value={newSkill.name}
              onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
              className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-colors"
              placeholder="e.g., React"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
            <select
              value={newSkill.category}
              onChange={(e) => setNewSkill({ ...newSkill, category: e.target.value })}
              className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-colors"
            >
              {categories.map(cat => (
                <option key={cat} value={cat} className="bg-gray-800">
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Proficiency (%)</label>
            <input
              type="number"
              min="0"
              max="100"
              value={newSkill.proficiency}
              onChange={(e) => setNewSkill({ ...newSkill, proficiency: parseInt(e.target.value) || 0 })}
              className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Icon</label>
            <select
              value={newSkill.icon_name}
              onChange={(e) => setNewSkill({ ...newSkill, icon_name: e.target.value })}
              className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-colors"
            >
              {iconOptions.map(icon => (
                <option key={icon} value={icon} className="bg-gray-800">{icon}</option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={addSkill}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-300"
            >
              <Plus size={16} />
              <span>Add</span>
            </button>
          </div>
        </div>
      </div>

      {/* Skills List */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
        <h2 className="text-2xl font-bold text-white mb-6">Current Skills</h2>
        <div className="space-y-4">
          {skills.map((skill) => (
            <div key={skill.id} className="bg-white/5 border border-white/20 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-center">
                <input
                  type="text"
                  value={skill.name}
                  onChange={(e) => {
                    const updatedSkills = skills.map(s => 
                      s.id === skill.id ? { ...s, name: e.target.value } : s
                    );
                    setSkills(updatedSkills);
                  }}
                  onBlur={() => updateSkill(skill)}
                  className="px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
                />
                
                <select
                  value={skill.category}
                  onChange={(e) => {
                    const updatedSkills = skills.map(s => 
                      s.id === skill.id ? { ...s, category: e.target.value } : s
                    );
                    setSkills(updatedSkills);
                    updateSkill({ ...skill, category: e.target.value });
                  }}
                  className="px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat} className="bg-gray-800">
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </option>
                  ))}
                </select>

                <input
                  type="number"
                  min="0"
                  max="100"
                  value={skill.proficiency}
                  onChange={(e) => {
                    const updatedSkills = skills.map(s => 
                      s.id === skill.id ? { ...s, proficiency: parseInt(e.target.value) || 0 } : s
                    );
                    setSkills(updatedSkills);
                  }}
                  onBlur={() => updateSkill(skill)}
                  className="px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
                />

                <select
                  value={skill.icon_name}
                  onChange={(e) => {
                    const updatedSkills = skills.map(s => 
                      s.id === skill.id ? { ...s, icon_name: e.target.value } : s
                    );
                    setSkills(updatedSkills);
                    updateSkill({ ...skill, icon_name: e.target.value });
                  }}
                  className="px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
                >
                  {iconOptions.map(icon => (
                    <option key={icon} value={icon} className="bg-gray-800">{icon}</option>
                  ))}
                </select>

                <button
                  onClick={() => deleteSkill(skill.id!)}
                  className="flex items-center justify-center px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SkillsEditor;
