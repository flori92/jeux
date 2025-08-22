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
  // Enregistrement auto via auth du handshake (support du hook client)
  const authPlayerId = socket.handshake?.auth?.playerId;
  if (authPlayerId) {
    playerSockets.set(authPlayerId, socket.id);
    socketPlayers.set(socket.id, authPlayerId);
  }

  socket.on('register', ({ playerId, playerName }) => {
    playerSockets.set(playerId, socket.id);
    socketPlayers.set(socket.id, playerId);
    
    socket.emit('registered', { playerId, playerName });
    console.log(`Joueur ${playerName} (${playerId}) enregistré`);
  });

  socket.on('createGame', ({ playerName, gameType }, callback) => {
    try {
      const playerId = socketPlayers.get(socket.id) || uuidv4();
      const { gameId } = gameManager.createGame(playerId, playerName, gameType);
      
      socket.join(gameId);
      
      const gameState = gameManager.getGameState(gameId);
      callback({ gameId, gameState });
      
      console.log(`Partie ${gameId} (${gameType || 'checkers'}) créée par ${playerName}`);
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
      const status = gameState.status || gameState.gameStatus;
      if (status === 'playing') {
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
      const playerId = socketPlayers.get(socket.id) || socket.handshake?.auth?.playerId;
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

  // Ludo: lancer le dé
  socket.on('rollDice', ({ gameId }) => {
    try {
      const playerId = socketPlayers.get(socket.id) || socket.handshake?.auth?.playerId;
      const result = gameManager.rollDice(gameId, playerId);
      const updatedState = result.gameState || gameManager.getGameState(gameId);
      io.to(gameId).emit('gameStateUpdate', { gameState: updatedState });
      if (updatedState.winner) {
        io.to(gameId).emit('gameEnded', { winner: updatedState.winner, gameState: updatedState });
      }
    } catch (error) {
      socket.emit('error', { message: error.message });
    }
  });

  // Ludo: déplacer un pion
  socket.on('moveLudoPiece', ({ gameId, pieceId }) => {
    try {
      const playerId = socketPlayers.get(socket.id) || socket.handshake?.auth?.playerId;
      const result = gameManager.moveLudoPiece(gameId, playerId, pieceId);
      const updatedState = result.gameState || gameManager.getGameState(gameId);
      io.to(gameId).emit('gameStateUpdate', { gameState: updatedState });
      if (updatedState.winner) {
        io.to(gameId).emit('gameEnded', { winner: updatedState.winner, gameState: updatedState });
      }
    } catch (error) {
      socket.emit('error', { message: error.message });
    }
  });

  socket.on('invitePlayer', ({ email, gameId }) => {
    const playerId = socketPlayers.get(socket.id);
    const player = gameManager.getPlayer(playerId);
    
    if (!player || !gameId) {
      socket.emit('error', { message: 'Impossible d\'envoyer l\'invitation' });
      return;
    }

    // Créer un lien d'invitation
    const inviteLink = `${process.env.CLIENT_URL || 'http://localhost:5173'}/game/${gameId}?invite=true`;
    
    // Créer une invitation
    const invite = {
      id: uuidv4(),
      from: player.name,
      gameId: gameId,
      email: email,
      link: inviteLink,
      message: `${player.name} vous invite à jouer ! Cliquez sur ce lien pour rejoindre la partie: ${inviteLink}`
    };
    
    // Simuler l'envoi d'email (dans une vraie app, utiliser un service comme SendGrid, Nodemailer, etc.)
    console.log(`📧 Email simulé envoyé à ${email}:`);
    console.log(`De: ${player.name}`);
    console.log(`Sujet: Invitation à jouer`);
    console.log(`Message: ${invite.message}`);
    
    // Confirmer l'envoi au joueur
    socket.emit('inviteSent', { 
      invite,
      success: true,
      message: `Invitation envoyée à ${email} avec succès !`
    });
  });

  socket.on('disconnect', () => {
    const playerId = socketPlayers.get(socket.id) || socket.handshake?.auth?.playerId;
    
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
