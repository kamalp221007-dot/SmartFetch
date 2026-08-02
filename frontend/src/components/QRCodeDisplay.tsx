import { QRCodeSVG } from 'qrcode.react'

interface OrderItem {
  name: string
  quantity: number
  unitPrice: number
  subtotal: number
}

interface QRCodeDisplayProps {
  orderId: string
  pickupCode: string
  customerName: string
  shopName: string
  shopkeeperName: string
  items: OrderItem[]
  totalAmount: number
  paymentMethod: string
  pickupTime: string
  createdAt: string
}

export default function QRCodeDisplay({
  orderId,
  pickupCode,
  customerName,
  shopName,
  shopkeeperName,
  items,
  totalAmount,
  paymentMethod,
  pickupTime,
  createdAt
}: QRCodeDisplayProps) {
  const qrData = {
    orderId,
    pickupCode,
    customerName,
    shopName,
    shopkeeperName,
    items,
    totalAmount,
    paymentMethod,
    pickupTime,
    createdAt
  }

  return (
    <div className="flex justify-center">
      <QRCodeSVG
        value={JSON.stringify(qrData)}
        size={200}
        level="H"
        includeMargin={true}
        fgColor="#10B981"
        bgColor="#FFFBF0"
      />
    </div>
  )
}
