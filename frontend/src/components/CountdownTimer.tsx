import { useEffect, useState } from 'react'

interface CountdownTimerProps {
  seconds?: number
  onComplete?: () => void
}

export default function CountdownTimer({ seconds = 60, onComplete }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState(seconds)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    if (timeLeft <= 0) {
      setIsReady(true)
      onComplete?.()
      return
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        const newTime = prev - 1
        if (newTime <= 0) {
          setIsReady(true)
          onComplete?.()
          return 0
        }
        return newTime
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [timeLeft, onComplete])

  return {
    timeLeft,
    isReady,
    displayText: isReady ? 'Resend Email' : `Resend in ${timeLeft}s...`
  }
}
