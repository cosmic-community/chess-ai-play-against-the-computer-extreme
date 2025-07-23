import { useState, useEffect, useCallback, useRef } from 'react'

export interface TimerState {
  timeLeft: number
  isRunning: boolean
  isExpired: boolean
}

export interface UseTimerOptions {
  initialTime: number // in seconds
  onExpire?: () => void
  autoStart?: boolean
}

export const useTimer = ({ initialTime, onExpire, autoStart = false }: UseTimerOptions) => {
  const [timeLeft, setTimeLeft] = useState(initialTime)
  const [isRunning, setIsRunning] = useState(autoStart)
  const [isExpired, setIsExpired] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const onExpireRef = useRef(onExpire)

  // Keep the onExpire callback up to date
  useEffect(() => {
    onExpireRef.current = onExpire
  }, [onExpire])

  // Timer logic
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false)
            setIsExpired(true)
            if (onExpireRef.current) {
              onExpireRef.current()
            }
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isRunning, timeLeft])

  const start = useCallback(() => {
    if (timeLeft > 0 && !isExpired) {
      setIsRunning(true)
    }
  }, [timeLeft, isExpired])

  const pause = useCallback(() => {
    setIsRunning(false)
  }, [])

  const reset = useCallback((newTime?: number) => {
    const resetTime = newTime ?? initialTime
    setTimeLeft(resetTime)
    setIsRunning(false)
    setIsExpired(false)
  }, [initialTime])

  const stop = useCallback(() => {
    setIsRunning(false)
    setTimeLeft(initialTime)
    setIsExpired(false)
  }, [initialTime])

  // Format time as MM:SS
  const formatTime = useCallback((seconds: number): string => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  }, [])

  const formattedTime = formatTime(timeLeft)

  return {
    timeLeft,
    isRunning,
    isExpired,
    formattedTime,
    start,
    pause,
    reset,
    stop
  }
}