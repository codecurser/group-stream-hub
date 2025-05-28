
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription } from "@/components/ui/card";
import { Users, Hash } from "lucide-react";

interface JoinGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJoinGroup: (inviteCode: string) => void;
}

const JoinGroupModal = ({ isOpen, onClose, onJoinGroup }: JoinGroupModalProps) => {
  const [inviteCode, setInviteCode] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCode.trim()) return;
    
    onJoinGroup(inviteCode.trim().toUpperCase());
    setInviteCode('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Join a Group
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <Card className="bg-purple-50 border-purple-200">
            <CardContent className="flex items-center gap-3 p-4">
              <Users className="w-8 h-8 text-purple-600" />
              <div>
                <h3 className="font-semibold text-purple-900">Join with Invite Code</h3>
                <CardDescription className="text-purple-700">
                  Ask a group admin for their 6-digit invite code
                </CardDescription>
              </div>
            </CardContent>
          </Card>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="invite-code">Invite Code</Label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="invite-code"
                  placeholder="Enter 6-digit code (e.g., ABC123)"
                  className="pl-10 text-center text-lg tracking-wider font-mono uppercase"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                  maxLength={6}
                  required
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                disabled={!inviteCode.trim()}
              >
                Join Group
              </Button>
            </div>
          </form>

          <div className="text-center text-sm text-gray-500">
            <p>Don't have an invite code?</p>
            <p>Ask a friend or create your own group!</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default JoinGroupModal;
