'use client'

export default function Footer() {
  const COSMIC_BUCKET_SLUG = process.env.NEXT_PUBLIC_COSMIC_BUCKET_SLUG || 'chess-ai'

  const handleMouseOver = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const target = e.currentTarget
    target.style.backgroundColor = '#1a2326'
  }

  const handleMouseOut = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const target = e.currentTarget
    target.style.backgroundColor = '#11171A'
  }

  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="text-center">
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-2">Chess AI</h3>
            <p className="text-gray-400 max-w-md mx-auto">
              An intelligent chess game powered by Cosmic AI. Challenge yourself against 
              a computer opponent that analyzes positions and makes strategic moves.
            </p>
          </div>

          <div className="mb-6">
            <div className="flex justify-center items-center space-x-6 text-sm text-gray-400">
              <span>Strategic AI Gameplay</span>
              <span>•</span>
              <span>Complete Rule Validation</span>
              <span>•</span>
              <span>Move History</span>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-6">
            <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6">
              <p className="text-sm text-gray-400">
                © 2024 Chess AI. Experience intelligent gameplay.
              </p>
              
              <a
                href={`https://www.cosmicjs.com?utm_source=bucket_${COSMIC_BUCKET_SLUG}&utm_medium=referral&utm_campaign=app_footer&utm_content=built_with_cosmic`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  backgroundColor: '#11171A',
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: 500,
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'background-color 0.2s ease'
                }}
                onMouseOver={handleMouseOver}
                onMouseOut={handleMouseOut}
              >
                <img 
                  src="https://cdn.cosmicjs.com/b67de7d0-c810-11ed-b01d-23d7b265c299-logo508x500.svg" 
                  alt="Cosmic Logo" 
                  style={{
                    width: '20px',
                    height: '20px',
                  }}
                />
                Built with Cosmic
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}