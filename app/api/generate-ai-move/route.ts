import { NextRequest, NextResponse } from 'next/server'
import { generateAIMove } from '@/lib/cosmic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { fenString, gameHistory, currentPlayer } = body

    // Validate required parameters
    if (!fenString || !currentPlayer) {
      return NextResponse.json(
        { error: 'Missing required parameters: fenString and currentPlayer' },
        { status: 400 }
      )
    }

    // Validate currentPlayer is either 'white' or 'black'
    if (currentPlayer !== 'white' && currentPlayer !== 'black') {
      return NextResponse.json(
        { error: 'currentPlayer must be either "white" or "black"' },
        { status: 400 }
      )
    }

    // Generate AI move using Cosmic SDK
    const aiMove = await generateAIMove(
      fenString,
      gameHistory || [],
      currentPlayer
    )

    if (!aiMove) {
      return NextResponse.json(
        { error: 'Failed to generate AI move' },
        { status: 500 }
      )
    }

    return NextResponse.json({ move: aiMove })
  } catch (error) {
    console.error('Error in generate-ai-move API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}