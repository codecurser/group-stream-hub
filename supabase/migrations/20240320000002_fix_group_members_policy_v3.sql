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

-- Enable RLS
ALTER TABLE "public"."group_members" ENABLE ROW LEVEL SECURITY;

-- Create a single, simple policy for all operations
CREATE POLICY "group_members_policy"
ON "public"."group_members"
FOR ALL
TO authenticated
USING (
  -- Allow if user is the member
  auth.uid() = user_id
  OR
  -- Allow if user is the group creator
  EXISTS (
    SELECT 1 FROM "public"."groups"
    WHERE id = group_members.group_id
    AND creator_id = auth.uid()
  )
  OR
  -- Allow if user is a member of the group
  EXISTS (
    SELECT 1 FROM "public"."group_members" gm
    WHERE gm.group_id = group_members.group_id
    AND gm.user_id = auth.uid()
    AND gm.status = 'active'
  )
); 