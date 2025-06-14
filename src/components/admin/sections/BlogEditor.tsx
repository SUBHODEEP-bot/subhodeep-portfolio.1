
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Save, Plus, Trash2, Eye, EyeOff, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featured_image: string;
  published: boolean;
  published_at: string;
}

const BlogEditor = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('blog')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast({
        title: "Error",
        description: "Failed to load blog posts",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createNewPost = () => {
    const newPost: BlogPost = {
      id: '',
      title: '',
      slug: '',
      content: '',
      excerpt: '',
      featured_image: '',
      published: false,
      published_at: ''
    };
    setSelectedPost(newPost);
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const updatePost = (field: keyof BlogPost, value: any) => {
    if (!selectedPost) return;

    const updated = { ...selectedPost, [field]: value };
    
    // Auto-generate slug when title changes
    if (field === 'title') {
      updated.slug = generateSlug(value);
    }

    setSelectedPost(updated);
  };

  const savePost = async () => {
    if (!selectedPost || !selectedPost.title || !selectedPost.content) {
      toast({
        title: "Error",
        description: "Title and content are required",
        variant: "destructive"
      });
      return;
    }

    setSaving(true);
    try {
      const postData = {
        title: selectedPost.title,
        slug: selectedPost.slug || generateSlug(selectedPost.title),
        content: selectedPost.content,
        excerpt: selectedPost.excerpt,
        featured_image: selectedPost.featured_image,
        published: selectedPost.published,
        published_at: selectedPost.published ? new Date().toISOString() : null
      };

      if (selectedPost.id) {
        const { error } = await supabase
          .from('blog')
          .update(postData)
          .eq('id', selectedPost.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('blog')
          .insert(postData);

        if (error) throw error;
      }

      await fetchPosts();
      setSelectedPost(null);
      toast({
        title: "Success",
        description: "Blog post saved successfully!"
      });
    } catch (error) {
      console.error('Error saving post:', error);
      toast({
        title: "Error",
        description: "Failed to save blog post",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const deletePost = async (postId: string) => {
    try {
      const { error } = await supabase
        .from('blog')
        .delete()
        .eq('id', postId);

      if (error) throw error;

      await fetchPosts();
      if (selectedPost?.id === postId) {
        setSelectedPost(null);
      }
      toast({
        title: "Success",
        description: "Blog post deleted successfully!"
      });
    } catch (error) {
      console.error('Error deleting post:', error);
      toast({
        title: "Error",
        description: "Failed to delete blog post",
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
        <h1 className="text-4xl font-bold text-white mb-4">Blog Editor</h1>
        <p className="text-gray-300">Manage your thoughts and articles</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Posts List */}
        <div className="lg:col-span-1">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-white">Posts</h2>
              <button
                onClick={createNewPost}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-300"
              >
                <Plus size={16} />
                <span>New</span>
              </button>
            </div>

            <div className="space-y-3">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className={`p-4 rounded-lg cursor-pointer transition-colors ${
                    selectedPost?.id === post.id
                      ? 'bg-cyan-500/20 border border-cyan-400/50'
                      : 'bg-white/5 hover:bg-white/10 border border-white/10'
                  }`}
                  onClick={() => setSelectedPost(post)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-white text-sm truncate">{post.title}</h3>
                    <div className="flex items-center space-x-2">
                      {post.published ? (
                        <Eye className="text-green-400" size={14} />
                      ) : (
                        <EyeOff className="text-gray-400" size={14} />
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deletePost(post.id);
                        }}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <p className="text-gray-400 text-xs truncate">{post.excerpt}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Post Editor */}
        <div className="lg:col-span-2">
          {selectedPost ? (
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={selectedPost.title}
                    onChange={(e) => updatePost('title', e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-colors"
                    placeholder="Enter blog post title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Slug
                  </label>
                  <input
                    type="text"
                    value={selectedPost.slug}
                    onChange={(e) => updatePost('slug', e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-colors"
                    placeholder="url-friendly-slug"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Excerpt
                  </label>
                  <textarea
                    value={selectedPost.excerpt}
                    onChange={(e) => updatePost('excerpt', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-colors resize-none"
                    placeholder="Brief description of the post..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Featured Image URL
                  </label>
                  <input
                    type="url"
                    value={selectedPost.featured_image}
                    onChange={(e) => updatePost('featured_image', e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-colors"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Content *
                  </label>
                  <textarea
                    value={selectedPost.content}
                    onChange={(e) => updatePost('content', e.target.value)}
                    rows={12}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-colors resize-none"
                    placeholder="Write your blog post content here..."
                  />
                </div>

                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="published"
                    checked={selectedPost.published}
                    onChange={(e) => updatePost('published', e.target.checked)}
                    className="w-4 h-4 text-cyan-500 bg-white/5 border-white/20 rounded focus:ring-cyan-400 focus:ring-2"
                  />
                  <label htmlFor="published" className="text-sm text-gray-300">
                    Publish this post
                  </label>
                </div>

                <div className="flex justify-between items-center pt-6 border-t border-white/20">
                  <button
                    onClick={() => setSelectedPost(null)}
                    className="px-6 py-3 border border-white/20 text-white rounded-lg hover:bg-white/10 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={savePost}
                    disabled={saving}
                    className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Save size={20} />
                    <span>{saving ? 'Saving...' : 'Save Post'}</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 text-center">
              <h3 className="text-xl font-semibold text-white mb-4">Select a Post to Edit</h3>
              <p className="text-gray-300 mb-6">Choose a post from the list or create a new one</p>
              <button
                onClick={createNewPost}
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-300 mx-auto"
              >
                <Plus size={20} />
                <span>Create New Post</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BlogEditor;
