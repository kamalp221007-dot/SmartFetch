import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/config/supabase'
import DashboardLayout from '@/layouts/DashboardLayout'

interface Product {
  id: string
  name: string
  description: string
  price: number
  category: string
  stock_quantity: number
  image_url: string
  is_available: boolean
}

export default function ProductsPage() {
  const navigate = useNavigate()
  const [products, setProducts] = useState<Product[]>([])
  const [shopId, setShopId] = useState<string>('')
  const [shopName, setShopName] = useState('')
  const [ownerName, setOwnerName] = useState('')
  const [shopExists, setShopExists] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editProduct, setEditProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  // Form state
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [category, setCategory] = useState('Food')
  const [stock, setStock] = useState('0')
  const [unit, setUnit] = useState('piece')
  const [brand, setBrand] = useState('')
  const [minOrder, setMinOrder] = useState('1')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [isAvailable, setIsAvailable] = useState(true)
  const [saving, setSaving] = useState(false)

  const categories = ['Food', 'Grocery', 'Pharmacy', 'Electronics', 'Clothing', 'Other']

  useEffect(() => {
    init()
  }, [])

  const init = async () => {
    setLoading(true)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        navigate('/login')
        return
      }

      // STEP 1: Get shopkeeper row using user_id (auth user id)
      const { data: sk, error: skErr } = await supabase
        .from('shopkeepers')
        .select('id, owner_name')
        .eq('user_id', session.user.id)
        .maybeSingle()

      if (skErr) {
        console.error('Shopkeeper fetch error:', skErr)
        setLoading(false)
        return
      }

      if (!sk) {
        console.log('No shopkeeper row for user:', session.user.id)
        setShopExists(false)
        setLoading(false)
        return
      }

      setOwnerName(sk.owner_name || '')

      // STEP 2: Get shop using shopkeepers.id (NOT auth user id)
      const { data: shop, error: shopErr } = await supabase
        .from('shops')
        .select('id, name')
        .eq('shopkeeper_id', sk.id)
        .maybeSingle()

      if (shopErr) {
        console.error('Shop fetch error:', shopErr)
        setLoading(false)
        return
      }

      if (!shop) {
        console.log('No shop for shopkeeper:', sk.id)
        setShopExists(false)
        setLoading(false)
        return
      }

      setShopId(shop.id)
      setShopName(shop.name || '')
      setShopExists(true)

      // STEP 3: Get products for this shop
      const { data: prods } = await supabase
        .from('products')
        .select('*')
        .eq('shop_id', shop.id)
        .order('created_at', { ascending: false })

      setProducts(prods || [])

    } catch (err: any) {
      console.error('Init error:', err)
    } finally {
      setLoading(false)
    }
  }

  const openAddModal = () => {
    setEditProduct(null)
    setName(''); setDescription(''); setPrice('')
    setCategory('Food'); setStock('0')
    setIsAvailable(true); setImageFile(null)
    setShowModal(true)
  }

  const openEditModal = (product: Product) => {
    setEditProduct(product)
    setName(product.name)
    setDescription(product.description || '')
    setPrice(product.price.toString())
    setCategory(product.category || 'Food')
    setStock(product.stock_quantity.toString())
    setIsAvailable(product.is_available)
    setShowModal(true)
  }

  const handleSave = async () => {
    // Guard: check shopId exists before anything
    if (!shopId || shopId.trim() === '') {
      console.error('shopId is empty!')
      // Try to fetch shop one more time
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        const { data: shop } = await supabase
          .from('shops')
          .select('id')
          .eq('shopkeeper_id', session.user.id)
          .single()
        if (shop?.id) {
          setShopId(shop.id)
          // Continue with save using shop.id directly
        } else {
          alert('Shop not found. Please go to My Shop and complete setup first.')
          navigate('/dashboard/shop')
          return
        }
      }
      return
    }

    // Validation
    if (!name || !name.trim()) {
      alert('Product name is required')
      return
    }
    if (!price || parseFloat(price) <= 0) {
      alert('Price must be greater than 0')
      return
    }
    if (!category) {
      alert('Please select a category')
      return
    }

    setSaving(true)
    try {
      let imageUrl = editProduct?.image_url || null

      // Upload image if provided
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop()
        const fileName = `${shopId}/${Date.now()}.${fileExt}`
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(fileName, imageFile, { upsert: true })

        if (uploadError) {
          console.error('Image upload error:', uploadError)
          // Continue without image if upload fails
        } else if (uploadData) {
          const { data: urlData } = supabase.storage
            .from('product-images')
            .getPublicUrl(uploadData.path)
          imageUrl = urlData.publicUrl
        }
      }

      const productData = {
        shop_id: shopId,
        name: name.trim(),
        description: description.trim() || null,
        price: parseFloat(price),
        category,
        stock_quantity: parseInt(stock) || 0,
        unit_type: unit,
        brand: brand.trim() || null,
        image_url: imageUrl,
        is_available: isAvailable,
        min_order_qty: parseInt(minOrder) || 1
      }

      if (editProduct) {
        // UPDATE existing product
        const { error: updateError } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editProduct.id)

        if (updateError) throw updateError
      } else {
        // INSERT new product
        const { data: newProduct, error: insertError } = await supabase
          .from('products')
          .insert(productData)
          .select()
          .single()

        if (insertError) throw insertError

        // Immediately add to state so it shows without refetch
        if (newProduct) {
          setProducts(prev => [newProduct, ...prev])
          setShowModal(false)
          setSaving(false)
          return
        }
      }

      // Refetch to get updated list
      const { data: updated } = await supabase
        .from('products')
        .select('*')
        .eq('shop_id', shopId)
        .order('created_at', { ascending: false })

      setProducts(updated || [])
      setShowModal(false)

    } catch (err: any) {
      console.error('Save product error:', err)
      alert('Failed to save product: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleToggle = async (id: string, current: boolean) => {
    await supabase.from('products').update({ is_available: !current }).eq('id', id)
    init()
  }

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <DashboardLayout>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ color: '#fff', fontSize: '1.75rem', fontWeight: 800, margin: 0, fontFamily: "'Syne', sans-serif" }}>
            My Products
          </h1>
          <p style={{ color: '#94A3B8', marginTop: '0.25rem' }}>
            {products.length} products in your shop
          </p>
        </div>
        <button onClick={openAddModal} style={{
          padding: '0.875rem 1.5rem',
          background: 'linear-gradient(135deg, #10B981, #059669)',
          color: '#fff', border: 'none', borderRadius: '12px',
          fontWeight: 700, cursor: 'pointer', fontSize: '0.95rem',
          boxShadow: '0 4px 15px rgba(16,185,129,0.4)',
          transition: 'all 0.2s ease'
        }}>
          + Add Product
        </button>
      </div>

      {/* Search */}
      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Search products..."
        style={{
          width: '100%', padding: '0.875rem 1rem',
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '12px', color: '#fff',
          fontSize: '1rem', marginBottom: '1.5rem',
          outline: 'none', boxSizing: 'border-box'
        }}
      />

      {/* Products Grid */}
      {loading ? (
        <p style={{ color: '#94A3B8' }}>Loading products...</p>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📦</div>
          <h3 style={{ color: '#fff' }}>No products yet</h3>
          <p style={{ color: '#94A3B8' }}>Click "Add Product" to add your first item</p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '1.25rem'
        }}>
          {filtered.map(product => (
            <div key={product.id} style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '20px',
              overflow: 'hidden',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)'
              ;(e.currentTarget as HTMLElement).style.borderColor = 'rgba(16,185,129,0.3)'
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'
              ;(e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.08)'
            }}>
              {/* Product Image */}
              <div style={{
                height: '160px',
                background: product.image_url
                  ? `url(${product.image_url}) center/cover`
                  : 'linear-gradient(135deg, #1a2744, #0d1f3c)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                {!product.image_url && (
                  <span style={{ fontSize: '3rem' }}>🛍️</span>
                )}
              </div>

              {/* Product Info */}
              <div style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h3 style={{ color: '#fff', margin: 0, fontWeight: 700, fontSize: '1rem' }}>
                    {product.name}
                  </h3>
                  <span style={{
                    padding: '0.25rem 0.625rem', borderRadius: '50px', fontSize: '0.75rem',
                    background: product.is_available ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)',
                    color: product.is_available ? '#10B981' : '#EF4444'
                  }}>
                    {product.is_available ? 'Available' : 'Unavailable'}
                  </span>
                </div>

                <p style={{ color: '#94A3B8', fontSize: '0.85rem', margin: '0.5rem 0' }}>
                  {product.category} • Stock: {product.stock_quantity}
                  {product.stock_quantity <= 5 && (
                    <span style={{
                      marginLeft: '8px',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      background: 'rgba(239,68,68,0.2)',
                      color: '#FCA5A5',
                      fontSize: '0.75rem',
                      fontWeight: 600
                    }}>
                      ⚠️ Low Stock
                    </span>
                  )}
                </p>

                <p style={{ color: '#10B981', fontWeight: 800, fontSize: '1.25rem', margin: '0.5rem 0' }}>
                  ₹{product.price}
                </p>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                  <button onClick={() => openEditModal(product)} style={{
                    flex: 1, padding: '0.625rem',
                    background: 'rgba(59,130,246,0.15)',
                    border: '1px solid rgba(59,130,246,0.3)',
                    borderRadius: '10px', color: '#3B82F6',
                    cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem'
                  }}>
                    ✏️ Edit
                  </button>
                  <button onClick={() => handleToggle(product.id, product.is_available)} style={{
                    flex: 1, padding: '0.625rem',
                    background: 'rgba(245,158,11,0.15)',
                    border: '1px solid rgba(245,158,11,0.3)',
                    borderRadius: '10px', color: '#F59E0B',
                    cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem'
                  }}>
                    {product.is_available ? '🔴 Hide' : '🟢 Show'}
                  </button>
                  <button onClick={() => setDeleteConfirm(product.id)} style={{
                    padding: '0.625rem 0.875rem',
                    background: 'rgba(239,68,68,0.15)',
                    border: '1px solid rgba(239,68,68,0.3)',
                    borderRadius: '10px', color: '#EF4444',
                    cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem'
                  }}>
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.85)',
          display: 'flex', alignItems: 'center',
          justifyContent: 'center', zIndex: 1000,
          padding: '1rem'
        }}>
          <div style={{
            background: '#0D1424',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '24px',
            padding: '2rem',
            width: '100%', maxWidth: '500px',
            maxHeight: '90vh', overflowY: 'auto'
          }}>
            <h2 style={{ color: '#fff', fontWeight: 800, marginBottom: '1.5rem', fontFamily: "'Syne', sans-serif" }}>
              {editProduct ? 'Edit Product' : 'Add New Product'}
            </h2>

            {[
              { label: 'Product Name *', value: name, setter: setName, placeholder: 'e.g. Basmati Rice 1kg' },
              { label: 'Description', value: description, setter: setDescription, placeholder: 'Optional description' },
              { label: 'Price (₹) *', value: price, setter: setPrice, placeholder: '0.00', type: 'number' },
              { label: 'Brand', value: brand, setter: setBrand, placeholder: 'Optional' },
              { label: 'Stock Quantity', value: stock, setter: setStock, placeholder: '0', type: 'number' },
              { label: 'Min Order Qty', value: minOrder, setter: setMinOrder, placeholder: '1', type: 'number' },
            ].map(field => (
              <div key={field.label} style={{ marginBottom: '1rem' }}>
                <label style={{ color: '#94A3B8', fontSize: '0.875rem', display: 'block', marginBottom: '0.375rem' }}>
                  {field.label}
                </label>
                <input
                  type={field.type || 'text'}
                  value={field.value}
                  onChange={e => field.setter(e.target.value)}
                  placeholder={field.placeholder}
                  style={{
                    width: '100%', padding: '0.875rem',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px', color: '#fff',
                    fontSize: '1rem', outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            ))}

            {/* Category */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ color: '#94A3B8', fontSize: '0.875rem', display: 'block', marginBottom: '0.375rem' }}>
                Category
              </label>
              <select value={category} onChange={e => setCategory(e.target.value)} style={{
                width: '100%', padding: '0.875rem',
                background: '#0A0F1E',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px', color: '#fff',
                fontSize: '1rem', outline: 'none'
              }}>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* Unit Type */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ color: '#94A3B8', fontSize: '0.875rem', display: 'block', marginBottom: '0.375rem' }}>
                Unit Type
              </label>
              <select value={unit} onChange={e => setUnit(e.target.value)} style={{
                width: '100%', padding: '0.875rem',
                background: '#0A0F1E',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px', color: '#fff',
                fontSize: '1rem', outline: 'none'
              }}>
                <option value="piece">Piece</option>
                <option value="kg">Kilogram</option>
                <option value="liter">Liter</option>
                <option value="gram">Gram</option>
                <option value="ml">Milliliter</option>
              </select>
            </div>

            {/* Image Upload */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ color: '#94A3B8', fontSize: '0.875rem', display: 'block', marginBottom: '0.375rem' }}>
                Product Image (optional)
              </label>
              <input type="file" accept="image/*"
                onChange={e => setImageFile(e.target.files?.[0] || null)}
                style={{ color: '#94A3B8', fontSize: '0.875rem' }}
              />
            </div>

            {/* Available Toggle */}
            <div style={{
              display: 'flex', alignItems: 'center',
              gap: '0.75rem', marginBottom: '1.5rem'
            }}>
              <div
                onClick={() => setIsAvailable(!isAvailable)}
                style={{
                  width: '48px', height: '26px',
                  borderRadius: '50px',
                  background: isAvailable ? '#10B981' : 'rgba(255,255,255,0.2)',
                  cursor: 'pointer', position: 'relative',
                  transition: 'all 0.3s ease'
                }}
              >
                <div style={{
                  position: 'absolute', top: '3px',
                  left: isAvailable ? '25px' : '3px',
                  width: '20px', height: '20px',
                  borderRadius: '50%', background: '#fff',
                  transition: 'all 0.3s ease'
                }} />
              </div>
              <span style={{ color: '#94A3B8' }}>
                {isAvailable ? 'Available for purchase' : 'Hidden from customers'}
              </span>
            </div>

            {/* Buttons */}
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button onClick={() => setShowModal(false)} style={{
                flex: 1, padding: '1rem',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px', color: '#94A3B8',
                cursor: 'pointer', fontWeight: 600
              }}>
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving} style={{
                flex: 2, padding: '1rem',
                background: 'linear-gradient(135deg, #10B981, #059669)',
                border: 'none', borderRadius: '12px',
                color: '#fff', fontWeight: 700,
                cursor: saving ? 'not-allowed' : 'pointer',
                opacity: saving ? 0.7 : 1
              }}>
                {saving ? 'Saving...' : editProduct ? 'Save Changes' : 'Add Product'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.85)',
          display: 'flex', alignItems: 'center',
          justifyContent: 'center', zIndex: 1001,
          padding: '1rem'
        }}>
          <div style={{
            background: '#0D1424',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '24px',
            padding: '2rem',
            width: '100%', maxWidth: '400px'
          }}>
            <h2 style={{ color: '#fff', fontWeight: 800, marginBottom: '1rem', fontFamily: "'Syne', sans-serif" }}>
              Delete Product?
            </h2>
            <p style={{ color: '#94A3B8', marginBottom: '2rem' }}>
              Are you sure you want to delete this product? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button onClick={() => setDeleteConfirm(null)} style={{
                flex: 1, padding: '1rem',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px', color: '#94A3B8',
                cursor: 'pointer', fontWeight: 600
              }}>
                Cancel
              </button>
              <button onClick={async () => {
                await supabase.from('products').delete().eq('id', deleteConfirm)
                setDeleteConfirm(null)
                init()
              }} style={{
                flex: 1, padding: '1rem',
                background: 'linear-gradient(135deg, #EF4444, #DC2626)',
                border: 'none', borderRadius: '12px',
                color: '#fff', fontWeight: 700,
                cursor: 'pointer'
              }}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
