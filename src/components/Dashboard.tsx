import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Plus, Users, LogOut, Copy, DollarSign, Calendar, MessageCircle, Crown, MapPin, ShoppingBag } from "lucide-react";
import CreateGroupModal from "@/components/CreateGroupModal";
import JoinGroupModal from "@/components/JoinGroupModal";
import GroupChatModal from "@/components/GroupChatModal";
import SimpleMarketplace from "@/components/marketplace/SimpleMarketplace";
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

  // Fetch all available groups with detailed logging
  const { data: allGroups = [], isLoading: groupsLoading, error: groupsError } = useQuery({
    queryKey: ['groups'],
    queryFn: async (): Promise<Group[]> => {
      console.log('Fetching all groups...');
      console.log('Current user ID:', user.id);
      
      try {
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
        
        if (error) {
          console.error('Error fetching groups:', error);
          throw error;
        }
        
        console.log('Raw groups data from Supabase:', data);
        console.log('Number of groups fetched:', data?.length || 0);
        
        if (data && data.length > 0) {
          data.forEach((group, index) => {
            console.log(`Group ${index + 1}:`, {
              id: group.id,
              name: group.name,
              creator_id: group.creator_id,
              memberCount: group.group_members?.length || 0
            });
          });
        }
        
        return data || [];
      } catch (error) {
        console.error('Exception in groups query:', error);
        throw error;
      }
    }
  });

  // Fetch user's group memberships with detailed logging
  const { data: userMemberships = [], error: membershipsError } = useQuery({
    queryKey: ['user-memberships', user.id],
    queryFn: async () => {
      console.log('Fetching user memberships for user:', user.id);
      
      try {
        const { data, error } = await supabase
          .from('group_members')
          .select('group_id, status')
          .eq('user_id', user.id)
          .eq('status', 'active');
        
        if (error) {
          console.error('Error fetching memberships:', error);
          throw error;
        }
        
        console.log('Raw memberships data:', data);
        console.log('Number of memberships:', data?.length || 0);
        
        return data || [];
      } catch (error) {
        console.error('Exception in memberships query:', error);
        throw error;
      }
    }
  });

  // Debug logging for errors
  useEffect(() => {
    if (groupsError) {
      console.error('Groups query error:', groupsError);
    }
    if (membershipsError) {
      console.error('Memberships query error:', membershipsError);
    }
  }, [groupsError, membershipsError]);

  const createGroupMutation = useMutation({
    mutationFn: async (groupData: any) => {
      console.log('Creating group with data:', groupData);
      console.log('User creating group:', user.id);
      
      const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      
      const { data: group, error: groupError } = await supabase
        .from('groups')
        .insert({
          name: groupData.name,
          platform: groupData.platform,
          monthly_cost: groupData.monthly_cost,
          max_members: groupData.max_members,
          description: groupData.description,
          creator_id: user.id,
          invite_code: inviteCode
        })
        .select()
        .single();

      if (groupError) {
        console.error('Group creation error:', groupError);
        throw groupError;
      }
      console.log('Group created successfully:', group);

      // Add creator as first member
      const { error: memberError } = await supabase
        .from('group_members')
        .insert({
          group_id: group.id,
          user_id: user.id,
          status: 'active'
        });

      if (memberError) {
        console.error('Member addition error:', memberError);
        throw memberError;
      }
      console.log('Creator added as member successfully');
      
      return group;
    },
    onSuccess: (group) => {
      console.log('Group creation mutation successful:', group);
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      queryClient.invalidateQueries({ queryKey: ['user-memberships'] });
      setShowCreateModal(false);
      toast({
        title: "Group created!",
        description: `Your group "${group.name}" has been created successfully.`,
      });
    },
    onError: (error: any) => {
      console.error('Create group mutation error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create group. Please try again.",
        variant: "destructive"
      });
    }
  });

  const joinGroupMutation = useMutation({
    mutationFn: async (inviteCode: string) => {
      console.log('Joining group with invite code:', inviteCode);
      
      // Find group by invite code
      const { data: group, error: findError } = await supabase
        .from('groups')
        .select('*')
        .eq('invite_code', inviteCode.toUpperCase())
        .single();

      if (findError || !group) {
        console.error('Group not found:', findError);
        throw new Error('Invalid invite code');
      }
      console.log('Found group:', group);

      // Check if already a member
      const { data: existingMember } = await supabase
        .from('group_members')
        .select('id')
        .eq('group_id', group.id)
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();

      if (existingMember) {
        throw new Error('Already a member of this group');
      }

      // Check if group is full
      const { data: memberCount } = await supabase
        .from('group_members')
        .select('id', { count: 'exact' })
        .eq('group_id', group.id)
        .eq('status', 'active');

      if (memberCount && memberCount.length >= group.max_members) {
        throw new Error('Group is full');
      }

      // Join the group
      const { error: joinError } = await supabase
        .from('group_members')
        .insert({
          group_id: group.id,
          user_id: user.id,
          status: 'active'
        });

      if (joinError) {
        console.error('Join error:', joinError);
        throw joinError;
      }
      console.log('Successfully joined group');
      
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
      console.error('Join group mutation error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to join group. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleCreateGroup = (groupData: any) => {
    console.log('Handle create group called with:', groupData);
    createGroupMutation.mutate(groupData);
  };

  const handleJoinGroup = (inviteCode: string) => {
    console.log('Handle join group called with:', inviteCode);
    joinGroupMutation.mutate(inviteCode);
  };

  const copyInviteCode = (inviteCode: string) => {
    navigator.clipboard.writeText(inviteCode);
    toast({
      title: "Copied!",
      description: "Invite code copied to clipboard.",
    });
  };

  // Filter groups with better logging
  const userGroupIds = userMemberships.map(m => m.group_id);
  const userGroups = allGroups.filter(g => userGroupIds.includes(g.id));
  const availableGroups = allGroups.filter(g => !userGroupIds.includes(g.id));

  // Enhanced debug logging
  console.log('=== GROUP FILTERING DEBUG ===');
  console.log('All groups:', allGroups);
  console.log('User memberships:', userMemberships);
  console.log('User group IDs:', userGroupIds);
  console.log('User groups (my groups):', userGroups);
  console.log('Available groups:', availableGroups);
  console.log('Groups loading:', groupsLoading);
  console.log('================================');

  const calculateMonthlyCost = (group: Group) => {
    const memberCount = Math.max(group.group_members?.length || 1, 1);
    return (group.monthly_cost / memberCount).toFixed(2);
  };

  const displayName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';

  const getPlatformColor = (platform: string) => {
    const colors = {
      'Netflix': 'bg-red-500',
      'Spotify': 'bg-green-500',
      'Disney+': 'bg-blue-500',
      'YouTube Premium': 'bg-red-600',
      'Amazon Prime': 'bg-orange-500',
      'Hulu': 'bg-green-600',
      'HBO Max': 'bg-purple-500',
      'Apple TV+': 'bg-gray-800',
    };
    return colors[platform as keyof typeof colors] || 'bg-gray-500';
  };

  const GroupCard = ({ group, isUserGroup = false }: { group: Group; isUserGroup?: boolean }) => {
    const memberCount = group.group_members?.length || 0;
    const isGroupFull = memberCount >= group.max_members;
    
    return (
      <Card className="hover:shadow-xl transition-all duration-300 h-full border-2 bg-white shadow-lg hover:shadow-2xl transform hover:-translate-y-1">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-4 h-4 rounded-full ${getPlatformColor(group.platform)} shadow-sm`}></div>
                <CardTitle className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                  {group.name}
                </CardTitle>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="secondary" className="text-xs font-medium bg-blue-100 text-blue-800">
                  {group.platform}
                </Badge>
                {group.creator_id === user.id && (
                  <Badge variant="outline" className="text-xs flex items-center gap-1 border-yellow-300 text-yellow-700">
                    <Crown className="w-3 h-3" />
                    Owner
                  </Badge>
                )}
                {isGroupFull && (
                  <Badge variant="destructive" className="text-xs">
                    Full
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-500" />
              <div className="text-sm">
                <div className="font-medium text-gray-900">{memberCount}/{group.max_members}</div>
                <div className="text-xs text-gray-500">members</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-green-500" />
              <div className="text-sm">
                <div className="font-bold text-green-600">${calculateMonthlyCost(group)}</div>
                <div className="text-xs text-gray-500">per month</div>
              </div>
            </div>
          </div>

          {group.description && (
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-sm text-gray-700 leading-relaxed">{group.description}</p>
            </div>
          )}

          <div className="text-xs text-gray-500 flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            Created {new Date(group.created_at).toLocaleDateString()}
          </div>

          {isUserGroup && (
            <div className="bg-blue-50 rounded-lg p-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-blue-700 font-medium">Invite Code:</span>
                <div className="flex items-center gap-2">
                  <code className="bg-white px-2 py-1 rounded font-mono text-blue-800 border">
                    {group.invite_code}
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyInviteCode(group.invite_code)}
                    className="h-6 w-6 p-0 hover:bg-blue-100"
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          <div className="pt-2 border-t border-gray-100">
            {isUserGroup ? (
              <Button
                variant="outline"
                onClick={() => setSelectedGroupChat(group)}
                className="w-full flex items-center gap-2 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                Open Chat
              </Button>
            ) : (
              <Button
                onClick={() => handleJoinGroup(group.invite_code)}
                disabled={joinGroupMutation.isPending || isGroupFull}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {joinGroupMutation.isPending ? 'Joining...' : 
                 isGroupFull ? 'Group Full' : 'Join Group'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Navigation */}
      <nav className="bg-white/90 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                PlayForm
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600 bg-white/70 px-3 py-1 rounded-full">
                Welcome, <span className="font-medium">{displayName}</span>
              </div>
              <Button 
                variant="ghost" 
                onClick={onLogout}
                className="flex items-center gap-2 hover:bg-red-50 hover:text-red-600 transition-colors"
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
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600 text-lg">Manage your subscription groups and discover new ones</p>
          
          {/* Debug info for user */}
          {(groupsError || membershipsError) && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <h3 className="text-red-800 font-medium">Debug Information:</h3>
              {groupsError && <p className="text-red-600 text-sm">Groups Error: {groupsError.message}</p>}
              {membershipsError && <p className="text-red-600 text-sm">Memberships Error: {membershipsError.message}</p>}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="cursor-pointer hover:shadow-xl transition-all duration-300 border-2 border-dashed border-blue-300 bg-gradient-to-br from-blue-50 to-blue-100/50 hover:from-blue-100 hover:to-blue-200/50"
                onClick={() => setShowCreateModal(true)}>
            <CardContent className="flex items-center justify-center p-8">
              <div className="text-center">
                <div className="bg-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Plus className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-blue-900 mb-2">Create New Group</h3>
                <p className="text-blue-700">Start a new subscription sharing group</p>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-xl transition-all duration-300 border-2 border-dashed border-purple-300 bg-gradient-to-br from-purple-50 to-purple-100/50 hover:from-purple-100 hover:to-purple-200/50"
                onClick={() => setShowJoinModal(true)}>
            <CardContent className="flex items-center justify-center p-8">
              <div className="text-center">
                <div className="bg-purple-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-purple-900 mb-2">Join Group</h3>
                <p className="text-purple-700">Join an existing group with invite code</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Groups Section */}
        <Tabs defaultValue="my-groups" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-white/70 backdrop-blur-sm">
            <TabsTrigger value="my-groups" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
              My Groups
            </TabsTrigger>
            <TabsTrigger value="available-groups" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
              Available Groups
            </TabsTrigger>
            <TabsTrigger value="marketplace" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <ShoppingBag className="w-4 h-4 mr-2" />
              Marketplace
            </TabsTrigger>
            <TabsTrigger value="payments" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
              Payment History
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="my-groups" className="space-y-6 mt-8">
            {userGroups.length === 0 ? (
              <Card className="text-center py-16 bg-white/70 backdrop-blur-sm">
                <CardContent>
                  <Users className="w-20 h-20 text-gray-300 mx-auto mb-6" />
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">No Groups Yet</h3>
                  <p className="text-gray-600 mb-8 text-lg">Create your first group or join an existing one to start saving!</p>
                  <div className="flex gap-4 justify-center">
                    <Button onClick={() => setShowCreateModal(true)} size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                      Create Group
                    </Button>
                    <Button variant="outline" onClick={() => setShowJoinModal(true)} size="lg">
                      Join Group
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {userGroups.map((group) => (
                  <GroupCard key={group.id} group={group} isUserGroup={true} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="available-groups" className="space-y-6 mt-8">
            <div className="mb-6 p-4 bg-white/50 rounded-lg border border-blue-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Browse Available Groups</h3>
              <p className="text-gray-600">
                Join existing groups to split subscription costs with other members. 
                {availableGroups.length > 0 && ` Found ${availableGroups.length} group${availableGroups.length === 1 ? '' : 's'} you can join.`}
              </p>
            </div>
            
            {groupsLoading ? (
              <div className="text-center py-16">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-6 text-gray-600 text-lg">Loading available groups...</p>
              </div>
            ) : availableGroups.length === 0 ? (
              <Card className="text-center py-16 bg-white/70 backdrop-blur-sm">
                <CardContent>
                  <MapPin className="w-20 h-20 text-gray-300 mx-auto mb-6" />
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">No Available Groups</h3>
                  <p className="text-gray-600 mb-8 text-lg">
                    {allGroups.length === 0 
                      ? "Be the first to create a group that others can join!" 
                      : "You're already a member of all existing groups. Create a new one!"
                    }
                  </p>
                  <Button onClick={() => setShowCreateModal(true)} size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    Create New Group
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {availableGroups.map((group) => (
                  <GroupCard key={group.id} group={group} isUserGroup={false} />
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="marketplace" className="mt-8">
            <SimpleMarketplace user={user} />
          </TabsContent>
          
          <TabsContent value="payments" className="mt-8">
            <Card className="bg-white/70 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Calendar className="w-6 h-6" />
                  Payment History
                </CardTitle>
                <CardDescription className="text-lg">
                  Track your subscription payments and group contributions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-16 text-gray-500">
                  <DollarSign className="w-16 h-16 mx-auto mb-6 opacity-50" />
                  <p className="text-lg">No payment history yet. Join a group to start tracking payments!</p>
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
