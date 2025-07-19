# Chess AI - Play Against the Computer

![Chess AI Game Preview](https://imgix.cosmicjs.com/b67de7d0-c810-11ed-b01d-23d7b265c299-chess-hero.jpg?w=1200&h=300&fit=crop&auto=format,compress)

A modern chess game built with Next.js where you can play against an intelligent AI opponent powered by Cosmic AI. Features a fully interactive chess board with complete rule validation, move history, and strategic AI gameplay.

## ✨ Features

- 🎮 **Interactive Chess Board** - Drag and drop pieces with smooth animations
- 🤖 **AI Opponent** - Intelligent computer player using Cosmic AI
- ✅ **Complete Rule Validation** - All chess rules properly enforced
- 📝 **Move History** - Track game progress with algebraic notation
- 🎯 **Position Highlights** - Visual feedback for valid moves and threats
- 📱 **Responsive Design** - Optimized for all device sizes
- 🔄 **Game State Management** - Save and resume games
- 🏆 **Win Detection** - Automatic checkmate and stalemate detection

## Clone this Bucket and Code Repository

Want to create your own version of this project with all the content and structure? Clone this Cosmic bucket and code repository to get started instantly:

[![Clone this Bucket and Code Repository](https://img.shields.io/badge/Clone%20this%20Bucket-29abe2?style=for-the-badge&logo=cosmic&logoColor=white)](http://localhost:3040/projects/new?clone_bucket=687bce1d54968488c3019092&clone_repository=687bd91d45d54201eeac5ced)

## Prompts

This application was built using the following prompts to generate the content structure and code:

### Content Model Prompt

> No content model prompt provided - app built from existing content structure

### Code Generation Prompt

> Build a Next.js website where you can play chess against a computer (use the Cosmic AI)

The app has been tailored to work with your existing Cosmic content structure and includes all the features requested above.

## 🛠 Technologies Used

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Cosmic AI** - Intelligent game opponent
- **React Hooks** - State management
- **Chess.js** - Chess game logic and validation

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ or Bun
- A Cosmic account and bucket

### Installation

1. Clone this repository
2. Install dependencies:
   ```bash
   bun install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```

4. Add your Cosmic credentials to `.env.local`:
   ```
   COSMIC_BUCKET_SLUG=your-bucket-slug
   COSMIC_READ_KEY=your-read-key
   COSMIC_WRITE_KEY=your-write-key
   ```

5. Run the development server:
   ```bash
   bun dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## 🎮 How to Play

1. **Start a Game** - Click "New Game" to begin playing as white pieces
2. **Make Moves** - Drag and drop pieces to make your moves
3. **AI Response** - The computer will automatically respond using Cosmic AI
4. **Game History** - View all moves in standard algebraic notation
5. **Win Conditions** - Game automatically detects checkmate, stalemate, and draws

## 🤖 Cosmic SDK Examples

### AI Move Generation

```typescript
import { cosmic } from '@/lib/cosmic'

// Generate AI move using Cosmic AI
const aiResponse = await cosmic.ai.generateText({
  prompt: `Analyze this chess position in FEN notation: ${fenString}
  Current game moves: ${gameHistory}
  Suggest the best move for ${currentPlayer} and explain the strategy.
  Respond with just the move in algebraic notation (e.g., "e4" or "Nf3").`,
  max_tokens: 100,
});
```

### Position Analysis

```typescript
// Get strategic analysis of current position
const analysisResponse = await cosmic.ai.generateText({
  prompt: `Analyze this chess position: ${fenString}
  Provide a brief strategic assessment including:
  - Material advantage
  - Position strength
  - Tactical opportunities
  Keep response under 200 characters.`,
  max_tokens: 200,
});
```

## 🎯 Cosmic CMS Integration

This chess application demonstrates several key integration patterns:

- **AI-Powered Gameplay** - Uses Cosmic AI to generate intelligent moves
- **Position Analysis** - AI evaluates chess positions for strategic insights  
- **Game Storage** - Optional game state persistence through Cosmic objects
- **Move Validation** - Client-side chess logic with AI move suggestions

The AI opponent analyzes the current board position, game history, and chess principles to make strategic moves that provide an engaging challenge for players of all skill levels.

## 🚀 Deployment Options

### Vercel (Recommended)
1. Connect your repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Netlify
1. Connect repository to Netlify
2. Set build command: `bun run build`
3. Set publish directory: `.next`
4. Add environment variables in Netlify dashboard

### Environment Variables for Production
Set these in your hosting platform:
- `COSMIC_BUCKET_SLUG`
- `COSMIC_READ_KEY` 
- `COSMIC_WRITE_KEY`

<!-- README_END -->