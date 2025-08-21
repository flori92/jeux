import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import GameManager from './gameManager.js';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

const gameManager = new GameManager();
const playerSockets = new Map(); // Map playerId -> socketId
const socketPlayers = new Map(); // Map socketId -> playerId

// Gestion des connexions Socket.IO
io.on('connection', (socket) => {
  console.log('Nouvelle connexion:', socket.id);

  socket.on('register', ({ playerId, playerName }) => {
    playerSockets.set(playerId, socket.id);
    socketPlayers.set(socket.id, playerId);
    
    socket.emit('registered', { playerId, playerName });
    console.log(`Joueur ${playerName} (${playerId}) enregistré`);
  });

  socket.on('createGame', ({ playerName }, callback) => {
    try {
      const playerId = socketPlayers.get(socket.id) || uuidv4();
      const gameId = gameManager.createGame(playerId, playerName);
      
      socket.join(gameId);
      
      const gameState = gameManager.getGameState(gameId);
      callback({ gameId, gameState });
      
      console.log(`Partie ${gameId} créée par ${playerName}`);
    } catch (error) {
      callback({ error: error.message });
    }
  });

  socket.on('joinGame', ({ gameId, playerName }, callback) => {
    try {
      const playerId = socketPlayers.get(socket.id) || uuidv4();
      const gameState = gameManager.joinGame(gameId, playerId, playerName);
      
      socket.join(gameId);
      
      // Notifier tous les joueurs dans la salle
      io.to(gameId).emit('gameStateUpdate', { gameState });
      
      // Si la partie commence (2 joueurs)
      if (gameState.status === 'playing') {
        io.to(gameId).emit('gameStarted', { gameState });
      }
      
      callback({ gameState });
      
      console.log(`${playerName} a rejoint la partie ${gameId}`);
    } catch (error) {
      callback({ error: error.message });
    }
  });

  socket.on('makeMove', ({ gameId, move }) => {
    try {
      const playerId = socketPlayers.get(socket.id);
      const gameState = gameManager.makeMove(gameId, playerId, move);
      
      // Envoyer la mise à jour à tous les joueurs de la partie
      io.to(gameId).emit('gameStateUpdate', { gameState });
      
      // Vérifier si la partie est terminée
      if (gameState.winner) {
        io.to(gameId).emit('gameEnded', { 
          winner: gameState.winner,
          gameState 
        });
      }
      
      console.log(`Mouvement effectué dans la partie ${gameId}`);
    } catch (error) {
      socket.emit('error', { message: error.message });
    }
  });

  socket.on('invitePlayer', ({ email, gameId }) => {
    // Dans une vraie application, vous enverriez un email
    // Ici, nous simulons avec un ID d'invitation
    const inviteId = uuidv4();
    const playerId = socketPlayers.get(socket.id);
    const player = gameManager.getPlayer(playerId);
    
    // Créer une invitation
    const invite = {
      id: inviteId,
      from: player?.name || 'Un joueur',
      gameId: gameId,
      email: email
    };
    
    // Pour la démo, on envoie l'invitation au joueur qui l'a créée
    socket.emit('inviteSent', { invite });
    
    console.log(`Invitation envoyée à ${email} pour la partie ${gameId}`);
  });

  socket.on('disconnect', () => {
    const playerId = socketPlayers.get(socket.id);
    
    if (playerId) {
      const gameId = gameManager.getPlayerGame(playerId);
      
      if (gameId) {
        // Notifier les autres joueurs
        socket.to(gameId).emit('opponentLeft', { playerId });
        
        // Retirer le joueur de la partie
        gameManager.removePlayer(gameId, playerId);
      }
      
      playerSockets.delete(playerId);
      socketPlayers.delete(socket.id);
    }
    
    console.log('Déconnexion:', socket.id);
  });
});

// API REST pour obtenir l'état d'une partie
app.get('/api/game/:gameId', (req, res) => {
  try {
    const gameState = gameManager.getGameState(req.params.gameId);
    res.json({ gameState });
  } catch (error) {
    res.status(404).json({ error: 'Partie non trouvée' });
  }
});

// API pour obtenir la liste des parties disponibles
app.get('/api/games', (req, res) => {
  const games = gameManager.getAvailableGames();
  res.json({ games });
});

const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});
