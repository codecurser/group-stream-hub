-- First, disable RLS temporarily
ALTER TABLE "public"."group_members" DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view their own group memberships" ON "public"."group_members";
DROP POLICY IF EXISTS "Users can view members of groups they belong to" ON "public"."group_members";
DROP POLICY IF EXISTS "Users can insert their own group memberships" ON "public"."group_members";
DROP POLICY IF EXISTS "Group creators can manage members" ON "public"."group_members";
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON "public"."group_members";
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON "public"."group_members";
DROP POLICY IF EXISTS "Enable update for group creators" ON "public"."group_members";
DROP POLICY IF EXISTS "Enable delete for group creators" ON "public"."group_members";
DROP POLICY IF EXISTS "group_members_policy" ON "public"."group_members";

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS public.can_access_group_member;

-- Create a function to check if a user can access a group member
CREATE OR REPLACE FUNCTION public.can_access_group_member(
  p_user_id UUID,
  p_group_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if user is the group creator
  IF EXISTS (
    SELECT 1 FROM public.groups
    WHERE id = p_group_id
    AND creator_id = p_user_id
  ) THEN
    RETURN TRUE;
  END IF;

  -- Check if user is an active member of the group
  IF EXISTS (
    SELECT 1 FROM public.group_members
    WHERE group_id = p_group_id
    AND user_id = p_user_id
    AND status = 'active'
  ) THEN
    RETURN TRUE;
  END IF;

  RETURN FALSE;
END;
$$;

-- Enable RLS
ALTER TABLE "public"."group_members" ENABLE ROW LEVEL SECURITY;

-- Create basic policies
CREATE POLICY "Users can view their own memberships"
ON "public"."group_members"
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can view group members if they can access the group"
ON "public"."group_members"
FOR SELECT
TO authenticated
USING (
  can_access_group_member(auth.uid(), group_id)
);

CREATE POLICY "Users can insert their own memberships"
ON "public"."group_members"
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Group creators can manage members"
ON "public"."group_members"
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.groups
    WHERE id = group_members.group_id
    AND creator_id = auth.uid()
  )
); 