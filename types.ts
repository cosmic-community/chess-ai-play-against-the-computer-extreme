import { Square } from 'chess.js'

export type GameStatus = 'playing' | 'check' | 'checkmate' | 'stalemate' | 'draw'

export type PlayerColor = 'white' | 'black'

export interface GameState {
  fen: string
  pgn: string
  turn: PlayerColor
  status: GameStatus
  history: string[]
  inCheck: boolean
  isGameOver: boolean
  winner?: PlayerColor | 'draw'
}

export interface MoveData {
  from: Square
  to: Square
  promotion?: string
}

export interface ChessGameProps {
  onGameEnd?: (winner: PlayerColor | 'draw') => void
  playerColor?: PlayerColor
  aiEnabled?: boolean
}

export interface GameInfoProps {
  gameState: GameState
  currentAnalysis?: string
  isAIThinking: boolean
}

export interface MoveHistoryProps {
  moves: string[]
  currentMoveIndex?: number
}

export interface GameControlsProps {
  onNewGame: () => void
  onUndo?: () => void
  gameInProgress: boolean
  isAIThinking: boolean
}

// Utility types
export type ChessSquare = Square
export type ChessPiece = 'p' | 'n' | 'b' | 'r' | 'q' | 'k' | 'P' | 'N' | 'B' | 'R' | 'Q' | 'K'

// Game results for potential storage in Cosmic
export interface GameResult {
  id?: string
  pgn: string
  result: 'white' | 'black' | 'draw'
  moves: string[]
  duration?: number
  date: string
  playerColor: PlayerColor
  finalFen: string
}