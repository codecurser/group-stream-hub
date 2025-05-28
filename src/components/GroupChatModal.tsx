
import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Send, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { User } from '@supabase/supabase-js';
import { useToast } from "@/hooks/use-toast";

interface GroupChatModalProps {
  group: any;
  user: User;
  isOpen: boolean;
  onClose: () => void;
}

const GroupChatModal = ({ group, user, isOpen, onClose }: GroupChatModalProps) => {
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch chat messages
  const { data: messages = [] } = useQuery({
    queryKey: ['chat-messages', group.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('chat_messages')
        .select(`
          *,
          profiles (
            full_name
          )
        `)
        .eq('group_id', group.id)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data || [];
    },
    enabled: isOpen
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (messageText: string) => {
      const { error } = await supabase
        .from('chat_messages')
        .insert({
          group_id: group.id,
          user_id: user.id,
          message: messageText
        });

      if (error) throw error;
    },
    onSuccess: () => {
      setMessage('');
      queryClient.invalidateQueries({ queryKey: ['chat-messages', group.id] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
      console.error('Send message error:', error);
    }
  });

  // Set up real-time subscription for new messages
  useEffect(() => {
    if (!isOpen) return;

    const channel = supabase
      .channel('chat-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `group_id=eq.${group.id}`
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['chat-messages', group.id] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isOpen, group.id, queryClient]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    
    sendMessageMutation.mutate(message.trim());
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getUserName = (msg: any) => {
    if (msg.user_id === user.id) return 'You';
    return msg.profiles?.full_name || 'User';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl h-[600px] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            {group.name} Chat
          </DialogTitle>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{group.platform}</Badge>
            <span className="text-sm text-gray-500">
              {group.group_members?.length || 0} members
            </span>
          </div>
        </DialogHeader>
        
        <div className="flex-1 flex flex-col min-h-0">
          {/* Messages area */}
          <div className="flex-1 overflow-y-auto space-y-3 p-4 bg-gray-50 rounded-lg">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <p>No messages yet. Start the conversation!</p>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.user_id === user.id ? 'justify-end' : 'justify-start'}`}
                >
                  <Card 
                    className={`max-w-xs ${
                      msg.user_id === user.id 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-white'
                    }`}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium">
                          {getUserName(msg)}
                        </span>
                        <span className={`text-xs ${
                          msg.user_id === user.id ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                          {formatTime(msg.created_at)}
                        </span>
                      </div>
                      <p className="text-sm">{msg.message}</p>
                    </CardContent>
                  </Card>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message input */}
          <form onSubmit={handleSendMessage} className="flex gap-2 mt-4">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1"
              disabled={sendMessageMutation.isPending}
            />
            <Button 
              type="submit" 
              disabled={!message.trim() || sendMessageMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GroupChatModal;
