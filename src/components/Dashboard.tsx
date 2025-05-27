
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Plus, Users, LogOut, Copy, DollarSign, Calendar } from "lucide-react";
import CreateGroupModal from "@/components/CreateGroupModal";
import JoinGroupModal from "@/components/JoinGroupModal";
import { useToast } from "@/hooks/use-toast";
import { User } from '@supabase/supabase-js';

interface DashboardProps {
  user: User;
  onLogout: () => void;
}

const Dashboard = ({ user, onLogout }: DashboardProps) => {
  const [groups, setGroups] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const { toast } = useToast();

  // Load groups from localStorage
  useEffect(() => {
    const savedGroups = localStorage.getItem('playform_groups');
    if (savedGroups) {
      setGroups(JSON.parse(savedGroups));
    }
  }, []);

  // Save groups to localStorage
  useEffect(() => {
    localStorage.setItem('playform_groups', JSON.stringify(groups));
  }, [groups]);

  const handleCreateGroup = (groupData) => {
    const newGroup = {
      id: Date.now(),
      ...groupData,
      creator: user.id,
      members: [
        {
          id: user.id,
          name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
          email: user.email,
          status: 'active',
          paidThisMonth: false
        }
      ],
      inviteCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
      createdAt: new Date().toISOString()
    };
    
    setGroups([...groups, newGroup]);
    setShowCreateModal(false);
    
    toast({
      title: "Group created!",
      description: `"${groupData.name}" has been created successfully.`,
    });
  };

  const handleJoinGroup = (inviteCode) => {
    const group = groups.find(g => g.inviteCode === inviteCode);
    
    if (!group) {
      toast({
        title: "Invalid invite code",
        description: "Please check the code and try again.",
        variant: "destructive"
      });
      return;
    }

    const isAlreadyMember = group.members.some(m => m.id === user.id);
    if (isAlreadyMember) {
      toast({
        title: "Already a member",
        description: "You're already part of this group.",
        variant: "destructive"
      });
      return;
    }

    const updatedGroups = groups.map(g => {
      if (g.id === group.id) {
        return {
          ...g,
          members: [...g.members, {
            id: user.id,
            name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
            email: user.email,
            status: 'active',
            paidThisMonth: false
          }]
        };
      }
      return g;
    });

    setGroups(updatedGroups);
    setShowJoinModal(false);
    
    toast({
      title: "Joined group!",
      description: `You've successfully joined "${group.name}".`,
    });
  };

  const copyInviteCode = (inviteCode) => {
    navigator.clipboard.writeText(inviteCode);
    toast({
      title: "Copied!",
      description: "Invite code copied to clipboard.",
    });
  };

  const userGroups = groups.filter(g => 
    g.members.some(m => m.id === user.id)
  );

  const calculateMonthlyCost = (group) => {
    return (group.monthlyCost / group.members.length).toFixed(2);
  };

  const displayName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';

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
          <p className="text-gray-600">Manage your subscription groups and payments</p>
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
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="my-groups">My Groups ({userGroups.length})</TabsTrigger>
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
                  <Card key={group.id} className="hover:shadow-lg transition-all duration-300">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{group.name}</CardTitle>
                          <CardDescription className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary">{group.platform}</Badge>
                          </CardDescription>
                        </div>
                        {group.creator === user.id && (
                          <Badge variant="outline" className="text-xs">Owner</Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-600">
                            {group.members.length} / {group.maxMembers} members
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-green-600" />
                          <span className="font-semibold text-green-600">
                            ${calculateMonthlyCost(group)}/month
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Invite Code:</span>
                        <div className="flex items-center gap-2">
                          <code className="bg-gray-100 px-2 py-1 rounded font-mono">
                            {group.inviteCode}
                          </code>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyInviteCode(group.inviteCode)}
                            className="h-6 w-6 p-0"
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>

                      <div className="pt-2 border-t">
                        <div className="text-xs text-gray-500 mb-2">Members:</div>
                        <div className="flex flex-wrap gap-1">
                          {group.members.map((member) => (
                            <Badge 
                              key={member.id} 
                              variant={member.id === user.id ? "default" : "secondary"}
                              className="text-xs"
                            >
                              {member.name} {member.id === user.id && "(You)"}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
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
    </div>
  );
};

export default Dashboard;
