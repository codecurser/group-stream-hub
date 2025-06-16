
-- Create marketplace_listings table for software sales
CREATE TABLE public.marketplace_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  software_name TEXT NOT NULL,
  original_price DECIMAL(10,2) NOT NULL,
  asking_price DECIMAL(10,2) NOT NULL,
  expire_at TIMESTAMPTZ NOT NULL,
  subscription_type TEXT NOT NULL CHECK (subscription_type IN ('monthly', 'yearly', 'lifetime')),
  account_details TEXT, -- encrypted or masked account info
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'sold', 'expired')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create marketplace_purchases table to track sales
CREATE TABLE public.marketplace_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID REFERENCES public.marketplace_listings(id) ON DELETE CASCADE NOT NULL,
  buyer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  seller_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  purchase_price DECIMAL(10,2) NOT NULL,
  purchased_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('completed', 'disputed', 'refunded'))
);

-- Enable RLS on both tables
ALTER TABLE public.marketplace_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_purchases ENABLE ROW LEVEL SECURITY;

-- RLS policies for marketplace_listings
CREATE POLICY "Anyone can view active listings" 
  ON public.marketplace_listings 
  FOR SELECT 
  USING (status = 'active' AND expire_at > now());

CREATE POLICY "Users can create their own listings" 
  ON public.marketplace_listings 
  FOR INSERT 
  WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Users can update their own listings" 
  ON public.marketplace_listings 
  FOR UPDATE 
  USING (auth.uid() = seller_id);

CREATE POLICY "Users can delete their own listings" 
  ON public.marketplace_listings 
  FOR DELETE 
  USING (auth.uid() = seller_id);

-- RLS policies for marketplace_purchases
CREATE POLICY "Users can view their own purchases and sales" 
  ON public.marketplace_purchases 
  FOR SELECT 
  USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

CREATE POLICY "Users can create purchases" 
  ON public.marketplace_purchases 
  FOR INSERT 
  WITH CHECK (auth.uid() = buyer_id);

-- Create trigger to update updated_at column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_marketplace_listings_updated_at 
  BEFORE UPDATE ON public.marketplace_listings 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger to mark listing as sold when purchased
CREATE OR REPLACE FUNCTION public.mark_listing_as_sold()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.marketplace_listings
  SET status = 'sold', updated_at = NOW()
  WHERE id = NEW.listing_id;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER mark_listing_sold_trigger
  AFTER INSERT ON public.marketplace_purchases
  FOR EACH ROW EXECUTE FUNCTION public.mark_listing_as_sold();
