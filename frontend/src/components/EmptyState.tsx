import { ReactNode } from 'react'
import { Package } from 'lucide-react'

interface EmptyStateProps {
  icon?: ReactNode
  heading: string
  subtext: string
  action?: ReactNode
}

export default function EmptyState({ icon, heading, subtext, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="text-emerald-500 mb-4">
        {icon || <Package className="w-16 h-16" />}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{heading}</h3>
      <p className="text-gray-600 text-center mb-6 max-w-sm">{subtext}</p>
      {action && <div>{action}</div>}
    </div>
  )
}
