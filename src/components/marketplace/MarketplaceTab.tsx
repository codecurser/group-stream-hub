
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, ShoppingCart, Clock, DollarSign, User, Calendar } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { User as SupabaseUser } from '@supabase/supabase-js';
import CreateListingModal from "./CreateListingModal";
import PurchaseModal from "./PurchaseModal";

interface MarketplaceTabProps {
  user: SupabaseUser;
}

interface MarketplaceListing {
  id: string;
  title: string;
  description: string | null;
  software_name: string;
  original_price: number;
  asking_price: number;
  expire_at: string;
  subscription_type: string;
  status: string;
  created_at: string;
  seller_id: string;
  account_details: string | null;
  profiles?: {
    full_name: string | null;
  } | null;
}

const MarketplaceTab = ({ user }: MarketplaceTabProps) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedListing, setSelectedListing] = useState<MarketplaceListing | null>(null);
  const [activeTab, setActiveTab] = useState<'browse' | 'my-listings' | 'purchases'>('browse');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all active listings
  const { data: listings = [], isLoading } = useQuery({
    queryKey: ['marketplace-listings'],
    queryFn: async (): Promise<MarketplaceListing[]> => {
      const { data, error } = await supabase
        .from('marketplace_listings')
        .select(`
          *,
          profiles (full_name)
        `)
        .eq('status', 'active')
        .gt('expire_at', new Date().toISOString())
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch user's own listings
  const { data: userListings = [] } = useQuery({
    queryKey: ['user-listings', user.id],
    queryFn: async (): Promise<MarketplaceListing[]> => {
      const { data, error } = await supabase
        .from('marketplace_listings')
        .select('*')
        .eq('seller_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch user's purchases
  const { data: userPurchases = [] } = useQuery({
    queryKey: ['user-purchases', user.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('marketplace_purchases')
        .select(`
          *,
          marketplace_listings (
            title,
            software_name,
            description
          )
        `)
        .eq('buyer_id', user.id)
        .order('purchased_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });

  const createListingMutation = useMutation({
    mutationFn: async (listingData: any) => {
      const { data, error } = await supabase
        .from('marketplace_listings')
        .insert({
          ...listingData,
          seller_id: user.id
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketplace-listings'] });
      queryClient.invalidateQueries({ queryKey: ['user-listings'] });
      setShowCreateModal(false);
      toast({
        title: "Listing created!",
        description: "Your software listing has been created successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create listing. Please try again.",
        variant: "destructive"
      });
    }
  });

  const purchaseMutation = useMutation({
    mutationFn: async (listing: MarketplaceListing) => {
      const { data, error } = await supabase
        .from('marketplace_purchases')
        .insert({
          listing_id: listing.id,
          buyer_id: user.id,
          seller_id: listing.seller_id,
          purchase_price: listing.asking_price
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketplace-listings'] });
      queryClient.invalidateQueries({ queryKey: ['user-purchases'] });
      setSelectedListing(null);
      toast({
        title: "Purchase successful!",
        description: "You've successfully purchased the software subscription.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to complete purchase. Please try again.",
        variant: "destructive"
      });
    }
  });

  const getTimeRemaining = (expireAt: string) => {
    const now = new Date();
    const expiry = new Date(expireAt);
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays > 30) {
      return `${Math.ceil(diffDays / 30)} month${Math.ceil(diffDays / 30) > 1 ? 's' : ''}`;
    }
    return `${diffDays} day${diffDays > 1 ? 's' : ''}`;
  };

  const getSavingsPercentage = (original: number, asking: number) => {
    return Math.round(((original - asking) / original) * 100);
  };

  const ListingCard = ({ listing, showPurchaseButton = true }: { listing: MarketplaceListing; showPurchaseButton?: boolean }) => (
    <Card className="hover:shadow-lg transition-all duration-300">
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
            <Clock className="w-4 h-4" />
            <span>{getTimeRemaining(listing.expire_at)} left</span>
          </div>
          <div className="flex items-center gap-1 text-gray-500">
            <Calendar className="w-4 h-4" />
            <span>{new Date(listing.created_at).toLocaleDateString()}</span>
          </div>
        </div>

        {showPurchaseButton && listing.seller_id !== user.id && (
          <Button 
            onClick={() => setSelectedListing(listing)}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            disabled={purchaseMutation.isPending}
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            {purchaseMutation.isPending ? 'Processing...' : 'Purchase Now'}
          </Button>
        )}

        {listing.seller_id === user.id && (
          <Badge variant="outline" className="w-full justify-center">
            Your Listing
          </Badge>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Marketplace</h2>
          <p className="text-gray-600 mt-1">Buy and sell premium software subscriptions</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Sell Software
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
        {[
          { key: 'browse', label: 'Browse', count: listings.length },
          { key: 'my-listings', label: 'My Listings', count: userListings.length },
          { key: 'purchases', label: 'Purchases', count: userPurchases.length }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'browse' && (
        <div>
          {isLoading ? (
            <div className="text-center py-16">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-6 text-gray-600">Loading marketplace...</p>
            </div>
          ) : listings.length === 0 ? (
            <Card className="text-center py-16">
              <CardContent>
                <ShoppingCart className="w-20 h-20 text-gray-300 mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-gray-900 mb-4">No listings available</h3>
                <p className="text-gray-600 mb-8">Be the first to list a software subscription for sale!</p>
                <Button onClick={() => setShowCreateModal(true)}>
                  Create First Listing
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {listings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'my-listings' && (
        <div>
          {userListings.length === 0 ? (
            <Card className="text-center py-16">
              <CardContent>
                <DollarSign className="w-20 h-20 text-gray-300 mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-gray-900 mb-4">No listings yet</h3>
                <p className="text-gray-600 mb-8">Start selling your unused software subscriptions!</p>
                <Button onClick={() => setShowCreateModal(true)}>
                  Create Your First Listing
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userListings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} showPurchaseButton={false} />
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'purchases' && (
        <div>
          {userPurchases.length === 0 ? (
            <Card className="text-center py-16">
              <CardContent>
                <User className="w-20 h-20 text-gray-300 mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-gray-900 mb-4">No purchases yet</h3>
                <p className="text-gray-600 mb-8">Browse the marketplace to find great deals on software!</p>
                <Button onClick={() => setActiveTab('browse')}>
                  Browse Marketplace
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {userPurchases.map((purchase: any) => (
                <Card key={purchase.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">{purchase.marketplace_listings?.title}</h3>
                        <p className="text-sm text-gray-600">{purchase.marketplace_listings?.software_name}</p>
                        <p className="text-xs text-gray-500">
                          Purchased on {new Date(purchase.purchased_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-green-600">${purchase.purchase_price}</div>
                        <Badge variant="secondary" className="text-xs">
                          {purchase.status}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      <CreateListingModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreateListing={(data) => createListingMutation.mutate(data)}
        isLoading={createListingMutation.isPending}
      />

      {selectedListing && (
        <PurchaseModal
          listing={selectedListing}
          isOpen={!!selectedListing}
          onClose={() => setSelectedListing(null)}
          onPurchase={() => purchaseMutation.mutate(selectedListing)}
          isLoading={purchaseMutation.isPending}
        />
      )}
    </div>
  );
};

export default MarketplaceTab;
