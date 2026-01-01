
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import * as Icons from 'lucide-react';

interface Skill {
  id: string;
  name: string;
  category: string;
  proficiency: number;
  icon_name: string;
}

const Skills = () => {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const { data, error } = await supabase
          .from('skills')
          .select('*')
          .order('category, name');

        if (error) throw error;
        setSkills(data || []);
      } catch (error) {
        console.error('Error fetching skills:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSkills();
  }, []);

  const getSkillsByCategory = (category: string) => {
    return skills.filter(skill => skill.category === category);
  };

  const getIconComponent = (iconName: string) => {
    const IconComponent = (Icons as any)[iconName];
    return IconComponent || Icons.Code;
  };

  const categories = [
    { key: 'programming', title: 'Programming Languages', color: 'from-blue-500 to-cyan-500' },
    { key: 'tools', title: 'Tools & Technologies', color: 'from-green-500 to-emerald-500' },
    { key: 'soft', title: 'Soft Skills', color: 'from-purple-500 to-pink-500' }
  ];

  if (loading) {
    return (
      <div className="relative py-12 sm:py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <div className="animate-pulse text-white text-xl">Loading skills...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative py-12 sm:py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8 sm:mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-3 sm:mb-4">
            Skills & Expertise
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-cyan-400 to-purple-500 mx-auto mb-4 sm:mb-6"></div>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            A comprehensive overview of my technical skills, tools I work with, and soft skills that drive my success
          </p>
        </div>

        <div className="space-y-10 sm:space-y-16">
          {categories.map((category) => {
            const categorySkills = getSkillsByCategory(category.key);
            
            if (categorySkills.length === 0) return null;

            return (
              <div key={category.key} className="space-y-8">
                <div className="text-center">
                  <h3 className="text-3xl font-bold text-white mb-4">{category.title}</h3>
                  <div className={`w-16 h-1 bg-gradient-to-r ${category.color} mx-auto`}></div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
                  {categorySkills.map((skill) => {
                    const IconComponent = getIconComponent(skill.icon_name);
                    
                    return (
                      <div
                        key={skill.id}
                        className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 group"
                      >
                        <div className="flex items-center space-x-4 mb-4">
                          <div className={`w-12 h-12 bg-gradient-to-r ${category.color} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                            <IconComponent className="text-white" size={24} />
                          </div>
                          <div>
                            <h4 className="text-xl font-semibold text-white">{skill.name}</h4>
                            <p className="text-sm text-gray-400 capitalize">{skill.category}</p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-300">Proficiency</span>
                            <span className="text-sm font-semibold text-cyan-400">{skill.proficiency}%</span>
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-2">
                            <div
                              className={`h-2 bg-gradient-to-r ${category.color} rounded-full transition-all duration-1000 ease-out`}
                              style={{ width: `${skill.proficiency}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Skills;
