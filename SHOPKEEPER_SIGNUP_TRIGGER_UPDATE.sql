-- Run this in Supabase SQL Editor to update the trigger for shopkeeper signup
-- This trigger creates both shopkeeper and shops rows with all fields from metadata

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

CREATE OR REPLACE FUNCTION handle_new_user() RETURNS TRIGGER AS $$
BEGIN
  BEGIN
    IF NEW.raw_user_meta_data->>'role' = 'shopkeeper' THEN
      INSERT INTO public.shopkeepers (id, full_name, email, phone, upi_id, gst_number, role)
      VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
        COALESCE(NEW.email, ''),
        NEW.raw_user_meta_data->>'phone',
        NEW.raw_user_meta_data->>'upi_id',
        NEW.raw_user_meta_data->>'gst_number',
        'shopkeeper'
      )
      ON CONFLICT (id) DO NOTHING;

      -- Also create shop row
      INSERT INTO public.shops (
        shopkeeper_id, name, category, address,
        latitude, longitude, is_active
      )
      VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'shop_name', 'My Shop'),
        NEW.raw_user_meta_data->>'category',
        NEW.raw_user_meta_data->>'location',
        (NEW.raw_user_meta_data->>'lat')::float,
        (NEW.raw_user_meta_data->>'lng')::float,
        true
      )
      ON CONFLICT DO NOTHING;

    ELSE
      INSERT INTO public.customers (id, full_name, email, phone, role)
      VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
        COALESCE(NEW.email, ''),
        NEW.raw_user_meta_data->>'phone',
        'customer'
      )
      ON CONFLICT (id) DO NOTHING;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    RAISE LOG 'Error in handle_new_user: %', SQLERRM;
  END;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
