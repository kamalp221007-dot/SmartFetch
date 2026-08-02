import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { MessageCircle } from 'lucide-react'
import { supabase } from '@/config/supabase'
import Navbar from '@/components/Navbar'
import BottomNav from '@/components/BottomNav'
import Receipt from '@/components/Receipt'
import ChatPanel from '@/components/ChatPanel'
import LoadingSpinner from '@/components/LoadingSpinner'

interface Order {
  id: string
  pickup_code: string
  total_amount: number
  payment_method: string
  pickup_time: string
  created_at: string
  status: string
}

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [order, setOrder] = useState<Order | null>(null)
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchOrder = async () => {
      if (!id) return

      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .eq('id', id)
          .single()

        if (error) throw error
        setOrder(data)
      } catch (error) {
        console.error('Failed to fetch order:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchOrder()
  }, [id])

  if (isLoading) {
    return <LoadingSpinner text="Loading order..." />
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Order not found</p>
      </div>
    )
  }

  const getStatusSteps = () => {
    const steps = ['Pending', 'Confirmed', 'Ready', 'Picked Up']
    const currentIndex = ['pending', 'confirmed', 'ready', 'picked_up'].indexOf(order.status)
    return steps.map((step, idx) => ({
      step,
      completed: idx <= currentIndex,
      current: idx === currentIndex
    }))
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Pickup Code */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8 text-center">
          <p className="text-gray-600 mb-2">Your Pickup Code</p>
          <p className="font-mono text-4xl font-bold text-emerald-600 mb-4">{order.pickup_code}</p>
          <p className="text-sm text-gray-500">Show this code to the shopkeeper</p>
        </div>

        {/* Status Tracker */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Order Status</h2>
          <div className="flex justify-between">
            {getStatusSteps().map((item, idx) => (
              <div key={idx} className="flex flex-col items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold mb-2 ${
                    item.completed
                      ? 'bg-emerald-600 text-white'
                      : item.current
                      ? 'bg-yellow-500 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {item.completed ? '✓' : idx + 1}
                </div>
                <p className="text-xs text-center text-gray-600">{item.step}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Receipt */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <Receipt
            order={{
              id: order.id,
              pickupCode: order.pickup_code,
              customerName: "Customer Name",
              shopName: "Shop Name",
              shopkeeperName: "Shopkeeper Name",
              items: [],
              totalAmount: order.total_amount,
              paymentMethod: order.payment_method,
              pickupTime: order.pickup_time,
              createdAt: order.created_at
            }}
            showQR={true}
          />
        </div>

        {/* Message Shop Button */}
        <button
          onClick={() => setIsChatOpen(true)}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-semibold"
        >
          <MessageCircle className="w-5 h-5" />
          Message Shop
        </button>
      </div>

      {/* Chat Panel */}
      <ChatPanel
        orderId={order.id}
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        userRole="customer"
      />

      <BottomNav />
    </div>
  )
}
