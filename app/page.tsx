import ChessGame from '@/components/ChessGame'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Chess AI Challenge
          </h1>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto">
            Test your chess skills against an intelligent AI opponent powered by Cosmic AI. 
            Make your moves and watch as the computer analyzes positions to provide challenging gameplay.
          </p>
        </div>

        <ChessGame />
      </div>

      <Footer />
    </main>
  )
}