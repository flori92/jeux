import { configureStore } from '@reduxjs/toolkit';
import gameReducer, { startGame, rollDice, selectPiece, movePiece, endTurn } from '../gameSlice';
import type { LudoPlayer, LudoPiece, PlayerColor } from '../../types/game.types';
import type { GameState } from '../gameSlice';

// Helper function to create a test player
const createTestPlayer = (id: string, name: string, color: PlayerColor, startPos: number, endPos: number): LudoPlayer => ({
  id,
  name,
  color,
  score: 0,
  status: 'playing',
  isAI: false,
  pieces: [
    createTestPiece(`${id}-1`, id, 'home'),
    createTestPiece(`${id}-2`, id, 'home'),
  ],
  startPosition: startPos,
  endPosition: endPos,
  homePosition: 0,
  path: Array.from({ length: endPos + 1 }, (_, i) => i)
});

// Helper function to create a test piece
const createTestPiece = (id: string, playerId: string, position: number | 'home' | 'start' | 'end'): LudoPiece => ({
  id,
  playerId,
  position,
  isAtHome: position === 'home',
  isAtStart: position === 'start',
  isAtEnd: position === 'end',
  isSafe: true,
  isMovable: false,
  isSelected: false,
  pathIndex: 0,
  stepCount: 0
});

describe('game slice', () => {
  let store: ReturnType<typeof configureStore>;
  
  const testPlayers: LudoPlayer[] = [
    createTestPlayer('player1', 'Player 1', 'red' as PlayerColor, 0, 50),
    createTestPlayer('player2', 'Player 2', 'blue' as PlayerColor, 13, 63)
  ];

  beforeEach(() => {
    store = configureStore({
      reducer: {
        game: gameReducer,
      },
    });
  });

  it('should handle initial state', () => {
    const state = (store.getState() as { game: GameState }).game;
    expect(state.players).toEqual([]);
    expect(state.currentPlayerId).toBeNull();
    expect(state.diceValue).toBeNull();
    expect(state.gameStatus).toBe('waiting');
    expect(state.winner).toBeNull();
    expect(state.selectedPieceId).toBeNull();
    expect(state.possibleMoves).toEqual([]);
    expect(state.canRollDice).toBe(true);
  });

  it('should handle startGame', () => {
    store.dispatch(startGame({ players: testPlayers }));
    const state = (store.getState() as { game: GameState }).game;
    
    expect(state.players).toHaveLength(2);
    expect(state.currentPlayerId).toBe('player1');
    expect(state.gameStatus).toBe('playing');
  });

  it('should handle rollDice', () => {
    // First start the game
    store.dispatch(startGame({ players: testPlayers }));
    
    // Then roll the dice
    store.dispatch(rollDice({ playerId: 'player1', value: 6 }));
    const state = (store.getState() as { game: GameState }).game;
    
    expect(state.diceValue).toBe(6);
    expect(state.canRollDice).toBe(false);
  });

  it('should handle movePiece', () => {
    // Start the game and roll a 6
    store.dispatch(startGame({ players: testPlayers }));
    store.dispatch(rollDice({ playerId: 'player1', value: 6 }));
    
    // Select a piece first
    store.dispatch(selectPiece({ pieceId: 'player1-1' }));
    
    // Move the piece to position 0 (start position for player 1)
    store.dispatch(movePiece({ 
      pieceId: 'player1-1', 
      toPosition: 0
    }));
    
    const state = (store.getState() as { game: GameState }).game;
    const movedPiece = state.players[0].pieces.find((p: LudoPiece) => p.id === 'player1-1');
    
    expect(movedPiece?.position).toBe(0);
    expect(state.selectedPieceId).toBeNull();
    expect(state.possibleMoves).toEqual([]);
  });

  it('should handle endTurn', () => {
    // Start the game and roll the dice
    store.dispatch(startGame({ players: testPlayers }));
    store.dispatch(rollDice({ playerId: 'player1', value: 6 }));
    
    // End player 1's turn
    store.dispatch(endTurn());
    
    const state = (store.getState() as { game: GameState }).game;
    expect(state.currentPlayerId).toBe('player2');
    expect(state.diceValue).toBeNull();
    expect(state.canRollDice).toBe(true);
  });

  it('should capture opponent piece when landing on it', () => {
    // Créer des joueurs avec des positions spécifiques pour le test
    const testPlayersWithPositions: LudoPlayer[] = [
      {
        ...testPlayers[0],
        pieces: [
          {
            ...testPlayers[0].pieces[0],
            position: 5,
            isAtHome: false,
            isAtStart: false,
            isSafe: false
          },
          ...testPlayers[0].pieces.slice(1)
        ]
      },
      {
        ...testPlayers[1],
        pieces: [
          {
            ...testPlayers[1].pieces[0],
            position: 5,
            isAtHome: false,
            isAtStart: false,
            isSafe: false
          },
          ...testPlayers[1].pieces.slice(1)
        ]
      }
    ];
    
    // Démarrer le jeu avec les joueurs configurés
    store.dispatch(startGame({ players: testPlayersWithPositions }));
    
    const player1Piece = testPlayersWithPositions[0].pieces[0];
    const player2Piece = testPlayersWithPositions[1].pieces[0];
    
    // Le joueur 1 déplace son pion sur la case 5 (capture)
    store.dispatch(movePiece({
      pieceId: player1Piece.id,
      toPosition: 5
    }));
    
    const state = (store.getState() as { game: GameState }).game;
    
    // Vérifier que le pion du joueur 1 est sur la case 5
    const movedPiece = state.players[0].pieces.find(p => p.id === player1Piece.id);
    expect(movedPiece?.position).toBe(5);
    
    // Vérifier que le pion du joueur 2 est retourné à la maison
    const capturedPiece = state.players[1].pieces.find(p => p.id === player2Piece.id);
    expect(capturedPiece?.position).toBe('home');
    expect(capturedPiece?.isAtHome).toBe(true);
    
    // Vérifier que le score du joueur 1 a augmenté
    expect(state.players[0].score).toBe(1);
  });

  it('should not capture opponent piece on safe zone', () => {
    // Créer des joueurs avec des positions spécifiques pour le test
    const testPlayersWithSafeZone: LudoPlayer[] = [
      {
        ...testPlayers[0],
        pieces: [
          {
            ...testPlayers[0].pieces[0],
            position: 8,
            isAtHome: false,
            isAtStart: false,
            isSafe: true // Case sécurisée
          },
          ...testPlayers[0].pieces.slice(1)
        ]
      },
      {
        ...testPlayers[1],
        pieces: [
          {
            ...testPlayers[1].pieces[0],
            position: 8,
            isAtHome: false,
            isAtStart: false,
            isSafe: true // Même case sécurisée
          },
          ...testPlayers[1].pieces.slice(1)
        ]
      }
    ];
    
    // Démarrer le jeu avec les joueurs configurés
    store.dispatch(startGame({ players: testPlayersWithSafeZone }));
    
    const player1Piece = testPlayersWithSafeZone[0].pieces[0];
    const player2Piece = testPlayersWithSafeZone[1].pieces[0];
    
    // Le joueur 1 essaie de capturer le pion du joueur 2 (ne devrait pas marcher)
    store.dispatch(movePiece({
      pieceId: player1Piece.id,
      toPosition: 8
    }));
    
    const state = (store.getState() as { game: GameState }).game;
    
    // Vérifier que le pion du joueur 2 est toujours sur la case 8 (non capturé)
    const opponentPiece = state.players[1].pieces.find(p => p.id === player2Piece.id);
    expect(opponentPiece?.position).toBe(8);
    expect(opponentPiece?.isAtHome).toBe(false);
    
    // Vérifier que le score du joueur 1 n'a pas augmenté
    expect(state.players[0].score).toBe(0);
  });
});
