import CheckersGame from './checkersGame.js';
import LudoGame from './ludoGame.js';

class AIPlayer {
  constructor(gameType = 'checkers', difficulty = 'medium') {
    this.gameType = gameType;
    this.difficulty = difficulty;
    this.playerId = 'ai_player';
    this.playerName = 'Ordinateur';
  }

  // IA pour le jeu de Dames
  makeCheckersMove(game) {
    const possibleMoves = game.getAllPossibleMoves('white'); // IA joue en blanc
    
    if (possibleMoves.length === 0) return null;

    // Stratégie simple : priorité aux captures
    const captureMoves = possibleMoves.filter(move => move.captures && move.captures.length > 0);
    
    if (captureMoves.length > 0) {
      // Choisir la capture qui prend le plus de pièces
      return captureMoves.reduce((best, current) => 
        current.captures.length > best.captures.length ? current : best
      );
    }

    // Sinon, mouvement aléatoire parmi les possibles
    return possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
  }

  // IA pour le jeu de Ludo
  makeLudoMove(game, diceValue) {
    const aiPlayer = game.players.find(p => p.id === this.playerId);
    if (!aiPlayer) return null;

    const movablePieces = aiPlayer.pieces.filter(piece => {
      if (!piece.isInPlay && diceValue === 6) return true;
      if (piece.isInPlay && !piece.hasFinished) return true;
      return false;
    });

    if (movablePieces.length === 0) return null;

    // Stratégie simple pour Ludo
    // 1. Priorité : sortir un pion si on a un 6
    if (diceValue === 6) {
      const piecesInBase = movablePieces.filter(p => !p.isInPlay);
      if (piecesInBase.length > 0) {
        return { pieceId: piecesInBase[0].id, action: 'move' };
      }
    }

    // 2. Avancer le pion le plus proche de l'arrivée
    const piecesInPlay = movablePieces.filter(p => p.isInPlay);
    if (piecesInPlay.length > 0) {
      const bestPiece = piecesInPlay.reduce((best, current) => 
        current.distanceTraveled > best.distanceTraveled ? current : best
      );
      return { pieceId: bestPiece.id, action: 'move' };
    }

    return null;
  }

  // Délai pour simuler la réflexion de l'IA
  async makeMove(game, gameType, diceValue = null) {
    return new Promise((resolve) => {
      const thinkingTime = Math.random() * 1000 + 500; // 0.5-1.5 secondes
      
      setTimeout(() => {
        let move = null;
        
        if (gameType === 'checkers') {
          move = this.makeCheckersMove(game);
        } else if (gameType === 'ludo') {
          move = this.makeLudoMove(game, diceValue);
        }
        
        resolve(move);
      }, thinkingTime);
    });
  }

  // Lancer le dé pour Ludo (IA)
  rollDice() {
    return Math.floor(Math.random() * 6) + 1;
  }
}

export default AIPlayer;
