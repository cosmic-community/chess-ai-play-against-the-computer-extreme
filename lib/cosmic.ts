import { createBucketClient } from '@cosmicjs/sdk'

export const cosmic = createBucketClient({
  bucketSlug: process.env.COSMIC_BUCKET_SLUG as string,
  readKey: process.env.COSMIC_READ_KEY as string,
  writeKey: process.env.COSMIC_WRITE_KEY as string,
  apiEnvironment: "staging"
})

export async function generateAIMove(fenString: string, gameHistory: string[], currentPlayer: 'white' | 'black') {
  try {
    const prompt = `You are a chess engine. Analyze this chess position in FEN notation: ${fenString}
    
Game history: ${gameHistory.join(', ')}
Current player: ${currentPlayer}

Analyze the position and suggest the best move for ${currentPlayer}. Consider:
- Material advantage
- Piece development  
- King safety
- Tactical opportunities
- Positional advantages

Respond with ONLY the move in standard algebraic notation (e.g., "e4", "Nf3", "O-O", "Qxd5+").
Do not include explanations, just the move.`

    const response = await cosmic.ai.generateText({
      prompt,
      max_tokens: 50,
    })

    return response.text.trim()
  } catch (error) {
    console.error('Error generating AI move:', error)
    return null
  }
}

export async function getPositionAnalysis(fenString: string, gameHistory: string[]) {
  try {
    const prompt = `Analyze this chess position: ${fenString}
    
Game moves so far: ${gameHistory.join(', ')}

Provide a brief strategic assessment (max 150 characters) including:
- Who has the advantage and why
- Key tactical or positional themes
- Overall evaluation

Keep it concise and informative.`

    const response = await cosmic.ai.generateText({
      prompt,
      max_tokens: 150,
    })

    return response.text.trim()
  } catch (error) {
    console.error('Error analyzing position:', error)
    return 'Position analysis unavailable'
  }
}