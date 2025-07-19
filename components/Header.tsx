import { Crown, Cpu } from 'lucide-react'

export default function Header() {
  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-center space-x-3">
          <div className="flex items-center space-x-2">
            <Crown className="h-8 w-8 text-amber-600" />
            <span className="text-2xl font-bold text-gray-900">Chess AI</span>
            <Cpu className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        
        <div className="text-center mt-2">
          <p className="text-sm text-gray-600">
            Powered by <span className="font-semibold text-blue-600">Cosmic AI</span>
          </p>
        </div>
      </div>
    </header>
  )
}