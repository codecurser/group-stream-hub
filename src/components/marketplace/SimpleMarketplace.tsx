
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, DollarSign, Calendar, Package } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { User as SupabaseUser } from '@supabase/supabase-js';

interface SimpleMarketplaceProps {
  user: SupabaseUser;
}

interface SoftwareListing {
  id: string;
  title: string;
  description: string | null;
  software_name: string;
  original_price: number;
  asking_price: number;
  expire_at: string;
  subscription_type: string;
  created_at: string;
  seller_id: string;
}

const SimpleMarketplace = ({ user }: SimpleMarketplaceProps) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    software_name: '',
    original_price: '',
    asking_price: '',
    subscription_type: 'monthly',
    expire_days: '30'
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all listings
  const { data: listings = [], isLoading } = useQuery({
    queryKey: ['simple-marketplace-listings'],
    queryFn: async (): Promise<SoftwareListing[]> => {
      console.log('Fetching marketplace listings...');
      const { data, error } = await supabase
        .from('marketplace_listings')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching listings:', error);
        throw error;
      }
      console.log('Fetched listings:', data);
      return data || [];
    }
  });

  const createListingMutation = useMutation({
    mutationFn: async (listingData: any) => {
      const expireDate = new Date();
      expireDate.setDate(expireDate.getDate() + parseInt(listingData.expire_days));
      
      const { data, error } = await supabase
        .from('marketplace_listings')
        .insert({
          title: listingData.title,
          description: listingData.description,
          software_name: listingData.software_name,
          original_price: parseFloat(listingData.original_price),
          asking_price: parseFloat(listingData.asking_price),
          subscription_type: listingData.subscription_type,
          expire_at: expireDate.toISOString(),
          seller_id: user.id
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['simple-marketplace-listings'] });
      setShowCreateForm(false);
      setFormData({
        title: '',
        description: '',
        software_name: '',
        original_price: '',
        asking_price: '',
        subscription_type: 'monthly',
        expire_days: '30'
      });
      toast({
        title: "Success!",
        description: "Your software listing has been created.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create listing.",
        variant: "destructive"
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.software_name || !formData.original_price || !formData.asking_price) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }
    createListingMutation.mutate(formData);
  };

  const getSavingsPercentage = (original: number, asking: number) => {
    return Math.round(((original - asking) / original) * 100);
  };

  const getDaysRemaining = (expireAt: string) => {
    const now = new Date();
    const expiry = new Date(expireAt);
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Software Marketplace</h2>
          <p className="text-gray-600 mt-1">Buy and sell software subscriptions</p>
        </div>
        <Button 
          onClick={() => setShowCreateForm(!showCreateForm)} 
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          {showCreateForm ? 'Cancel' : 'List Software'}
        </Button>
      </div>

      {/* Create Listing Form */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>List Your Software</CardTitle>
            <CardDescription>Create a listing to sell your software subscription</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Title *</label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Netflix Premium Account"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Software Name *</label>
                  <Input
                    value={formData.software_name}
                    onChange={(e) => setFormData({ ...formData, software_name: e.target.value })}
                    placeholder="e.g., Netflix"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Original Price ($) *</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.original_price}
                    onChange={(e) => setFormData({ ...formData, original_price: e.target.value })}
                    placeholder="15.99"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Asking Price ($) *</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.asking_price}
                    onChange={(e) => setFormData({ ...formData, asking_price: e.target.value })}
                    placeholder="10.99"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Subscription Type</label>
                  <Select value={formData.subscription_type} onValueChange={(value) => setFormData({ ...formData, subscription_type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                      <SelectItem value="lifetime">Lifetime</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Listing Duration (days)</label>
                  <Select value={formData.expire_days} onValueChange={(value) => setFormData({ ...formData, expire_days: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">7 days</SelectItem>
                      <SelectItem value="14">14 days</SelectItem>
                      <SelectItem value="30">30 days</SelectItem>
                      <SelectItem value="60">60 days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Additional details about your software subscription..."
                  rows={3}
                />
              </div>
              <Button type="submit" disabled={createListingMutation.isPending} className="w-full">
                {createListingMutation.isPending ? 'Creating...' : 'Create Listing'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Listings */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Available Software ({listings.length})</h3>
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading listings...</p>
          </div>
        ) : listings.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No listings yet</h3>
              <p className="text-gray-600">Be the first to list a software subscription!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((listing) => (
              <Card key={listing.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg font-bold text-gray-900 mb-1">
                        {listing.title}
                      </CardTitle>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary" className="text-xs">
                          {listing.software_name}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {listing.subscription_type}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600">
                        ${listing.asking_price}
                      </div>
                      <div className="text-sm text-gray-500 line-through">
                        ${listing.original_price}
                      </div>
                      <Badge variant="destructive" className="text-xs">
                        {getSavingsPercentage(listing.original_price, listing.asking_price)}% OFF
                      </Badge>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {listing.description && (
                    <p className="text-sm text-gray-600">{listing.description}</p>
                  )}
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1 text-orange-600">
                      <Calendar className="w-4 h-4" />
                      <span>{getDaysRemaining(listing.expire_at)} days left</span>
                    </div>
                    <div className="text-gray-500">
                      {new Date(listing.created_at).toLocaleDateString()}
                    </div>
                  </div>

                  {listing.seller_id !== user.id ? (
                    <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                      <DollarSign className="w-4 h-4 mr-2" />
                      Contact Seller
                    </Button>
                  ) : (
                    <Badge variant="outline" className="w-full justify-center">
                      Your Listing
                    </Badge>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SimpleMarketplace;
