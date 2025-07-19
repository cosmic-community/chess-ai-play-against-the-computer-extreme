import { NextRequest, NextResponse } from 'next/server'
import { generateAIMove } from '@/lib/cosmic'

export async function POST(request: NextRequest) {
  const logs: string[] = []
  
  try {
    logs.push('Starting AI move generation...')
    
    const body = await request.json()
    const { fenString, gameHistory, currentPlayer } = body
    
    logs.push(`Received parameters: FEN=${fenString}, Player=${currentPlayer}, History length=${gameHistory?.length || 0}`)

    // Validate required parameters
    if (!fenString || !currentPlayer) {
      logs.push('ERROR: Missing required parameters')
      return NextResponse.json(
        { 
          error: 'Missing required parameters: fenString and currentPlayer',
          logs
        },
        { status: 400 }
      )
    }

    // Validate currentPlayer is either 'white' or 'black'
    if (currentPlayer !== 'white' && currentPlayer !== 'black') {
      logs.push('ERROR: Invalid currentPlayer value')
      return NextResponse.json(
        { 
          error: 'currentPlayer must be either "white" or "black"',
          logs
        },
        { status: 400 }
      )
    }

    logs.push('Parameters validated successfully')
    logs.push('Calling Cosmic AI move generation...')

    // Generate AI move using Cosmic SDK
    const aiMove = await generateAIMove(
      fenString,
      gameHistory || [],
      currentPlayer
    )

    if (!aiMove) {
      logs.push('ERROR: Cosmic AI failed to generate move')
      return NextResponse.json(
        { 
          error: 'Failed to generate AI move',
          logs
        },
        { status: 500 }
      )
    }

    logs.push(`AI move generated successfully: ${aiMove}`)
    logs.push('Returning response to client')

    return NextResponse.json({ 
      move: aiMove,
      logs
    })
  } catch (error) {
    logs.push(`CRITICAL ERROR: ${error}`)
    console.error('Error in generate-ai-move API:', error)
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        logs
      },
      { status: 500 }
    )
  }
}