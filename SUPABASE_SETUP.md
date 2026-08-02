# Supabase Setup Guide

Complete guide to set up Supabase for SmartFetch with customer data storage.

## Your Supabase Project

**Project URL**: https://sxghctohznlmuuyzyaut.supabase.co

**Database URL**: postgresql://postgres:[YOUR-PASSWORD]@db.sxghctohznlmuuyzyaut.supabase.co:5432/postgres

## Step 1: Access Supabase Dashboard

1. Go to https://supabase.com
2. Sign in with your account
3. Select your project: `sxghctohznlmuuyzyaut`
4. You're in the dashboard

## Step 2: Create Database Tables

1. Go to **SQL Editor** in the left sidebar
2. Click **New Query**
3. Copy and paste the SQL from `supabase-tables.sql`
4. Click **Run**
5. Verify tables are created in **Table Editor**

## Step 3: Set Up Row Level Security

1. Go to **SQL Editor**
2. Click **New Query**
3. Copy and paste the SQL from `supabase-rls-policies.sql`
4. Click **Run**
5. Verify RLS policies are enabled

## Step 4: Configure Backend

Edit `backend/.env`:

```env
SUPABASE_URL=https://sxghctohznlmuuyzyaut.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_DB_URL=postgresql://postgres:[YOUR-PASSWORD]@db.sxghctohznlmuuyzyaut.supabase.co:5432/postgres
```

## Step 5: Verify Connection

```bash
cd backend
npm run dev
```

Check logs for:
- "Database initialized"
- "Email service initialized"
- "Server running on http://localhost:5000"

## Database Tables

### Users Table
Stores customer information:
- `id` - UUID primary key
- `email` - Unique email address
- `phone` - Unique phone number
- `full_name` - Customer name
- `created_at` - Account creation date
- `updated_at` - Last update date
- `is_active` - Account status
- `deleted_at` - Deletion date (soft delete)

### Shops Table
Stores shop information:
- `id` - UUID primary key
- `owner_id` - Reference to users table
- `shop_name` - Shop name
- `address` - Shop address
- `created_at` - Creation date

### Products Table
Stores product information:
- `id` - UUID primary key
- `shop_id` - Reference to shops table
- `name` - Product name
- `price` - Product price
- `stock` - Stock quantity
- `created_at` - Creation date

### Orders Table
Stores order information:
- `id` - UUID primary key
- `user_id` - Reference to users table
- `total_price` - Order total
- `status` - Order status
- `created_at` - Order date

### Order Items Table
Stores order line items:
- `id` - UUID primary key
- `order_id` - Reference to orders table
- `product_id` - Reference to products table
- `quantity` - Item quantity
- `price` - Item price

### OTP Codes Table
Stores OTP codes:
- `id` - UUID primary key
- `phone` - Phone number
- `otp` - OTP code
- `expires_at` - Expiry time
- `created_at` - Creation time

## API Endpoints for Customer Data

### Create/Update Customer
```
POST /api/auth/verify-otp
{
  "email": "customer@example.com",
  "otp": "123456"
}
```

Response:
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "customer@example.com",
    "full_name": "Customer Name",
    "phone": "+91XXXXXXXXXX"
  },
  "token": "jwt_token"
}
```

### Get Customer Profile
```
GET /api/users/profile/:userId
```

Response:
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "customer@example.com",
    "full_name": "Customer Name",
    "phone": "+91XXXXXXXXXX",
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

### Update Customer Profile
```
PUT /api/users/profile/:userId
{
  "full_name": "Updated Name",
  "phone": "+91XXXXXXXXXX",
  "email": "newemail@example.com"
}
```

### Get All Customers
```
GET /api/users/all?limit=100&offset=0
```

### Search Customers
```
GET /api/users/search?q=customer_name
```

## Customer Data Flow

1. **Customer Signs Up**
   - Enters email or phone
   - Receives OTP
   - Verifies OTP
   - Account created in `users` table

2. **Customer Data Stored**
   - Email (unique)
   - Phone (unique)
   - Full name
   - Creation timestamp
   - Account status

3. **Customer Logs In**
   - Existing customer data retrieved
   - JWT token generated
   - Session maintained

4. **Customer Profile Update**
   - Name, phone, email updated
   - Changes saved to database
   - Update timestamp recorded

## Row Level Security (RLS)

RLS policies ensure:
- Users can only access their own data
- Admins can access all data
- Service role can manage all data

Policies:
```sql
-- Users can read their own data
SELECT: auth.uid() = id

-- Users can update their own data
UPDATE: auth.uid() = id

-- Service role can do anything
(via service role key)
```

## Monitoring Customer Data

### In Supabase Dashboard

1. Go to **Table Editor**
2. Select **users** table
3. View all customers
4. Click on a customer to see details
5. Edit or delete as needed

### Via API

```bash
# Get all customers
curl http://localhost:5000/api/users/all

# Search customers
curl http://localhost:5000/api/users/search?q=john

# Get specific customer
curl http://localhost:5000/api/users/profile/user-id
```

## Backup & Recovery

### Automatic Backups
Supabase automatically backs up your data daily.

### Manual Backup
1. Go to **Settings** → **Backups**
2. Click **Create backup**
3. Download backup file

### Restore from Backup
1. Go to **Settings** → **Backups**
2. Select backup
3. Click **Restore**

## Security Best Practices

1. **Never share service role key** - Keep it secret
2. **Use RLS policies** - Restrict data access
3. **Enable 2FA** - Protect your account
4. **Regular backups** - Prevent data loss
5. **Monitor access** - Check logs regularly
6. **Update passwords** - Change regularly

## Troubleshooting

### Connection Failed
- Verify SUPABASE_URL is correct
- Check SUPABASE_SERVICE_ROLE_KEY
- Ensure database is active

### Tables Not Found
- Run `supabase-tables.sql` in SQL Editor
- Verify tables appear in Table Editor
- Check for errors in SQL execution

### RLS Errors
- Run `supabase-rls-policies.sql`
- Verify policies are enabled
- Check policy conditions

### Data Not Saving
- Check RLS policies
- Verify user permissions
- Check database logs

## Next Steps

1. ✅ Create database tables
2. ✅ Set up RLS policies
3. ✅ Configure backend .env
4. ✅ Start backend server
5. ✅ Test customer registration
6. ✅ Verify data in Supabase
7. ✅ Monitor customer data

## Support

For issues:
1. Check Supabase dashboard
2. Review database logs
3. Verify RLS policies
4. Check backend logs
5. Test API endpoints

---

**Your Supabase Project**: https://sxghctohznlmuuyzyaut.supabase.co

**Status**: Ready for customer data storage ✅
