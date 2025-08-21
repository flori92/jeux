import { v4 as uuidv4 } from 'uuid';
import CheckersGame from './checkersGame.js';

class GameManager {
  constructor() {
    this.games = new Map(); // gameId -> Game
    this.playerGames = new Map(); // playerId -> gameId
    this.players = new Map(); // playerId -> Player info
  }

  createGame(playerId, playerName) {
    const gameId = `game_${uuidv4()}`;
    const game = new CheckersGame(gameId);
    
    // Ajouter le premier joueur
    const player = {
      id: playerId,
      name: playerName,
      color: 'white'
    };
    
    game.addPlayer(player);
    
    this.games.set(gameId, game);
    this.playerGames.set(playerId, gameId);
    this.players.set(playerId, player);
    
    return gameId;
  }

  joinGame(gameId, playerId, playerName) {
    const game = this.games.get(gameId);
    
    if (!game) {
      throw new Error('Partie non trouvée');
    }
    
    if (game.players.length >= 2) {
      throw new Error('La partie est déjà complète');
    }
    
    const player = {
      id: playerId,
      name: playerName,
      color: 'black'
    };
    
    game.addPlayer(player);
    
    this.playerGames.set(playerId, gameId);
    this.players.set(playerId, player);
    
    // Si deux joueurs sont présents, démarrer la partie
    if (game.players.length === 2) {
      game.startGame();
    }
    
    return game.getState();
  }

  makeMove(gameId, playerId, move) {
    const game = this.games.get(gameId);
    
    if (!game) {
      throw new Error('Partie non trouvée');
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

  getGameState(gameId) {
    const game = this.games.get(gameId);
    
    if (!game) {
      throw new Error('Partie non trouvée');
    }
    
    return game.getState();
  }

  getAvailableGames() {
    const availableGames = [];
    
    this.games.forEach((game, gameId) => {
      if (game.players.length < 2 && game.status === 'waiting') {
        availableGames.push({
          id: gameId,
          hostName: game.players[0]?.name || 'Inconnu',
          playersCount: game.players.length
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
    const game = this.games.get(gameId);
    
    if (game) {
      game.removePlayer(playerId);
      
      // Si la partie est vide, la supprimer
      if (game.players.length === 0) {
        this.games.delete(gameId);
      }
    }
    
    this.playerGames.delete(playerId);
    this.players.delete(playerId);
  }
}

export default GameManager;
