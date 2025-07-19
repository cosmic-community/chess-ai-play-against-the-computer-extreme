'use client'

import { useState, useEffect, useCallback } from 'react'

// Chess piece types and colors
type PieceType = 'king' | 'queen' | 'rook' | 'bishop' | 'knight' | 'pawn'
type PieceColor = 'white' | 'black'

// Chess piece interface
interface ChessPiece {
  type: PieceType
  color: PieceColor
  hasMoved?: boolean
}

// Square position interface
interface Position {
  row: number
  col: number
}

// Move interface
interface Move {
  from: Position
  to: Position
  piece: ChessPiece
  capturedPiece?: ChessPiece
}

// Game state interface
interface GameState {
  board: (ChessPiece | null)[][]
  currentPlayer: PieceColor
  selectedSquare: Position | null
  possibleMoves: Position[]
  gameStatus: 'playing' | 'check' | 'checkmate' | 'stalemate' | 'draw'
  moves: Move[]
  isThinking: boolean
  winner: PieceColor | null
  kingInCheck: PieceColor | null
}

// Chess piece Unicode symbols
const pieceSymbols: Record<PieceColor, Record<PieceType, string>> = {
  white: {
    king: '♔',
    queen: '♕',
    rook: '♖',
    bishop: '♗',
    knight: '♘',
    pawn: '♙'
  },
  black: {
    king: '♚',
    queen: '♛',
    rook: '♜',
    bishop: '♝',
    knight: '♞',
    pawn: '♟'
  }
}

// Initialize chess board with starting position
const initializeBoard = (): (ChessPiece | null)[][] => {
  const board: (ChessPiece | null)[][] = Array(8).fill(null).map(() => Array(8).fill(null))
  
  // Place pieces in starting positions
  const pieceOrder: PieceType[] = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook']
  
  // Place black pieces
  for (let col = 0; col < 8; col++) {
    board[0][col] = { type: pieceOrder[col], color: 'black' }
    board[1][col] = { type: 'pawn', color: 'black' }
  }
  
  // Place white pieces
  for (let col = 0; col < 8; col++) {
    board[6][col] = { type: 'pawn', color: 'white' }
    board[7][col] = { type: pieceOrder[col], color: 'white' }
  }
  
  return board
}

// Check if position is within board bounds
const isValidPosition = (pos: Position): boolean => {
  return pos.row >= 0 && pos.row < 8 && pos.col >= 0 && pos.col < 8
}

// Check if positions are equal
const positionsEqual = (pos1: Position, pos2: Position): boolean => {
  return pos1.row === pos2.row && pos1.col === pos2.col
}

// Safe board access helper
const getBoardPiece = (board: (ChessPiece | null)[][], pos: Position): ChessPiece | null => {
  if (!isValidPosition(pos)) return null
  return board[pos.row]?.[pos.col] ?? null
}

// Find king position for a given color
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

// Check if a square is under attack by the opponent
const isSquareUnderAttack = (board: (ChessPiece | null)[][], pos: Position, byColor: PieceColor): boolean => {
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = getBoardPiece(board, { row, col })
      if (piece && piece.color === byColor) {
        const moves = getPossibleMovesRaw(board, { row, col })
        if (moves.some(move => positionsEqual(move, pos))) {
          return true
        }
      }
    }
  }
  return false
}

// Check if the king is in check
const isKingInCheck = (board: (ChessPiece | null)[][], color: PieceColor): boolean => {
  const kingPos = findKing(board, color)
  if (!kingPos) return false
  
  const opponentColor = color === 'white' ? 'black' : 'white'
  return isSquareUnderAttack(board, kingPos, opponentColor)
}

// Get possible moves for a piece (without check validation)
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

// Get possible moves for a piece (with check validation)
const getPossibleMoves = (board: (ChessPiece | null)[][], from: Position): Position[] => {
  const piece = getBoardPiece(board, from)
  if (!piece) return []

  const rawMoves = getPossibleMovesRaw(board, from)
  const validMoves: Position[] = []

  // Filter out moves that would leave the king in check
  for (const to of rawMoves) {
    const newBoard = makeMove(board, from, to)
    if (!isKingInCheck(newBoard, piece.color)) {
      validMoves.push(to)
    }
  }

  return validMoves
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

// Get all possible moves for a color
const getAllPossibleMoves = (board: (ChessPiece | null)[][], color: PieceColor): Move[] => {
  const moves: Move[] = []
  
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = getBoardPiece(board, { row, col })
      if (piece && piece.color === color) {
        const from = { row, col }
        const possibleMoves = getPossibleMoves(board, from)
        
        for (const to of possibleMoves) {
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

// Check if the game is over and determine the result
const checkGameStatus = (board: (ChessPiece | null)[][], currentPlayer: PieceColor): {
  status: 'playing' | 'check' | 'checkmate' | 'stalemate'
  winner: PieceColor | null
  kingInCheck: PieceColor | null
} => {
  const isInCheck = isKingInCheck(board, currentPlayer)
  const possibleMoves = getAllPossibleMoves(board, currentPlayer)
  
  if (possibleMoves.length === 0) {
    if (isInCheck) {
      // Checkmate - opponent wins
      const winner = currentPlayer === 'white' ? 'black' : 'white'
      return { status: 'checkmate', winner, kingInCheck: currentPlayer }
    } else {
      // Stalemate - draw
      return { status: 'stalemate', winner: null, kingInCheck: null }
    }
  }
  
  if (isInCheck) {
    return { status: 'check', winner: null, kingInCheck: currentPlayer }
  }
  
  return { status: 'playing', winner: null, kingInCheck: null }
}

// Convert board to FEN notation (simplified)
const boardToFEN = (board: (ChessPiece | null)[][], currentPlayer: PieceColor): string => {
  let fen = ''
  
  for (let row = 0; row < 8; row++) {
    let emptyCount = 0
    
    for (let col = 0; col < 8; col++) {
      const piece = getBoardPiece(board, { row, col })
      
      if (!piece) {
        emptyCount++
      } else {
        if (emptyCount > 0) {
          fen += emptyCount.toString()
          emptyCount = 0
        }
        
        const pieceChar = piece.type === 'knight' ? 'n' : piece.type[0]
        fen += piece.color === 'white' ? pieceChar.toUpperCase() : pieceChar
      }
    }
    
    if (emptyCount > 0) {
      fen += emptyCount.toString()
    }
    
    if (row < 7) {
      fen += '/'
    }
  }
  
  // Add current player, castling, en passant, halfmove, fullmove
  fen += ` ${currentPlayer[0]} - - 0 1`
  
  return fen
}

// Convert moves to algebraic notation for game history
const moveToAlgebraic = (move: Move): string => {
  const fromSquare = String.fromCharCode(97 + move.from.col) + (8 - move.from.row)
  const toSquare = String.fromCharCode(97 + move.to.col) + (8 - move.to.row)
  
  let algebraic = ''
  
  // Piece notation (except pawns)
  if (move.piece.type !== 'pawn') {
    algebraic += move.piece.type === 'knight' ? 'N' : move.piece.type[0].toUpperCase()
  }
  
  // Capture notation
  if (move.capturedPiece) {
    if (move.piece.type === 'pawn') {
      algebraic += fromSquare[0] // pawn captures show the file
    }
    algebraic += 'x'
  }
  
  algebraic += toSquare
  
  return algebraic
}

// Simple AI evaluation function (fallback)
const evaluatePosition = (board: (ChessPiece | null)[][], color: PieceColor): number => {
  const pieceValues: Record<PieceType, number> = {
    pawn: 1,
    knight: 3,
    bishop: 3,
    rook: 5,
    queen: 9,
    king: 100
  }
  
  let score = 0
  
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = getBoardPiece(board, { row, col })
      if (piece) {
        const value = pieceValues[piece.type]
        if (piece.color === color) {
          score += value
        } else {
          score -= value
        }
      }
    }
  }
  
  // Bonus for putting opponent in check
  const opponentColor = color === 'white' ? 'black' : 'white'
  if (isKingInCheck(board, opponentColor)) {
    score += 5
  }
  
  return score
}

// Simple minimax AI (fallback)
const getBestMove = (board: (ChessPiece | null)[][], color: PieceColor): Move | null => {
  const moves = getAllPossibleMoves(board, color)
  if (moves.length === 0) return null
  
  let bestMove: Move | null = null
  let bestScore = -Infinity
  
  for (const move of moves) {
    const newBoard = makeMove(board, move.from, move.to)
    const score = evaluatePosition(newBoard, color)
    
    if (score > bestScore) {
      bestScore = score
      bestMove = move
    }
  }
  
  return bestMove
}

// Parse algebraic notation to move
const parseAlgebraicMove = (algebraic: string, board: (ChessPiece | null)[][], color: PieceColor): Move | null => {
  // This is a simplified parser - in a real implementation you'd want more robust parsing
  const moves = getAllPossibleMoves(board, color)
  
  // Try to find a move that matches the algebraic notation
  for (const move of moves) {
    const moveAlgebraic = moveToAlgebraic(move)
    if (moveAlgebraic === algebraic || moveAlgebraic.toLowerCase() === algebraic.toLowerCase()) {
      return move
    }
  }
  
  return null
}

export default function ChessGame() {
  const [gameState, setGameState] = useState<GameState>(() => ({
    board: initializeBoard(),
    currentPlayer: 'white',
    selectedSquare: null,
    possibleMoves: [],
    gameStatus: 'playing',
    moves: [],
    isThinking: false,
    winner: null,
    kingInCheck: null
  }))

  // Handle square click
  const handleSquareClick = useCallback((row: number, col: number) => {
    if (gameState.currentPlayer !== 'white' || gameState.isThinking || gameState.gameStatus === 'checkmate' || gameState.gameStatus === 'stalemate') return

    const clickedPos = { row, col }
    
    // If no square is selected, select this square if it has a white piece
    if (!gameState.selectedSquare) {
      const piece = getBoardPiece(gameState.board, clickedPos)
      if (piece && piece.color === 'white') {
        const moves = getPossibleMoves(gameState.board, clickedPos)
        setGameState(prev => ({
          ...prev,
          selectedSquare: clickedPos,
          possibleMoves: moves
        }))
      }
      return
    }

    // If same square is clicked, deselect
    if (positionsEqual(gameState.selectedSquare, clickedPos)) {
      setGameState(prev => ({
        ...prev,
        selectedSquare: null,
        possibleMoves: []
      }))
      return
    }

    // Check if this is a valid move
    const isValidMove = gameState.possibleMoves.some(move => 
      positionsEqual(move, clickedPos)
    )

    if (isValidMove && gameState.selectedSquare) {
      // Make the move
      const newBoard = makeMove(gameState.board, gameState.selectedSquare, clickedPos)
      const piece = getBoardPiece(gameState.board, gameState.selectedSquare)
      
      if (piece) {
        const capturedPiece = getBoardPiece(gameState.board, clickedPos)
        const move: Move = {
          from: gameState.selectedSquare,
          to: clickedPos,
          piece,
          capturedPiece: capturedPiece || undefined
        }

        // Check game status after the move
        const gameStatus = checkGameStatus(newBoard, 'black')

        setGameState(prev => ({
          ...prev,
          board: newBoard,
          currentPlayer: 'black',
          selectedSquare: null,
          possibleMoves: [],
          moves: [...prev.moves, move],
          isThinking: gameStatus.status !== 'checkmate' && gameStatus.status !== 'stalemate',
          gameStatus: gameStatus.status,
          winner: gameStatus.winner,
          kingInCheck: gameStatus.kingInCheck
        }))
      }
    } else {
      // Try to select a different piece
      const piece = getBoardPiece(gameState.board, clickedPos)
      if (piece && piece.color === 'white') {
        const moves = getPossibleMoves(gameState.board, clickedPos)
        setGameState(prev => ({
          ...prev,
          selectedSquare: clickedPos,
          possibleMoves: moves
        }))
      } else {
        setGameState(prev => ({
          ...prev,
          selectedSquare: null,
          possibleMoves: []
        }))
      }
    }
  }, [gameState])

  // AI move effect
  useEffect(() => {
    if (gameState.currentPlayer === 'black' && gameState.isThinking && gameState.gameStatus !== 'checkmate' && gameState.gameStatus !== 'stalemate') {
      const timer = setTimeout(async () => {
        try {
          // Generate FEN string and game history for AI
          const fenString = boardToFEN(gameState.board, 'black')
          const gameHistory = gameState.moves.map(moveToAlgebraic)
          
          // Call server-side API for AI move generation
          const response = await fetch('/api/generate-ai-move', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              fenString,
              gameHistory,
              currentPlayer: 'black'
            })
          })
          
          let bestMove: Move | null = null
          
          if (response.ok) {
            const data = await response.json()
            if (data.move) {
              // Try to parse the AI-suggested move
              bestMove = parseAlgebraicMove(data.move, gameState.board, 'black')
            }
          }
          
          // Fallback to local AI if server-side AI fails
          if (!bestMove) {
            console.log('Using fallback AI move generation')
            bestMove = getBestMove(gameState.board, 'black')
          }
          
          if (bestMove) {
            const newBoard = makeMove(gameState.board, bestMove.from, bestMove.to)
            const gameStatus = checkGameStatus(newBoard, 'white')
            
            setGameState(prev => ({
              ...prev,
              board: newBoard,
              currentPlayer: 'white',
              moves: [...prev.moves, bestMove],
              isThinking: false,
              gameStatus: gameStatus.status,
              winner: gameStatus.winner,
              kingInCheck: gameStatus.kingInCheck
            }))
          } else {
            // AI has no moves - this shouldn't happen if game status is correct
            setGameState(prev => ({
              ...prev,
              isThinking: false
            }))
          }
        } catch (error) {
          console.error('Error generating AI move:', error)
          // Fallback to local AI
          const fallbackMove = getBestMove(gameState.board, 'black')
          if (fallbackMove) {
            const newBoard = makeMove(gameState.board, fallbackMove.from, fallbackMove.to)
            const gameStatus = checkGameStatus(newBoard, 'white')
            
            setGameState(prev => ({
              ...prev,
              board: newBoard,
              currentPlayer: 'white',
              moves: [...prev.moves, fallbackMove],
              isThinking: false,
              gameStatus: gameStatus.status,
              winner: gameStatus.winner,
              kingInCheck: gameStatus.kingInCheck
            }))
          } else {
            setGameState(prev => ({
              ...prev,
              isThinking: false
            }))
          }
        }
      }, 1000) // 1 second delay for AI thinking

      return () => clearTimeout(timer)
    }
  }, [gameState.currentPlayer, gameState.isThinking, gameState.board, gameState.gameStatus, gameState.moves])

  // Reset game
  const resetGame = () => {
    setGameState({
      board: initializeBoard(),
      currentPlayer: 'white',
      selectedSquare: null,
      possibleMoves: [],
      gameStatus: 'playing',
      moves: [],
      isThinking: false,
      winner: null,
      kingInCheck: null
    })
  }

  // Render square
  const renderSquare = (row: number, col: number) => {
    const piece = getBoardPiece(gameState.board, { row, col })
    const isLight = (row + col) % 2 === 0
    const isSelected = gameState.selectedSquare && positionsEqual(gameState.selectedSquare, { row, col })
    const isPossibleMove = gameState.possibleMoves.some(move => positionsEqual(move, { row, col }))
    const isKingInCheck = piece && piece.type === 'king' && gameState.kingInCheck === piece.color
    
    let squareClasses = `
      w-16 h-16 flex items-center justify-center cursor-pointer text-5xl font-bold
      transition-all duration-200 hover:brightness-110
      ${isLight ? 'bg-amber-100' : 'bg-amber-800'}
      ${isSelected ? 'ring-4 ring-blue-500' : ''}
      ${isPossibleMove ? 'ring-2 ring-green-400' : ''}
      ${isKingInCheck ? 'bg-red-400' : ''}
    `

    return (
      <div
        key={`${row}-${col}`}
        className={squareClasses}
        onClick={() => handleSquareClick(row, col)}
      >
        {piece && (
          <span 
            className={
              piece.color === 'white' 
                ? 'text-white' 
                : 'text-black'
            }
            style={
              piece.color === 'white' 
                ? { 
                    textShadow: '2px 2px 0px #000, -2px -2px 0px #000, 2px -2px 0px #000, -2px 2px 0px #000, 1px 1px 0px #000, -1px -1px 0px #000, 1px -1px 0px #000, -1px 1px 0px #000',
                    WebkitTextStroke: '1px #000'
                  }
                : {}
            }
          >
            {pieceSymbols[piece.color][piece.type]}
          </span>
        )}
        {isPossibleMove && !piece && (
          <div className="w-4 h-4 bg-green-400 rounded-full opacity-70"></div>
        )}
      </div>
    )
  }

  // Get game status message
  const getGameStatusMessage = () => {
    switch (gameState.gameStatus) {
      case 'checkmate':
        if (gameState.winner === 'white') {
          return { text: '🎉 You Win! Checkmate!', color: 'text-green-600' }
        } else {
          return { text: '💀 AI Wins! Checkmate!', color: 'text-red-600' }
        }
      case 'stalemate':
        return { text: '🤝 Draw! Stalemate!', color: 'text-yellow-600' }
      case 'check':
        if (gameState.kingInCheck === 'white') {
          return { text: '⚠️ Your King is in Check!', color: 'text-red-600' }
        } else {
          return { text: '⚡ AI King is in Check!', color: 'text-blue-600' }
        }
      default:
        if (gameState.isThinking) {
          return { text: '🤖 AI is thinking...', color: 'text-blue-600' }
        } else {
          return { 
            text: gameState.currentPlayer === 'white' ? '⚪ Your turn' : '⚫ AI turn', 
            color: gameState.currentPlayer === 'white' ? 'text-gray-800' : 'text-gray-600' 
          }
        }
    }
  }

  const statusMessage = getGameStatusMessage()

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-xl p-6">
        {/* Game Status */}
        <div className="flex justify-between items-center mb-6">
          <div className={`text-lg font-semibold ${statusMessage.color}`}>
            <span className="flex items-center">
              {statusMessage.text}
              {gameState.isThinking && <div className="ml-2 animate-pulse">⚡</div>}
            </span>
          </div>
          
          <button
            onClick={resetGame}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            New Game
          </button>
        </div>

        {/* Game Over Notification */}
        {(gameState.gameStatus === 'checkmate' || gameState.gameStatus === 'stalemate') && (
          <div className="mb-6 p-4 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200">
            <div className="text-center">
              <div className="text-2xl mb-2">
                {gameState.gameStatus === 'checkmate' ? 
                  (gameState.winner === 'white' ? '🏆' : '👑') : 
                  '🤝'
                }
              </div>
              <div className={`text-xl font-bold mb-2 ${statusMessage.color}`}>
                Game Over!
              </div>
              <div className="text-gray-600">
                {gameState.gameStatus === 'checkmate' && gameState.winner === 'white' && 
                  "Congratulations! You defeated the AI!"
                }
                {gameState.gameStatus === 'checkmate' && gameState.winner === 'black' && 
                  "The AI has defeated you. Better luck next time!"
                }
                {gameState.gameStatus === 'stalemate' && 
                  "The game ends in a draw. No legal moves available!"
                }
              </div>
              <button
                onClick={resetGame}
                className="mt-3 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
              >
                Play Again
              </button>
            </div>
          </div>
        )}

        {/* Chess Board */}
        <div className="flex justify-center mb-6">
          <div className="border-4 border-amber-900 rounded-lg overflow-hidden">
            <div className="grid grid-cols-8 gap-0">
              {Array.from({ length: 8 }, (_, row) =>
                Array.from({ length: 8 }, (_, col) => renderSquare(row, col))
              )}
            </div>
          </div>
        </div>

        {/* Move History */}
        {gameState.moves.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-3">Move History</h3>
            <div className="bg-gray-50 rounded-lg p-4 max-h-32 overflow-y-auto">
              <div className="text-sm space-y-1">
                {gameState.moves.map((move, index) => (
                  <div key={index} className="flex items-center">
                    <span className="w-8 text-gray-500">{Math.floor(index / 2) + 1}.</span>
                    <span className="font-mono">
                      {pieceSymbols[move.piece.color][move.piece.type]}
                      {String.fromCharCode(97 + move.from.col)}{8 - move.from.row}
                      {move.capturedPiece ? 'x' : '-'}
                      {String.fromCharCode(97 + move.to.col)}{8 - move.to.row}
                      {move.capturedPiece && ` (${pieceSymbols[move.capturedPiece.color][move.capturedPiece.type]})`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-6 text-sm text-gray-600">
          <p><strong>How to play:</strong></p>
          <ul className="list-disc list-inside space-y-1 mt-2">
            <li>Click on your pieces (white) to select them</li>
            <li>Green dots show possible moves</li>
            <li>Click on a highlighted square to move</li>
            <li>Red squares indicate a king in check</li>
            <li>The AI will automatically respond with black pieces</li>
            <li>Win by checkmating the AI's king!</li>
          </ul>
        </div>
      </div>
    </div>
  )
}