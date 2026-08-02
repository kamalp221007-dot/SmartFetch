interface PasswordStrengthProps {
  password: string
}

export default function PasswordStrength({ password }: PasswordStrengthProps) {
  const getStrength = () => {
    let strength = 0

    if (password.length >= 8) strength++
    if (/[0-9]/.test(password)) strength++
    if (/[A-Z]/.test(password)) strength++
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) strength++

    return strength
  }

  const strength = getStrength()
  const maxStrength = 4

  const getColor = () => {
    if (strength <= 1) return 'bg-red-500'
    if (strength <= 2) return 'bg-yellow-500'
    return 'bg-emerald-500'
  }

  const getLabel = () => {
    if (strength <= 1) return 'Weak'
    if (strength <= 2) return 'Medium'
    return 'Strong'
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">Password Strength</label>
        <span className="text-xs font-medium text-gray-600">{getLabel()}</span>
      </div>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${getColor()}`}
          style={{ width: `${(strength / maxStrength) * 100}%` }}
        />
      </div>
      <ul className="text-xs text-gray-600 space-y-1">
        <li className={password.length >= 8 ? 'text-emerald-600' : ''}>
          ✓ At least 8 characters
        </li>
        <li className={/[0-9]/.test(password) ? 'text-emerald-600' : ''}>
          ✓ Contains a number
        </li>
        <li className={/[A-Z]/.test(password) ? 'text-emerald-600' : ''}>
          ✓ Contains uppercase letter
        </li>
        <li className={/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password) ? 'text-emerald-600' : ''}>
          ✓ Contains special character
        </li>
      </ul>
    </div>
  )
}
