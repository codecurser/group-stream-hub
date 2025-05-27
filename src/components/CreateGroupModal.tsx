
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

const platforms = [
  { id: 'netflix', name: 'Netflix', color: 'bg-red-500' },
  { id: 'spotify', name: 'Spotify', color: 'bg-green-500' },
  { id: 'disney', name: 'Disney+', color: 'bg-blue-600' },
  { id: 'amazon', name: 'Amazon Prime', color: 'bg-orange-500' },
  { id: 'hulu', name: 'Hulu', color: 'bg-green-400' },
  { id: 'youtube', name: 'YouTube Premium', color: 'bg-red-600' },
  { id: 'apple', name: 'Apple TV+', color: 'bg-gray-800' },
  { id: 'hbo', name: 'HBO Max', color: 'bg-purple-600' },
  { id: 'other', name: 'Other', color: 'bg-gray-500' }
];

const CreateGroupModal = ({ isOpen, onClose, onCreateGroup }) => {
  const [formData, setFormData] = useState({
    name: '',
    platform: '',
    monthlyCost: '',
    maxMembers: '4',
    description: '',
    credentials: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.platform || !formData.monthlyCost) {
      return;
    }

    onCreateGroup({
      ...formData,
      monthlyCost: parseFloat(formData.monthlyCost),
      maxMembers: parseInt(formData.maxMembers)
    });

    // Reset form
    setFormData({
      name: '',
      platform: '',
      monthlyCost: '',
      maxMembers: '4',
      description: '',
      credentials: ''
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Create New Group
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="group-name">Group Name *</Label>
            <Input
              id="group-name"
              placeholder="e.g., Family Netflix, College Friends Spotify"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="platform">Platform *</Label>
            <Select value={formData.platform} onValueChange={(value) => setFormData({...formData, platform: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Select a platform" />
              </SelectTrigger>
              <SelectContent>
                {platforms.map((platform) => (
                  <SelectItem key={platform.id} value={platform.id}>
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${platform.color}`}></div>
                      {platform.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="monthly-cost">Monthly Cost ($) *</Label>
              <Input
                id="monthly-cost"
                type="number"
                step="0.01"
                placeholder="15.99"
                value={formData.monthlyCost}
                onChange={(e) => setFormData({...formData, monthlyCost: e.target.value})}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="max-members">Max Members</Label>
              <Select value={formData.maxMembers} onValueChange={(value) => setFormData({...formData, maxMembers: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2">2 Members</SelectItem>
                  <SelectItem value="3">3 Members</SelectItem>
                  <SelectItem value="4">4 Members</SelectItem>
                  <SelectItem value="5">5 Members</SelectItem>
                  <SelectItem value="6">6 Members</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Any additional details about the group or sharing rules..."
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              rows={3}
            />
          </div>

          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="text-sm text-blue-800">
                <strong>Cost per member:</strong> ${formData.monthlyCost && formData.maxMembers 
                  ? (parseFloat(formData.monthlyCost) / parseInt(formData.maxMembers)).toFixed(2) 
                  : '0.00'} per month
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              Create Group
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateGroupModal;
