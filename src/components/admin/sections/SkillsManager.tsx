
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Trash2, Save, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import * as Icons from 'lucide-react';

interface Skill {
  id?: string;
  name: string;
  category: string;
  proficiency: number;
  icon_name: string;
}

const SkillsManager = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [newSkill, setNewSkill] = useState<Skill>({
    name: '',
    category: 'programming',
    proficiency: 50,
    icon_name: 'Code'
  });

  const skillCategories = ['programming', 'tools', 'soft'];

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
      toast({ title: "Error", description: "Please enter a skill name", variant: "destructive" });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('skills')
        .insert([newSkill])
        .select()
        .single();

      if (error) throw error;

      setSkills([...skills, data].sort((a,b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name)));
      setNewSkill({ name: '', category: 'programming', proficiency: 50, icon_name: 'Code' });
      toast({ title: "Success", description: "Skill added successfully!" });
    } catch (error) {
      console.error('Error adding skill:', error);
      toast({ title: "Error", description: "Failed to add skill", variant: "destructive" });
    }
  };

  const deleteSkill = async (id: string) => {
    try {
      const { error } = await supabase.from('skills').delete().eq('id', id);
      if (error) throw error;
      setSkills(skills.filter(skill => skill.id !== id));
      toast({ title: "Success", description: "Skill deleted successfully!" });
    } catch (error) {
      console.error('Error deleting skill:', error);
      toast({ title: "Error", description: "Failed to delete skill", variant: "destructive" });
    }
  };

  const updateSkill = async (skill: Skill) => {
    try {
      const { id, ...skillData } = skill;
      const { error } = await supabase
        .from('skills')
        .update(skillData)
        .eq('id', id);

      if (error) throw error;
      toast({ title: "Success", description: "Skill updated successfully!" });
    } catch (error) {
      console.error('Error updating skill:', error);
      toast({ title: "Error", description: "Failed to update skill", variant: "destructive" });
    }
  };
  
  const handleSkillChange = (id: string, field: keyof Skill, value: any) => {
    setSkills(skills.map(s => s.id === id ? { ...s, [field]: value } : s));
  };
  
  const getIconComponent = (iconName: string) => {
    const IconComponent = (Icons as any)[iconName];
    return IconComponent || Icons.Code;
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
        <p className="text-gray-300">Add, edit, and remove your skills.</p>
      </div>

      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
        <h2 className="text-2xl font-bold text-white mb-6">Add New Skill</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Skill Name</label>
            <input
              type="text"
              value={newSkill.name}
              onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
              className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-colors"
              placeholder="e.g. React"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
            <select
              value={newSkill.category}
              onChange={(e) => setNewSkill({ ...newSkill, category: e.target.value })}
              className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-colors capitalize"
            >
              {skillCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Proficiency ({newSkill.proficiency}%)</label>
            <input
              type="range"
              min="0"
              max="100"
              value={newSkill.proficiency}
              onChange={(e) => setNewSkill({ ...newSkill, proficiency: parseInt(e.target.value) })}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Icon Name</label>
            <input
              type="text"
              value={newSkill.icon_name}
              onChange={(e) => setNewSkill({ ...newSkill, icon_name: e.target.value })}
              className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-colors"
              placeholder="e.g. Code"
            />
          </div>
        </div>
        <div className="mt-6 flex justify-end">
          <button
            onClick={addSkill}
            className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-300"
          >
            <Plus size={16} />
            <span>Add Skill</span>
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {skills.map((skill) => {
          const IconComponent = getIconComponent(skill.icon_name);
          return (
            <div key={skill.id} className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 flex flex-wrap items-center gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center">
                <IconComponent className="text-cyan-400" size={24} />
              </div>
              <div className="flex-grow grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-center">
                <input
                  type="text"
                  value={skill.name}
                  onChange={(e) => handleSkillChange(skill.id!, 'name', e.target.value)}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
                />
                <select
                  value={skill.category}
                  onChange={(e) => handleSkillChange(skill.id!, 'category', e.target.value)}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white capitalize"
                >
                  {skillCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={skill.proficiency}
                    onChange={(e) => handleSkillChange(skill.id!, 'proficiency', parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                  />
                  <span className="text-white w-10 text-right">{skill.proficiency}%</span>
                </div>
                <input
                  type="text"
                  value={skill.icon_name}
                  onChange={(e) => handleSkillChange(skill.id!, 'icon_name', e.target.value)}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
                />
              </div>
              <div className="flex space-x-2 ml-auto">
                <button
                  onClick={() => updateSkill(skill)}
                  className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                  aria-label="Save skill"
                >
                  <Save size={16} />
                </button>
                <button
                  onClick={() => deleteSkill(skill.id!)}
                  className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                  aria-label="Delete skill"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SkillsManager;
