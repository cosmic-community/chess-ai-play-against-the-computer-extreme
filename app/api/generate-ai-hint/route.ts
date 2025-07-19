import { NextRequest, NextResponse } from 'next/server'
import { generateAIMove } from '@/lib/cosmic'

// Chess piece types and colors
type PieceType = 'king' | 'queen' | 'rook' | 'bishop' | 'knight' | 'pawn'
type PieceColor = 'white' | 'black'

interface ChessPiece {
  type: PieceType
  color: PieceColor
  hasMoved?: boolean
}

interface Position {
  row: number
  col: number
}

interface Move {
  from: Position
  to: Position
  piece: ChessPiece
  capturedPiece?: ChessPiece
}

// Chess piece values for evaluation
const pieceValues: Record<PieceType, number> = {
  pawn: 1,
  knight: 3,
  bishop: 3,
  rook: 5,
  queen: 9,
  king: 100
}

// Position square names for easy reference
const getSquareName = (pos: Position): string => {
  return String.fromCharCode(97 + pos.col) + (8 - pos.row)
}

// Parse FEN string to get board state
const parseFEN = (fen: string): (ChessPiece | null)[][] => {
  const board: (ChessPiece | null)[][] = Array(8).fill(null).map(() => Array(8).fill(null))
  const boardPart = fen.split(' ')[0]
  const rows = boardPart.split('/')
  
  for (let row = 0; row < 8; row++) {
    let col = 0
    for (const char of rows[row]) {
      if (char >= '1' && char <= '8') {
        col += parseInt(char)
      } else {
        const isWhite = char === char.toUpperCase()
        const pieceType = char.toLowerCase()
        let type: PieceType
        
        switch (pieceType) {
          case 'p': type = 'pawn'; break
          case 'r': type = 'rook'; break
          case 'n': type = 'knight'; break
          case 'b': type = 'bishop'; break
          case 'q': type = 'queen'; break
          case 'k': type = 'king'; break
          default: continue
        }
        
        board[row][col] = {
          type,
          color: isWhite ? 'white' : 'black'
        }
        col++
      }
    }
  }
  
  return board
}

// Check if position is valid
const isValidPosition = (pos: Position): boolean => {
  return pos.row >= 0 && pos.row < 8 && pos.col >= 0 && pos.col < 8
}

// Get piece at position
const getBoardPiece = (board: (ChessPiece | null)[][], pos: Position): ChessPiece | null => {
  if (!isValidPosition(pos)) return null
  return board[pos.row]?.[pos.col] ?? null
}

// Find king position
const findKing = (board: (ChessPiece | null)[][], color: PieceColor): Position | null => {
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = getBoardPiece(board, { row, col })
      if (piece && piece.type === 'king' && piece.color === color) {
        return { row, col }
      }
    }
  }
  return null
}

// Check if square is under attack
const isSquareUnderAttack = (board: (ChessPiece | null)[][], pos: Position, byColor: PieceColor): boolean => {
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = getBoardPiece(board, { row, col })
      if (piece && piece.color === byColor) {
        const moves = getPossibleMovesRaw(board, { row, col })
        if (moves.some(move => move.row === pos.row && move.col === pos.col)) {
          return true
        }
      }
    }
  }
  return false
}

// Check if king is in check
const isKingInCheck = (board: (ChessPiece | null)[][], color: PieceColor): boolean => {
  const kingPos = findKing(board, color)
  if (!kingPos) return false
  
  const opponentColor = color === 'white' ? 'black' : 'white'
  return isSquareUnderAttack(board, kingPos, opponentColor)
}

// Get raw possible moves (without check validation)
const getPossibleMovesRaw = (board: (ChessPiece | null)[][], from: Position): Position[] => {
  const piece = getBoardPiece(board, from)
  if (!piece) return []

  const moves: Position[] = []
  const { type, color } = piece

  switch (type) {
    case 'pawn':
      const direction = color === 'white' ? -1 : 1
      const startRow = color === 'white' ? 6 : 1
      
      // Move forward one square
      const oneSquareAhead = { row: from.row + direction, col: from.col }
      if (isValidPosition(oneSquareAhead) && !getBoardPiece(board, oneSquareAhead)) {
        moves.push(oneSquareAhead)
        
        // Move forward two squares from starting position
        const twoSquaresAhead = { row: from.row + 2 * direction, col: from.col }
        if (from.row === startRow && 
            isValidPosition(twoSquaresAhead) && 
            !getBoardPiece(board, twoSquaresAhead)) {
          moves.push(twoSquaresAhead)
        }
      }
      
      // Capture diagonally
      for (const colOffset of [-1, 1]) {
        const capturePos = { row: from.row + direction, col: from.col + colOffset }
        if (isValidPosition(capturePos)) {
          const target = getBoardPiece(board, capturePos)
          if (target && target.color !== color) {
            moves.push(capturePos)
          }
        }
      }
      break

    case 'rook':
      // Horizontal and vertical moves
      const rookDirections: [number, number][] = [[0, 1], [0, -1], [1, 0], [-1, 0]]
      for (const [rowDir, colDir] of rookDirections) {
        for (let i = 1; i < 8; i++) {
          const newPos = { row: from.row + rowDir * i, col: from.col + colDir * i }
          if (!isValidPosition(newPos)) break
          
          const target = getBoardPiece(board, newPos)
          if (!target) {
            moves.push(newPos)
          } else {
            if (target.color !== color) moves.push(newPos)
            break
          }
        }
      }
      break

    case 'bishop':
      // Diagonal moves
      const bishopDirections: [number, number][] = [[1, 1], [1, -1], [-1, 1], [-1, -1]]
      for (const [rowDir, colDir] of bishopDirections) {
        for (let i = 1; i < 8; i++) {
          const newPos = { row: from.row + rowDir * i, col: from.col + colDir * i }
          if (!isValidPosition(newPos)) break
          
          const target = getBoardPiece(board, newPos)
          if (!target) {
            moves.push(newPos)
          } else {
            if (target.color !== color) moves.push(newPos)
            break
          }
        }
      }
      break

    case 'queen':
      // Combination of rook and bishop moves
      const queenDirections: [number, number][] = [[0, 1], [0, -1], [1, 0], [-1, 0], [1, 1], [1, -1], [-1, 1], [-1, -1]]
      for (const [rowDir, colDir] of queenDirections) {
        for (let i = 1; i < 8; i++) {
          const newPos = { row: from.row + rowDir * i, col: from.col + colDir * i }
          if (!isValidPosition(newPos)) break
          
          const target = getBoardPiece(board, newPos)
          if (!target) {
            moves.push(newPos)
          } else {
            if (target.color !== color) moves.push(newPos)
            break
          }
        }
      }
      break

    case 'king':
      // One square in any direction
      const kingDirections: [number, number][] = [[0, 1], [0, -1], [1, 0], [-1, 0], [1, 1], [1, -1], [-1, 1], [-1, -1]]
      for (const [rowDir, colDir] of kingDirections) {
        const newPos = { row: from.row + rowDir, col: from.col + colDir }
        if (isValidPosition(newPos)) {
          const target = getBoardPiece(board, newPos)
          if (!target || target.color !== color) {
            moves.push(newPos)
          }
        }
      }
      break

    case 'knight':
      // L-shaped moves
      const knightMoves: [number, number][] = [
        [-2, -1], [-2, 1], [-1, -2], [-1, 2],
        [1, -2], [1, 2], [2, -1], [2, 1]
      ]
      for (const [rowOffset, colOffset] of knightMoves) {
        const newPos = { row: from.row + rowOffset, col: from.col + colOffset }
        if (isValidPosition(newPos)) {
          const target = getBoardPiece(board, newPos)
          if (!target || target.color !== color) {
            moves.push(newPos)
          }
        }
      }
      break
  }

  return moves
}

// Make a move on the board
const makeMove = (board: (ChessPiece | null)[][], from: Position, to: Position): (ChessPiece | null)[][] => {
  const newBoard = board.map(row => [...row])
  const piece = getBoardPiece(board, from)
  
  if (piece) {
    newBoard[to.row][to.col] = { ...piece, hasMoved: true }
    newBoard[from.row][from.col] = null
  }
  
  return newBoard
}

// Get legal moves (with check validation)
const getLegalMoves = (board: (ChessPiece | null)[][], from: Position): Position[] => {
  const piece = getBoardPiece(board, from)
  if (!piece) return []

  const rawMoves = getPossibleMovesRaw(board, from)
  const legalMoves: Position[] = []

  // Filter out moves that would leave the king in check
  for (const to of rawMoves) {
    const newBoard = makeMove(board, from, to)
    if (!isKingInCheck(newBoard, piece.color)) {
      legalMoves.push(to)
    }
  }

  return legalMoves
}

// Evaluate position
const evaluatePosition = (board: (ChessPiece | null)[][], color: PieceColor): number => {
  let score = 0
  let whitePieces = 0
  let blackPieces = 0
  
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = getBoardPiece(board, { row, col })
      if (piece) {
        const value = pieceValues[piece.type]
        if (piece.color === 'white') {
          whitePieces++
          score += piece.color === color ? value : -value
        } else {
          blackPieces++
          score += piece.color === color ? value : -value
        }
      }
    }
  }
  
  // Bonus for putting opponent in check
  const opponentColor = color === 'white' ? 'black' : 'white'
  if (isKingInCheck(board, opponentColor)) {
    score += 10
  }
  
  // Penalty for being in check
  if (isKingInCheck(board, color)) {
    score -= 10
  }
  
  return score
}

// Get all legal moves for a color
const getAllLegalMoves = (board: (ChessPiece | null)[][], color: PieceColor): Move[] => {
  const moves: Move[] = []
  
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = getBoardPiece(board, { row, col })
      if (piece && piece.color === color) {
        const from = { row, col }
        const legalMoves = getLegalMoves(board, from)
        
        for (const to of legalMoves) {
          const capturedPiece = getBoardPiece(board, to)
          moves.push({
            from,
            to,
            piece,
            capturedPiece: capturedPiece || undefined
          })
        }
      }
    }
  }
  
  return moves
}

// Generate comprehensive board analysis
const generateBoardAnalysis = (board: (ChessPiece | null)[][], currentPlayer: PieceColor): string => {
  const analysis: string[] = []
  
  // Basic board state
  analysis.push("=== COMPREHENSIVE CHESS POSITION ANALYSIS ===")
  analysis.push("")
  
  // Current board visualization
  analysis.push("Current Board Position:")
  analysis.push("   a b c d e f g h")
  for (let row = 0; row < 8; row++) {
    let rowStr = `${8 - row}  `
    for (let col = 0; col < 8; col++) {
      const piece = getBoardPiece(board, { row, col })
      if (piece) {
        const pieceChar = piece.type === 'knight' ? 'N' : piece.type[0].toUpperCase()
        rowStr += piece.color === 'white' ? pieceChar : pieceChar.toLowerCase()
      } else {
        rowStr += '.'
      }
      rowStr += ' '
    }
    rowStr += ` ${8 - row}`
    analysis.push(rowStr)
  }
  analysis.push("   a b c d e f g h")
  analysis.push("")
  
  // Piece count and material advantage
  let whitePoints = 0
  let blackPoints = 0
  const whitePieces: { [key in PieceType]?: number } = {}
  const blackPieces: { [key in PieceType]?: number } = {}
  
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = getBoardPiece(board, { row, col })
      if (piece) {
        if (piece.color === 'white') {
          whitePoints += pieceValues[piece.type]
          whitePieces[piece.type] = (whitePieces[piece.type] || 0) + 1
        } else {
          blackPoints += pieceValues[piece.type]
          blackPieces[piece.type] = (blackPieces[piece.type] || 0) + 1
        }
      }
    }
  }
  
  analysis.push("Material Count:")
  analysis.push(`White: ${whitePoints} points - ${Object.entries(whitePieces).map(([type, count]) => `${count} ${type}${count! > 1 ? 's' : ''}`).join(', ')}`)
  analysis.push(`Black: ${blackPoints} points - ${Object.entries(blackPieces).map(([type, count]) => `${count} ${type}${count! > 1 ? 's' : ''}`).join(', ')}`)
  analysis.push(`Material advantage: ${whitePoints > blackPoints ? 'White' : blackPoints > whitePoints ? 'Black' : 'Even'} (${Math.abs(whitePoints - blackPoints)} points)`)
  analysis.push("")
  
  // Check status
  const whiteInCheck = isKingInCheck(board, 'white')
  const blackInCheck = isKingInCheck(board, 'black')
  if (whiteInCheck || blackInCheck) {
    analysis.push(`CHECK STATUS: ${whiteInCheck ? 'White' : 'Black'} king is in check!`)
    analysis.push("")
  }
  
  // Current player's legal moves
  const legalMoves = getAllLegalMoves(board, currentPlayer)
  analysis.push(`${currentPlayer.toUpperCase()} TO MOVE - ${legalMoves.length} legal moves available:`)
  
  // Categorize moves
  const captures: Move[] = []
  const checks: Move[] = []
  const regularMoves: Move[] = []
  
  for (const move of legalMoves) {
    if (move.capturedPiece) {
      captures.push(move)
    }
    
    // Check if move gives check
    const newBoard = makeMove(board, move.from, move.to)
    const opponentColor = currentPlayer === 'white' ? 'black' : 'white'
    if (isKingInCheck(newBoard, opponentColor)) {
      checks.push(move)
    }
    
    if (!move.capturedPiece) {
      regularMoves.push(move)
    }
  }
  
  // Show capturing moves
  if (captures.length > 0) {
    analysis.push("")
    analysis.push("CAPTURING MOVES:")
    for (const move of captures) {
      const fromSquare = getSquareName(move.from)
      const toSquare = getSquareName(move.to)
      const pieceSymbol = move.piece.type === 'knight' ? 'N' : move.piece.type[0].toUpperCase()
      const capturedSymbol = move.capturedPiece!.type === 'knight' ? 'N' : move.capturedPiece!.type[0].toUpperCase()
      analysis.push(`  ${pieceSymbol}${fromSquare}x${toSquare} (captures ${capturedSymbol}, +${pieceValues[move.capturedPiece!.type]} points)`)
    }
  }
  
  // Show checking moves
  if (checks.length > 0) {
    analysis.push("")
    analysis.push("MOVES THAT GIVE CHECK:")
    for (const move of checks) {
      const fromSquare = getSquareName(move.from)
      const toSquare = getSquareName(move.to)
      const pieceSymbol = move.piece.type === 'knight' ? 'N' : move.piece.type[0].toUpperCase()
      analysis.push(`  ${pieceSymbol}${fromSquare}-${toSquare}+`)
    }
  }
  
  // Show piece development and activity
  analysis.push("")
  analysis.push("PIECE ACTIVITY ANALYSIS:")
  const pieceActivity: { [square: string]: number } = {}
  
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = getBoardPiece(board, { row, col })
      if (piece && piece.color === currentPlayer) {
        const from = { row, col }
        const moves = getLegalMoves(board, from)
        const square = getSquareName(from)
        pieceActivity[square] = moves.length
        
        if (moves.length > 0) {
          const pieceSymbol = piece.type === 'knight' ? 'N' : piece.type[0].toUpperCase()
          analysis.push(`  ${pieceSymbol}${square}: ${moves.length} moves (${moves.map(m => getSquareName(m)).join(', ')})`)
        }
      }
    }
  }
  
  // Strategic recommendations
  analysis.push("")
  analysis.push("STRATEGIC ANALYSIS:")
  
  // Look for threats and tactics
  if (captures.length > 0) {
    const bestCapture = captures.reduce((best, current) => 
      pieceValues[current.capturedPiece!.type] > pieceValues[best.capturedPiece!.type] ? current : best
    )
    const capturedValue = pieceValues[bestCapture.capturedPiece!.type]
    analysis.push(`• High-value capture available: ${getSquareName(bestCapture.from)}x${getSquareName(bestCapture.to)} (wins ${capturedValue} points)`)
  }
  
  if (checks.length > 0) {
    analysis.push(`• ${checks.length} moves give check - consider forcing moves`)
  }
  
  // King safety
  const kingPos = findKing(board, currentPlayer)
  if (kingPos) {
    const kingSquare = getSquareName(kingPos)
    const opponentColor = currentPlayer === 'white' ? 'black' : 'white'
    const kingUnderAttack = isSquareUnderAttack(board, kingPos, opponentColor)
    if (kingUnderAttack && !whiteInCheck && !blackInCheck) {
      analysis.push(`• King on ${kingSquare} is under potential threat - consider safety`)
    }
  }
  
  // Center control
  const centerSquares = [
    { row: 3, col: 3 }, { row: 3, col: 4 }, 
    { row: 4, col: 3 }, { row: 4, col: 4 }
  ]
  let controlledCenterSquares = 0
  for (const square of centerSquares) {
    if (isSquareUnderAttack(board, square, currentPlayer)) {
      controlledCenterSquares++
    }
  }
  analysis.push(`• Center control: ${controlledCenterSquares}/4 central squares controlled`)
  
  // Position evaluation
  const positionScore = evaluatePosition(board, currentPlayer)
  analysis.push(`• Position evaluation: ${positionScore > 0 ? '+' : ''}${positionScore} (${positionScore > 0 ? 'advantage' : positionScore < 0 ? 'disadvantage' : 'balanced'})`)
  
  analysis.push("")
  analysis.push("=== REQUEST: Analyze this position and suggest the BEST move for " + currentPlayer.toUpperCase() + " ===")
  
  return analysis.join('\n')
}

export async function POST(request: NextRequest) {
  const logs: string[] = []
  
  try {
    logs.push('Starting enhanced AI hint generation...')
    
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
    
    // Parse the board and generate comprehensive analysis
    const board = parseFEN(fenString)
    const boardAnalysis = generateBoardAnalysis(board, currentPlayer)
    
    logs.push('Generated comprehensive board analysis')
    logs.push('Calling Cosmic AI with enhanced context...')

    // Generate AI hint using enhanced analysis
    const aiHint = await generateAIMove(
      boardAnalysis, // Send full analysis instead of just FEN
      gameHistory || [],
      currentPlayer
    )

    if (!aiHint) {
      logs.push('ERROR: Cosmic AI failed to generate hint')
      return NextResponse.json(
        { 
          error: 'Failed to generate AI hint',
          logs
        },
        { status: 500 }
      )
    }

    logs.push(`AI hint generated successfully: ${aiHint}`)
    logs.push('Enhanced context provided comprehensive board analysis')
    logs.push('Returning hint response to client')

    return NextResponse.json({ 
      move: aiHint,
      logs,
      boardAnalysis // Optionally return analysis for debugging
    })
  } catch (error) {
    logs.push(`CRITICAL ERROR: ${error}`)
    console.error('Error in enhanced generate-ai-hint API:', error)
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        logs
      },
      { status: 500 }
    )
  }
}