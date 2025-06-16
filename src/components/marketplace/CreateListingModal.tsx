
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";

interface CreateListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateListing: (data: any) => void;
  isLoading: boolean;
}

const CreateListingModal = ({ isOpen, onClose, onCreateListing, isLoading }: CreateListingModalProps) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    software_name: '',
    original_price: '',
    asking_price: '',
    subscription_type: '',
    account_details: ''
  });
  const [expireDate, setExpireDate] = useState<Date>();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!expireDate) {
      alert('Please select an expiry date');
      return;
    }

    const listingData = {
      ...formData,
      original_price: parseFloat(formData.original_price),
      asking_price: parseFloat(formData.asking_price),
      expire_at: expireDate.toISOString()
    };

    onCreateListing(listingData);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      software_name: '',
      original_price: '',
      asking_price: '',
      subscription_type: '',
      account_details: ''
    });
    setExpireDate(undefined);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const softwareOptions = [
    'Netflix', 'Spotify', 'Adobe Creative Cloud', 'Microsoft Office 365',
    'Disney+', 'Amazon Prime', 'YouTube Premium', 'Hulu', 'HBO Max',
    'Apple TV+', 'Canva Pro', 'Figma', 'Notion', 'Slack', 'Zoom Pro',
    'GitHub Pro', 'Other'
  ];

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Sell Your Software Subscription</DialogTitle>
          <DialogDescription>
            Create a listing for your unused software subscription. Share the remaining time with other users!
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Listing Title</Label>
              <Input
                id="title"
                placeholder="e.g., Adobe Creative Cloud - 8 months left"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="software_name">Software Name</Label>
              <Select 
                value={formData.software_name} 
                onValueChange={(value) => setFormData({ ...formData, software_name: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select software" />
                </SelectTrigger>
                <SelectContent>
                  {softwareOptions.map((software) => (
                    <SelectItem key={software} value={software}>
                      {software}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Describe your subscription, any special features, etc."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="original_price">Original Price ($)</Label>
              <Input
                id="original_price"
                type="number"
                step="0.01"
                placeholder="99.99"
                value={formData.original_price}
                onChange={(e) => setFormData({ ...formData, original_price: e.target.value })}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="asking_price">Your Price ($)</Label>
              <Input
                id="asking_price"
                type="number"
                step="0.01"
                placeholder="59.99"
                value={formData.asking_price}
                onChange={(e) => setFormData({ ...formData, asking_price: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subscription_type">Subscription Type</Label>
              <Select 
                value={formData.subscription_type} 
                onValueChange={(value) => setFormData({ ...formData, subscription_type: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                  <SelectItem value="lifetime">Lifetime</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Subscription Expires On</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {expireDate ? format(expireDate, "PPP") : "Pick expiry date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={expireDate}
                  onSelect={setExpireDate}
                  disabled={(date) => date < new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="account_details">Account Transfer Details</Label>
            <Textarea
              id="account_details"
              placeholder="How will you transfer the account? (e.g., email change, password sharing, etc.)"
              value={formData.account_details}
              onChange={(e) => setFormData({ ...formData, account_details: e.target.value })}
              rows={3}
            />
            <p className="text-xs text-gray-500">
              Note: This information will only be shared with the buyer after purchase.
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? 'Creating...' : 'Create Listing'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateListingModal;
