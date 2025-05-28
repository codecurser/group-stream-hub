
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Plus, Users, LogOut, Copy, DollarSign, Calendar, MessageCircle } from "lucide-react";
import CreateGroupModal from "@/components/CreateGroupModal";
import JoinGroupModal from "@/components/JoinGroupModal";
import GroupChatModal from "@/components/GroupChatModal";
import { useToast } from "@/hooks/use-toast";
import { User } from '@supabase/supabase-js';
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface DashboardProps {
  user: User;
  onLogout: () => void;
}

interface GroupMember {
  user_id: string;
  status: string;
  profiles?: {
    full_name: string | null;
  } | null;
}

interface Group {
  id: string;
  name: string;
  platform: string;
  monthly_cost: number;
  max_members: number;
  creator_id: string;
  invite_code: string;
  description?: string;
  created_at: string;
  group_members?: GroupMember[];
}

const Dashboard = ({ user, onLogout }: DashboardProps) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [selectedGroupChat, setSelectedGroupChat] = useState<Group | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all available groups
  const { data: allGroups = [], isLoading: groupsLoading } = useQuery({
    queryKey: ['groups'],
    queryFn: async (): Promise<Group[]> => {
      const { data, error } = await supabase
        .from('groups')
        .select(`
          *,
          group_members (
            user_id,
            status
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch user's group memberships
  const { data: userMemberships = [] } = useQuery({
    queryKey: ['user-memberships', user.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('group_members')
        .select('group_id')
        .eq('user_id', user.id);
      
      if (error) throw error;
      return data || [];
    }
  });

  const createGroupMutation = useMutation({
    mutationFn: async (groupData: any) => {
      const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      
      const { data: group, error: groupError } = await supabase
        .from('groups')
        .insert({
          ...groupData,
          creator_id: user.id,
          invite_code: inviteCode
        })
        .select()
        .single();

      if (groupError) throw groupError;

      // Add creator as first member
      const { error: memberError } = await supabase
        .from('group_members')
        .insert({
          group_id: group.id,
          user_id: user.id,
          status: 'active'
        });

      if (memberError) throw memberError;
      return group;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      queryClient.invalidateQueries({ queryKey: ['user-memberships'] });
      setShowCreateModal(false);
      toast({
        title: "Group created!",
        description: "Your group has been created successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create group. Please try again.",
        variant: "destructive"
      });
      console.error('Create group error:', error);
    }
  });

  const joinGroupMutation = useMutation({
    mutationFn: async (inviteCode: string) => {
      // Find group by invite code
      const { data: group, error: findError } = await supabase
        .from('groups')
        .select('*')
        .eq('invite_code', inviteCode.toUpperCase())
        .single();

      if (findError) throw new Error('Invalid invite code');

      // Check if already a member
      const { data: existingMember } = await supabase
        .from('group_members')
        .select('id')
        .eq('group_id', group.id)
        .eq('user_id', user.id)
        .single();

      if (existingMember) {
        throw new Error('Already a member of this group');
      }

      // Join the group
      const { error: joinError } = await supabase
        .from('group_members')
        .insert({
          group_id: group.id,
          user_id: user.id,
          status: 'active'
        });

      if (joinError) throw joinError;
      return group;
    },
    onSuccess: (group) => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      queryClient.invalidateQueries({ queryKey: ['user-memberships'] });
      setShowJoinModal(false);
      toast({
        title: "Joined group!",
        description: `You've successfully joined "${group.name}".`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to join group. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleCreateGroup = (groupData: any) => {
    createGroupMutation.mutate(groupData);
  };

  const handleJoinGroup = (inviteCode: string) => {
    joinGroupMutation.mutate(inviteCode);
  };

  const copyInviteCode = (inviteCode: string) => {
    navigator.clipboard.writeText(inviteCode);
    toast({
      title: "Copied!",
      description: "Invite code copied to clipboard.",
    });
  };

  const userGroupIds = userMemberships.map(m => m.group_id);
  const userGroups = allGroups.filter(g => userGroupIds.includes(g.id));
  const availableGroups = allGroups.filter(g => !userGroupIds.includes(g.id));

  const calculateMonthlyCost = (group: Group) => {
    const memberCount = group.group_members?.length || 1;
    return (group.monthly_cost / memberCount).toFixed(2);
  };

  const displayName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';

  const GroupCard = ({ group, isUserGroup = false }: { group: Group; isUserGroup?: boolean }) => (
    <Card className="hover:shadow-lg transition-all duration-300 h-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{group.name}</CardTitle>
            <CardDescription className="flex items-center gap-2 mt-1">
              <Badge variant="secondary">{group.platform}</Badge>
            </CardDescription>
          </div>
          {group.creator_id === user.id && (
            <Badge variant="outline" className="text-xs">Owner</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">
              {group.group_members?.length || 0} / {group.max_members} members
            </span>
          </div>
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-green-600" />
            <span className="font-semibold text-green-600">
              ${calculateMonthlyCost(group)}/month
            </span>
          </div>
        </div>

        {group.description && (
          <p className="text-sm text-gray-600">{group.description}</p>
        )}

        {isUserGroup && (
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Invite Code:</span>
            <div className="flex items-center gap-2">
              <code className="bg-gray-100 px-2 py-1 rounded font-mono">
                {group.invite_code}
              </code>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyInviteCode(group.invite_code)}
                className="h-6 w-6 p-0"
              >
                <Copy className="w-3 h-3" />
              </Button>
            </div>
          </div>
        )}

        <div className="pt-2 border-t">
          {isUserGroup ? (
            <div className="flex items-center justify-between">
              <div className="text-xs text-gray-500">Group Chat:</div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedGroupChat(group)}
                className="text-xs"
              >
                <MessageCircle className="w-3 h-3 mr-1" />
                Open Chat
              </Button>
            </div>
          ) : (
            <Button
              onClick={() => handleJoinGroup(group.invite_code)}
              disabled={joinGroupMutation.isPending}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {joinGroupMutation.isPending ? 'Joining...' : 'Join Group'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                PlayForm
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {displayName}</span>
              <Button 
                variant="ghost" 
                onClick={onLogout}
                className="flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">Manage your subscription groups and discover new ones</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Card className="cursor-pointer hover:shadow-lg transition-all duration-300 border-2 border-dashed border-blue-300 bg-blue-50/50"
                onClick={() => setShowCreateModal(true)}>
            <CardContent className="flex items-center justify-center p-8">
              <div className="text-center">
                <Plus className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-blue-900 mb-2">Create New Group</h3>
                <p className="text-blue-700">Start a new subscription sharing group</p>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-all duration-300 border-2 border-dashed border-purple-300 bg-purple-50/50"
                onClick={() => setShowJoinModal(true)}>
            <CardContent className="flex items-center justify-center p-8">
              <div className="text-center">
                <Users className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-purple-900 mb-2">Join Group</h3>
                <p className="text-purple-700">Join an existing group with invite code</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Groups Section */}
        <Tabs defaultValue="my-groups" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="my-groups">My Groups ({userGroups.length})</TabsTrigger>
            <TabsTrigger value="available-groups">Available Groups ({availableGroups.length})</TabsTrigger>
            <TabsTrigger value="payments">Payment History</TabsTrigger>
          </TabsList>
          
          <TabsContent value="my-groups" className="space-y-6">
            {userGroups.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No Groups Yet</h3>
                  <p className="text-gray-600 mb-6">Create your first group or join an existing one to start saving!</p>
                  <div className="flex gap-4 justify-center">
                    <Button onClick={() => setShowCreateModal(true)}>
                      Create Group
                    </Button>
                    <Button variant="outline" onClick={() => setShowJoinModal(true)}>
                      Join Group
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userGroups.map((group) => (
                  <GroupCard key={group.id} group={group} isUserGroup={true} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="available-groups" className="space-y-6">
            {groupsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading groups...</p>
              </div>
            ) : availableGroups.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No Available Groups</h3>
                  <p className="text-gray-600 mb-6">Be the first to create a group!</p>
                  <Button onClick={() => setShowCreateModal(true)}>
                    Create First Group
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {availableGroups.map((group) => (
                  <GroupCard key={group.id} group={group} isUserGroup={false} />
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="payments">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Payment History
                </CardTitle>
                <CardDescription>
                  Track your subscription payments and group contributions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <DollarSign className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No payment history yet. Join a group to start tracking payments!</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <CreateGroupModal 
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreateGroup={handleCreateGroup}
      />
      
      <JoinGroupModal 
        isOpen={showJoinModal}
        onClose={() => setShowJoinModal(false)}
        onJoinGroup={handleJoinGroup}
      />

      {selectedGroupChat && (
        <GroupChatModal
          group={selectedGroupChat}
          user={user}
          isOpen={!!selectedGroupChat}
          onClose={() => setSelectedGroupChat(null)}
        />
      )}
    </div>
  );
};

export default Dashboard;
