-- Enable UUID extension
create extension if not exists "pgcrypto";

-- USERS TABLE
create table users (
  id uuid primary key default gen_random_uuid(),
  phone text unique,
  name text,
  created_at timestamp with time zone default now()
);

-- SHOPS TABLE
create table shops (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references users(id) on delete cascade,
  shop_name text not null,
  address text,
  created_at timestamp with time zone default now()
);

-- PRODUCTS TABLE
create table products (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references shops(id) on delete cascade,
  name text not null,
  price numeric not null,
  stock integer default 0,
  created_at timestamp with time zone default now()
);

-- ORDERS TABLE
create table orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  total_price numeric not null,
  status text default 'pending',
  created_at timestamp with time zone default now()
);

-- ORDER ITEMS TABLE
create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  product_id uuid not null references products(id),
  quantity integer not null,
  price numeric not null
);

-- OTP TABLE
create table otp_codes (
  id uuid primary key default gen_random_uuid(),
  phone text not null,
  otp text not null,
  expires_at timestamp with time zone not null,
  created_at timestamp with time zone default now()
);

-- INDEXES (for faster queries)
create index idx_shops_owner_id on shops(owner_id);
create index idx_products_shop_id on products(shop_id);
create index idx_orders_user_id on orders(user_id);
create index idx_order_items_order_id on order_items(order_id);
create index idx_order_items_product_id on order_items(product_id);
create index idx_otp_phone on otp_codes(phone);
