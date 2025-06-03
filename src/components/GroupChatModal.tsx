import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
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
import { useVirtualizer } from '@tanstack/react-virtual';

interface GroupChatModalProps {
  group: any;
  user: User;
  isOpen: boolean;
  onClose: () => void;
}

const GroupChatModal = ({ group, user, isOpen, onClose }: GroupChatModalProps) => {
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const parentRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 20;

  console.log('GroupChatModal props:', { group, user: user?.id, isOpen });

  // Fetch chat messages with pagination
  const { data: messages = [], error: messagesError, isLoading: messagesLoading } = useQuery({
    queryKey: ['chat-messages', group?.id, page],
    queryFn: async () => {
      if (!group?.id) return [];

      const from = (page - 1) * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      const { data: messagesData, error: messagesError } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('group_id', group.id)
        .order('created_at', { ascending: false })
        .range(from, to);

      if (messagesError) throw messagesError;

      // Get unique user IDs from messages
      const userIds = [...new Set(messagesData.map(msg => msg.user_id))];
      
      // Fetch profiles for these users
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', userIds);

      // Combine messages with profile data
      return messagesData.map(msg => ({
        ...msg,
        profiles: profilesData?.find(profile => profile.id === msg.user_id) || null
      })).reverse(); // Reverse to show oldest first
    },
    enabled: isOpen && !!group?.id,
    keepPreviousData: true
  });

  // Virtualization setup
  const rowVirtualizer = useVirtualizer({
    count: messages.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 80, // Estimated height of each message
    overscan: 5
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (messageText: string) => {
      console.log('Sending message:', { messageText, groupId: group?.id, userId: user?.id });
      
      if (!group?.id || !user?.id) {
        throw new Error('Missing group ID or user ID');
      }

      const { data, error } = await supabase
        .from('chat_messages')
        .insert({
          group_id: group.id,
          user_id: user.id,
          message: messageText
        })
        .select()
        .single();

      console.log('Send message result:', { data, error });

      if (error) {
        console.error('Error sending message:', error);
        throw error;
      }
      
      return data;
    },
    onSuccess: (data) => {
      console.log('Message sent successfully:', data);
      setMessage('');
      queryClient.invalidateQueries({ queryKey: ['chat-messages', group?.id, page] });
    },
    onError: (error) => {
      console.error('Send message error:', error);
      toast({
        title: "Error",
        description: `Failed to send message: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  // Optimized real-time subscription
  useEffect(() => {
    if (!isOpen || !group?.id) return;

    const channel = supabase
      .channel(`chat-messages-${group.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `group_id=eq.${group.id}`
        },
        (payload) => {
          // Only invalidate the first page since new messages appear at the top
          queryClient.invalidateQueries({ queryKey: ['chat-messages', group.id, 1] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isOpen, group?.id, queryClient]);

  // Optimized auto-scroll
  const scrollToBottom = useCallback(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages.length]);

  useEffect(() => {
    scrollToBottom();
  }, [scrollToBottom]);

  // Memoized message rendering
  const renderMessage = useCallback((msg: any) => (
    <div
      key={msg.id}
      className={`flex ${msg.user_id === user?.id ? 'justify-end' : 'justify-start'}`}
    >
      <Card 
        className={`max-w-xs ${
          msg.user_id === user?.id 
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
              msg.user_id === user?.id ? 'text-blue-100' : 'text-gray-500'
            }`}>
              {formatTime(msg.created_at)}
            </span>
          </div>
          <p className="text-sm">{msg.message}</p>
        </CardContent>
      </Card>
    </div>
  ), [user?.id]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    
    console.log('Handling send message:', message.trim());
    sendMessageMutation.mutate(message.trim());
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getUserName = (msg: any) => {
    if (msg.user_id === user?.id) return 'You';
    return msg.profiles?.full_name || 'User';
  };

  // Show error state
  if (messagesError) {
    console.error('Messages error in render:', messagesError);
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl h-[600px] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            {group?.name || 'Unknown Group'} Chat
          </DialogTitle>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{group?.platform || 'Unknown'}</Badge>
            <span className="text-sm text-gray-500">
              {group?.group_members?.length || 0} members
            </span>
          </div>
        </DialogHeader>
        
        <div className="flex-1 flex flex-col min-h-0">
          {messagesError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <p className="text-red-700 text-sm">
                Error loading messages: {messagesError.message}
              </p>
            </div>
          )}

          <div 
            ref={parentRef}
            className="flex-1 overflow-y-auto space-y-3 p-4 bg-gray-50 rounded-lg"
          >
            {messagesLoading ? (
              <div className="text-center text-gray-500 py-8">
                <p>Loading messages...</p>
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <p>No messages yet. Start the conversation!</p>
              </div>
            ) : (
              <div
                style={{
                  height: `${rowVirtualizer.getTotalSize()}px`,
                  width: '100%',
                  position: 'relative',
                }}
              >
                {rowVirtualizer.getVirtualItems().map((virtualRow) => (
                  <div
                    key={virtualRow.index}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      transform: `translateY(${virtualRow.start}px)`,
                    }}
                  >
                    {renderMessage(messages[virtualRow.index])}
                  </div>
                ))}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSendMessage} className="flex gap-2 mt-4">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1"
              disabled={sendMessageMutation.isPending || !group?.id || !user?.id}
            />
            <Button 
              type="submit" 
              disabled={!message.trim() || sendMessageMutation.isPending || !group?.id || !user?.id}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>

          {/* Debug information */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-2 p-2 bg-gray-100 rounded text-xs">
              <p>Debug: Group ID: {group?.id || 'missing'}</p>
              <p>Debug: User ID: {user?.id || 'missing'}</p>
              <p>Debug: Messages count: {messages.length}</p>
              <p>Debug: Loading: {messagesLoading ? 'yes' : 'no'}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GroupChatModal;
