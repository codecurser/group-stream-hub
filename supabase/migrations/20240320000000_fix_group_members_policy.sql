-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own group memberships" ON "public"."group_members";
DROP POLICY IF EXISTS "Users can view members of groups they belong to" ON "public"."group_members";
DROP POLICY IF EXISTS "Users can insert their own group memberships" ON "public"."group_members";
DROP POLICY IF EXISTS "Group creators can manage members" ON "public"."group_members";

-- Enable RLS
ALTER TABLE "public"."group_members" ENABLE ROW LEVEL SECURITY;

-- Create new policies
CREATE POLICY "Users can view their own group memberships"
ON "public"."group_members"
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can view members of groups they belong to"
ON "public"."group_members"
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM "public"."group_members" gm
    WHERE gm.group_id = group_members.group_id
    AND gm.user_id = auth.uid()
    AND gm.status = 'active'
  )
);

CREATE POLICY "Users can insert their own group memberships"
ON "public"."group_members"
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Group creators can manage members"
ON "public"."group_members"
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM "public"."groups" g
    WHERE g.id = group_members.group_id
    AND g.creator_id = auth.uid()
  )
); 