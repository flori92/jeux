import { v4 as uuidv4 } from 'uuid';
import CheckersGame from './checkersGame.js';
import LudoGame from './ludoGame.js';

class GameManager {
  constructor() {
    this.games = new Map(); // gameId -> Game
    this.playerGames = new Map(); // playerId -> gameId
    this.players = new Map(); // playerId -> Player info
  }

  generateGameId() {
    return `game_${uuidv4()}`;
  }

  createGame(playerId, playerName, gameType = 'checkers') {
    const gameId = this.generateGameId();
    const game = gameType === 'ludo' ? new LudoGame() : new CheckersGame(gameId);
    
    // Ajouter le premier joueur selon le type de jeu
    if (gameType === 'ludo') {
      game.addPlayer(playerId, playerName);
    } else {
      const player = {
        id: playerId,
        name: playerName,
        color: 'white'
      };
      game.addPlayer(player);
    }
    
    this.games.set(gameId, { game, type: gameType });
    this.playerGames.set(playerId, gameId);
    this.players.set(playerId, { id: playerId, name: playerName });
    
    return { gameId, gameType };
  }

  joinGame(gameId, playerId, playerName) {
    const gameData = this.games.get(gameId);
    
    if (!gameData) {
      throw new Error('Partie non trouvée');
    }
    
    const { game, type } = gameData;
    
    if (type === 'ludo') {
      if (game.players.length >= 4) {
        throw new Error('La partie est complète');
      }
      game.addPlayer(playerId, playerName);
    } else {
      if (game.players.length >= 2) {
        throw new Error('La partie est déjà complète');
      }
      
      const player = {
        id: playerId,
        name: playerName,
        color: 'black'
      };
      
      game.addPlayer(player);
    }
    
    this.playerGames.set(playerId, gameId);
    this.players.set(playerId, { id: playerId, name: playerName });
    
    // Démarrage automatique uniquement pour les dames
    if (type !== 'ludo' && game.players.length === 2) {
      game.startGame();
    }
    
    return this.getGameState(gameId);
  }

  makeMove(gameId, playerId, move) {
    const gameData = this.games.get(gameId);
    
    if (!gameData) {
      throw new Error('Partie non trouvée');
    }
    
    const { game, type } = gameData;
    
    if (type !== 'checkers') {
      throw new Error('Mauvais type de jeu pour makeMove');
    }
    
    if (!game.isPlayerTurn(playerId)) {
      throw new Error("Ce n'est pas votre tour");
    }
    
    const result = game.makeMove(playerId, move);
    
    if (!result.valid) {
      throw new Error(result.error || 'Mouvement invalide');
    }
    
    return game.getState();
  }

  // Spécifique Ludo
  rollDice(gameId, playerId) {
    const gameData = this.games.get(gameId);
    if (!gameData) {
      throw new Error('Partie non trouvée');
    }
    const { game, type } = gameData;
    if (type !== 'ludo') {
      throw new Error('Mauvais type de jeu pour rollDice');
    }
    return game.rollDice(playerId);
  }

  moveLudoPiece(gameId, playerId, pieceId) {
    const gameData = this.games.get(gameId);
    if (!gameData) {
      throw new Error('Partie non trouvée');
    }
    const { game, type } = gameData;
    if (type !== 'ludo') {
      throw new Error('Mauvais type de jeu pour moveLudoPiece');
    }
    return game.movePiece(playerId, pieceId);
  }

  getGameState(gameId) {
    const gameData = this.games.get(gameId);
    
    if (!gameData) {
      throw new Error('Partie non trouvée');
    }
    
    const { game, type } = gameData;
    const state = game.getGameState ? game.getGameState() : game.getState();
    state.gameType = type;
    return state;
  }

  getAvailableGames() {
    const availableGames = [];
    
    this.games.forEach((gameData, gameId) => {
      const { game, type } = gameData;
      const maxPlayers = type === 'ludo' ? 4 : 2;
      
      const status = game.gameStatus || game.status;
      if (game.players && game.players.length < maxPlayers && status === 'waiting') {
        availableGames.push({
          id: gameId,
          hostName: game.players[0]?.name || 'Inconnu',
          playersCount: game.players.length,
          gameType: type,
          maxPlayers: maxPlayers
        });
      }
    });
    
    return availableGames;
  }

  getPlayerGame(playerId) {
    return this.playerGames.get(playerId);
  }

  getPlayer(playerId) {
    return this.players.get(playerId);
  }

  removePlayer(gameId, playerId) {
    const gameData = this.games.get(gameId);
    
    if (gameData) {
      const { game } = gameData;
      game.removePlayer(playerId);
      
      // Si la partie est vide, la supprimer
      if (game.players && game.players.length === 0) {
        this.games.delete(gameId);
      }
    }
    
    this.playerGames.delete(playerId);
    this.players.delete(playerId);
  }
}

export default GameManager;
