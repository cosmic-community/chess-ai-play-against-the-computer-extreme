'use client'

import { useTimer } from '@/hooks/useTimer'

interface TimerProps {
  initialTime: number // in seconds
  isActive: boolean
  onExpire: () => void
  onReset?: () => void
  className?: string
}

export default function Timer({ 
  initialTime, 
  isActive, 
  onExpire, 
  onReset,
  className = '' 
}: TimerProps) {
  const { timeLeft, isRunning, isExpired, formattedTime, start, pause, reset } = useTimer({
    initialTime,
    onExpire,
    autoStart: false
  })

  // Control timer based on isActive prop
  React.useEffect(() => {
    if (isActive && !isExpired && timeLeft > 0) {
      start()
    } else {
      pause()
    }
  }, [isActive, isExpired, timeLeft, start, pause])

  // Handle reset from parent component
  React.useEffect(() => {
    if (onReset && timeLeft === initialTime && !isRunning) {
      // Timer has been reset externally
    }
  }, [timeLeft, initialTime, isRunning, onReset])

  // Get timer color based on remaining time
  const getTimerColor = () => {
    const percentage = (timeLeft / initialTime) * 100
    if (percentage <= 10) return 'text-red-600 bg-red-50 border-red-300'
    if (percentage <= 25) return 'text-orange-600 bg-orange-50 border-orange-300'
    if (percentage <= 50) return 'text-yellow-600 bg-yellow-50 border-yellow-300'
    return 'text-green-600 bg-green-50 border-green-300'
  }

  // Get timer urgency animation
  const getTimerAnimation = () => {
    const percentage = (timeLeft / initialTime) * 100
    if (percentage <= 10 && isRunning) return 'animate-pulse'
    if (percentage <= 25 && isRunning) return 'animate-bounce'
    return ''
  }

  const handleReset = () => {
    reset()
    if (onReset) {
      onReset()
    }
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Timer Display */}
      <div className={`
        px-4 py-2 rounded-lg border-2 font-mono text-lg font-bold
        ${getTimerColor()}
        ${getTimerAnimation()}
        ${isExpired ? 'opacity-50' : ''}
      `}>
        <div className="flex items-center gap-2">
          <span className="text-sm">⏱️</span>
          <span>{formattedTime}</span>
        </div>
      </div>

      {/* Timer Status */}
      <div className="flex items-center gap-2">
        {isRunning && !isExpired && (
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Running</span>
          </div>
        )}
        
        {isExpired && (
          <div className="flex items-center gap-1 text-sm text-red-600 font-medium">
            <span>⏰</span>
            <span>Time's Up!</span>
          </div>
        )}

        {!isRunning && !isActive && !isExpired && timeLeft < initialTime && (
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
            <span>Paused</span>
          </div>
        )}
      </div>

      {/* Reset Button */}
      <button
        onClick={handleReset}
        className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded-md transition-colors"
        title="Reset Timer"
      >
        🔄
      </button>
    </div>
  )
}