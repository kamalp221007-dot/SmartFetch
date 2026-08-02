-- =====================================================
-- AUTO-CREATE USER ENTRY ON AUTH SIGNUP
-- =====================================================
-- This trigger automatically creates a user entry in the public.users table
-- whenever a new user signs up via Supabase Auth

-- Step 1: Create the trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (
    id,
    email,
    phone,
    full_name,
    role,
    auth_method,
    is_verified,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'full_name',
    COALESCE(NEW.raw_user_meta_data->>'role', 'customer'),
    CASE 
      WHEN NEW.raw_user_meta_data->>'phone' IS NOT NULL THEN 'phone'
      ELSE 'email'
    END,
    NEW.email_confirmed_at IS NOT NULL,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    phone = EXCLUDED.phone,
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role,
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 2: Create the trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Step 3: Verify the trigger is working
-- Test: SELECT * FROM public.users WHERE id = (SELECT id FROM auth.users LIMIT 1);

-- =====================================================
-- NOTES
-- =====================================================
-- 1. This trigger runs automatically when a user signs up
-- 2. It extracts role from user_metadata (defaults to 'customer')
-- 3. It extracts phone and full_name from user_metadata
-- 4. It marks email as verified if email_confirmed_at is set
-- 5. If a user already exists (duplicate), it updates the record
-- 6. The trigger is SECURITY DEFINER so it can insert into public.users
--    even if the user doesn't have direct insert permissions

-- =====================================================
-- TO APPLY THIS TRIGGER:
-- =====================================================
-- 1. Go to Supabase Dashboard
-- 2. Click "SQL Editor"
-- 3. Click "New Query"
-- 4. Copy and paste this entire file
-- 5. Click "Run"
-- 6. Verify: Go to "Auth" > "Users" and check if new users appear in public.users table

-- =====================================================
-- TROUBLESHOOTING
-- =====================================================
-- If trigger doesn't work:
-- 1. Check that auth.users table exists (it should in Supabase)
-- 2. Check that public.users table exists
-- 3. Verify RLS policies don't block inserts
-- 4. Check trigger logs: SELECT * FROM pg_stat_user_functions WHERE funcname = 'handle_new_user';
