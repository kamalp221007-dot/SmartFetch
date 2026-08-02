-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- Policy: Users can insert their own profile (during signup)
CREATE POLICY "Users can insert own profile"
  ON users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Enable RLS on shops table
ALTER TABLE shops ENABLE ROW LEVEL SECURITY;

-- Policy: Shop owners can view their own shops
CREATE POLICY "Owners can view own shops"
  ON shops FOR SELECT
  USING (auth.uid() = owner_id);

-- Policy: Shop owners can create shops
CREATE POLICY "Owners can create shops"
  ON shops FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

-- Policy: Shop owners can update their own shops
CREATE POLICY "Owners can update own shops"
  ON shops FOR UPDATE
  USING (auth.uid() = owner_id);

-- Policy: Shop owners can delete their own shops
CREATE POLICY "Owners can delete own shops"
  ON shops FOR DELETE
  USING (auth.uid() = owner_id);

-- Enable RLS on products table
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Policy: Shop owners can view products in their shops
CREATE POLICY "Owners can view own products"
  ON products FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM shops
      WHERE shops.id = products.shop_id
      AND shops.owner_id = auth.uid()
    )
  );

-- Policy: Shop owners can create products
CREATE POLICY "Owners can create products"
  ON products FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM shops
      WHERE shops.id = products.shop_id
      AND shops.owner_id = auth.uid()
    )
  );

-- Policy: Shop owners can update their products
CREATE POLICY "Owners can update products"
  ON products FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM shops
      WHERE shops.id = products.shop_id
      AND shops.owner_id = auth.uid()
    )
  );

-- Policy: Shop owners can delete their products
CREATE POLICY "Owners can delete products"
  ON products FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM shops
      WHERE shops.id = products.shop_id
      AND shops.owner_id = auth.uid()
    )
  );

-- Enable RLS on orders table
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Policy: Shop owners can view orders for their shops
CREATE POLICY "Owners can view shop orders"
  ON orders FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM shops
      WHERE shops.id = orders.shop_id
      AND shops.owner_id = auth.uid()
    )
  );

-- Policy: Customers can view their own orders
CREATE POLICY "Customers can view own orders"
  ON orders FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Shop owners can create orders
CREATE POLICY "Owners can create orders"
  ON orders FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM shops
      WHERE shops.id = orders.shop_id
      AND shops.owner_id = auth.uid()
    )
  );

-- Policy: Shop owners can update orders
CREATE POLICY "Owners can update orders"
  ON orders FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM shops
      WHERE shops.id = orders.shop_id
      AND shops.owner_id = auth.uid()
    )
  );

-- Enable RLS on order_items table
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view order items for orders they can access
CREATE POLICY "Users can view accessible order items"
  ON order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders
      JOIN shops ON shops.id = orders.shop_id
      WHERE orders.id = order_items.order_id
      AND (shops.owner_id = auth.uid() OR orders.user_id = auth.uid())
    )
  );

-- Policy: Shop owners can create order items
CREATE POLICY "Owners can create order items"
  ON order_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      JOIN shops ON shops.id = orders.shop_id
      WHERE orders.id = order_items.order_id
      AND shops.owner_id = auth.uid()
    )
  );

-- Enable RLS on otp_codes table
ALTER TABLE otp_codes ENABLE ROW LEVEL SECURITY;

-- Policy: Allow service role to manage OTP codes
CREATE POLICY "Service role can manage OTP"
  ON otp_codes FOR ALL
  USING (true)
  WITH CHECK (true);
