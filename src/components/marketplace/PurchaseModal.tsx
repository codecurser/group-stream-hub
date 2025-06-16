
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, DollarSign, Shield, User } from "lucide-react";

interface MarketplaceListing {
  id: string;
  title: string;
  description: string | null;
  software_name: string;
  original_price: number;
  asking_price: number;
  expire_at: string;
  subscription_type: string;
  account_details: string | null;
  profiles?: {
    full_name: string | null;
  } | null;
}

interface PurchaseModalProps {
  listing: MarketplaceListing;
  isOpen: boolean;
  onClose: () => void;
  onPurchase: () => void;
  isLoading: boolean;
}

const PurchaseModal = ({ listing, isOpen, onClose, onPurchase, isLoading }: PurchaseModalProps) => {
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Purchase Confirmation</DialogTitle>
          <DialogDescription>
            Review the details before completing your purchase
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Listing Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-lg mb-2">{listing.title}</h3>
            
            <div className="flex items-center gap-2 mb-3">
              <Badge variant="secondary">{listing.software_name}</Badge>
              <Badge variant="outline">{listing.subscription_type}</Badge>
            </div>

            {listing.description && (
              <p className="text-sm text-gray-600 mb-3">{listing.description}</p>
            )}

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-orange-500" />
                <span>{getTimeRemaining(listing.expire_at)} remaining</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-blue-500" />
                <span>{listing.profiles?.full_name || 'Anonymous'}</span>
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Original Price:</span>
              <span className="text-sm text-gray-500 line-through">${listing.original_price}</span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold">Your Price:</span>
              <span className="text-2xl font-bold text-green-600">${listing.asking_price}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-green-600">You Save:</span>
              <Badge variant="destructive" className="text-sm">
                {getSavingsPercentage(listing.original_price, listing.asking_price)}% OFF
              </Badge>
            </div>
          </div>

          {/* Security Notice */}
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <Shield className="w-5 h-5 text-blue-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900 mb-1">Secure Purchase</h4>
                <p className="text-sm text-blue-700">
                  Account details will be shared after purchase completion. All transactions are protected.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={onPurchase}
              disabled={isLoading}
              className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
            >
              <DollarSign className="w-4 h-4 mr-2" />
              {isLoading ? 'Processing...' : `Buy for $${listing.asking_price}`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PurchaseModal;
