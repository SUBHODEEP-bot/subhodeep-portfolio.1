
import React, { useEffect, useState } from 'react';
import { Calendar, Clock, ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featured_image: string;
  published: boolean;
  published_at: string;
  created_at: string;
}

const Blog = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const { data, error } = await supabase
          .from('blog')
          .select('*')
          .eq('published', true)
          .order('published_at', { ascending: false });

        if (error) throw error;
        setPosts(data || []);
      } catch (error) {
        console.error('Error fetching blog posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const estimateReadingTime = (content: string) => {
    const wordsPerMinute = 200;
    const words = content.split(' ').length;
    return Math.ceil(words / wordsPerMinute);
  };

  if (loading) {
    return (
      <div className="relative py-12 sm:py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="animate-pulse">
            <div className="h-8 bg-white/20 rounded mb-4"></div>
            <div className="h-4 bg-white/10 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (posts.length === 0) {
    return null;
  }

  return (
    <div className="relative py-12 sm:py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8 sm:mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-3 sm:mb-4">
            Blog & Thoughts
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-cyan-400 to-purple-500 mx-auto"></div>
          <p className="text-gray-300 mt-6">
            Sharing insights, experiences, and thoughts on technology and life
          </p>
        </div>

        {selectedPost ? (
          // Single post view
          <div className="bg-white/10 backdrop-blur-md rounded-2xl overflow-hidden border border-white/20">
            <button
              onClick={() => setSelectedPost(null)}
              className="m-6 text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              ← Back to all posts
            </button>

            {selectedPost.featured_image && (
              <div className="aspect-video overflow-hidden">
                <img
                  src={selectedPost.featured_image}
                  alt={selectedPost.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="p-8">
              <div className="flex items-center space-x-4 text-gray-300 text-sm mb-6">
                <div className="flex items-center space-x-2">
                  <Calendar size={16} />
                  <span>{formatDate(selectedPost.published_at || selectedPost.created_at)}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock size={16} />
                  <span>{estimateReadingTime(selectedPost.content)} min read</span>
                </div>
              </div>

              <h1 className="text-3xl md:text-4xl font-bold text-white mb-6">
                {selectedPost.title}
              </h1>

              <div className="prose prose-invert max-w-none">
                <div className="text-gray-300 leading-relaxed whitespace-pre-line">
                  {selectedPost.content}
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Posts list view
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8">
            {posts.map((post) => (
              <article
                key={post.id}
                className="bg-white/10 backdrop-blur-md rounded-2xl overflow-hidden border border-white/20 hover:border-cyan-400/50 transition-all duration-300 cursor-pointer group"
                onClick={() => setSelectedPost(post)}
              >
                <div className="md:flex">
                  {post.featured_image && (
                    <div className="md:w-1/3">
                      <div className="aspect-video md:aspect-square overflow-hidden">
                        <img
                          src={post.featured_image}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    </div>
                  )}

                  <div className={`p-8 ${post.featured_image ? 'md:w-2/3' : 'w-full'}`}>
                    <div className="flex items-center space-x-4 text-gray-300 text-sm mb-4">
                      <div className="flex items-center space-x-2">
                        <Calendar size={16} />
                        <span>{formatDate(post.published_at || post.created_at)}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock size={16} />
                        <span>{estimateReadingTime(post.content)} min read</span>
                      </div>
                    </div>

                    <h2 className="text-2xl font-bold text-white mb-4 group-hover:text-cyan-400 transition-colors">
                      {post.title}
                    </h2>

                    <p className="text-gray-300 mb-6 line-clamp-3">
                      {post.excerpt || post.content.substring(0, 200) + '...'}
                    </p>

                    <div className="flex items-center text-cyan-400 font-medium group-hover:text-cyan-300 transition-colors">
                      <span>Read more</span>
                      <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Blog;
