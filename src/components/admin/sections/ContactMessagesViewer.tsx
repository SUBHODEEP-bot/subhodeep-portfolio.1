
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Trash2, Check, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';

type Message = {
  id: string;
  created_at: string;
  name: string;
  email: string;
  message: string;
  is_read: boolean;
};

const ContactMessagesViewer = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast({
        title: "Error",
        description: "Failed to fetch messages.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const toggleReadStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('contact_messages')
        .update({ is_read: !currentStatus })
        .eq('id', id);
      
      if (error) throw error;
      toast({ title: "Success", description: "Message status updated." });
      fetchMessages(); // Refresh the list
    } catch (error) {
      console.error("Error updating message status:", error);
      toast({ title: "Error", description: "Failed to update message.", variant: "destructive" });
    }
  };

  const deleteMessage = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this message?")) return;
    try {
      const { error } = await supabase.from('contact_messages').delete().eq('id', id);
      if (error) throw error;
      toast({ title: "Success", description: "Message deleted." });
      fetchMessages(); // Refresh the list
    } catch (error) {
      console.error("Error deleting message:", error);
      toast({ title: "Error", description: "Failed to delete message.", variant: "destructive" });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="animate-spin text-cyan-400" size={32} />
      </div>
    );
  }

  return (
    <div className="bg-slate-800/50 backdrop-blur-md rounded-2xl p-8 border border-slate-700/50">
      <h2 className="text-2xl font-bold text-white mb-6">Received Messages</h2>
      {messages.length === 0 ? (
        <p className="text-gray-400">No messages yet.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-white">Received</TableHead>
              <TableHead className="text-white">From</TableHead>
              <TableHead className="text-white">Message</TableHead>
              <TableHead className="text-white">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {messages.map((msg) => (
              <TableRow key={msg.id} className={msg.is_read ? 'opacity-60' : ''}>
                <TableCell>{format(new Date(msg.created_at), 'MMM dd, yyyy')}</TableCell>
                <TableCell>
                  <div className="font-medium">{msg.name}</div>
                  <div>{msg.email}</div>
                </TableCell>
                <TableCell className="max-w-sm whitespace-pre-wrap">{msg.message}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="icon" onClick={() => toggleReadStatus(msg.id, msg.is_read)}>
                      <Check size={16} />
                    </Button>
                    <Button variant="destructive" size="icon" onClick={() => deleteMessage(msg.id)}>
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

export default ContactMessagesViewer;
