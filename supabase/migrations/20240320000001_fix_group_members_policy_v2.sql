-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own group memberships" ON "public"."group_members";
DROP POLICY IF EXISTS "Users can view members of groups they belong to" ON "public"."group_members";
DROP POLICY IF EXISTS "Users can insert their own group memberships" ON "public"."group_members";
DROP POLICY IF EXISTS "Group creators can manage members" ON "public"."group_members";

-- Enable RLS
ALTER TABLE "public"."group_members" ENABLE ROW LEVEL SECURITY;

-- Create simplified policies
CREATE POLICY "Enable read access for authenticated users"
ON "public"."group_members"
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Enable insert for authenticated users"
ON "public"."group_members"
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable update for group creators"
ON "public"."group_members"
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM "public"."groups"
    WHERE id = group_members.group_id
    AND creator_id = auth.uid()
  )
);

CREATE POLICY "Enable delete for group creators"
ON "public"."group_members"
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM "public"."groups"
    WHERE id = group_members.group_id
    AND creator_id = auth.uid()
  )
); 