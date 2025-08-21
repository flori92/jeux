import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import GameBoard from './components/GameBoard';
import Lobby from './components/Lobby';
import { useGameSocket } from './hooks/useGameSocket';
import type { GameState, Player, Move } from './types/game.types';
import './App.css';

const API_URL = 'http://localhost:3001'; // URL de votre backend

const App: React.FC = () => {
  return (
    <Router>
      <div className="app">
        <h1>Jeu de Dames en Ligne</h1>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/game/:gameId" element={<Game />} />
        </Routes>
      </div>
    </Router>
  );
};

const Home: React.FC = () => {
  const [playerName, setPlayerName] = useState('');
  const [gameId, setGameId] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleCreateGame = () => {
    if (!playerName.trim()) {
      setError('Veuillez entrer votre nom');
      return;
    }
    
    const playerId = `player_${Date.now()}`;
    const socket = io(API_URL);
    
    // Enregistrer le joueur
    socket.emit('register', { playerId, playerName });
    
    // Créer la partie
    socket.emit('createGame', { playerName }, (response: { gameId: string; error?: string; gameState?: GameState }) => {
      if (response.error) {
        setError(response.error);
        socket.disconnect();
      } else {
        // Sauvegarder les informations du joueur dans le localStorage
        localStorage.setItem('player', JSON.stringify({ id: playerId, name: playerName }));
        localStorage.setItem('gameId', response.gameId);
        
        socket.disconnect();
        // Rediriger vers la page du jeu
        navigate(`/game/${response.gameId}`);
      }
    });
  };

  const handleJoinGame = () => {
    if (!playerName.trim() || !gameId.trim()) {
      setError('Veuillez remplir tous les champs');
      return;
    }
    
    const playerId = `player_${Date.now()}`;
    const socket = io(API_URL);
    
    // Enregistrer le joueur
    socket.emit('register', { playerId, playerName });
    
    // Rejoindre la partie
    socket.emit('joinGame', { gameId, playerName }, (response: { gameState?: GameState; error?: string }) => {
      if (response.error) {
        setError(response.error);
        socket.disconnect();
      } else {
        // Sauvegarder les informations du joueur dans le localStorage
        localStorage.setItem('player', JSON.stringify({ id: playerId, name: playerName }));
        localStorage.setItem('gameId', gameId);
        
        socket.disconnect();
        // Rediriger vers la page du jeu
        navigate(`/game/${gameId}`);
      }
    });
  };

  return (
    <div className="home">
      <div className="form-group">
        <label htmlFor="playerName">Votre nom :</label>
        <input
          id="playerName"
          type="text"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          placeholder="Entrez votre nom"
        />
      </div>
      
      <div className="actions">
        <button onClick={handleCreateGame} className="btn btn-primary">
          Créer une nouvelle partie
        </button>
        
        <div className="divider">OU</div>
        
        <div className="join-game">
          <input
            type="text"
            value={gameId}
            onChange={(e) => setGameId(e.target.value)}
            placeholder="ID de la partie"
          />
          <button onClick={handleJoinGame} className="btn btn-secondary">
            Rejoindre une partie
          </button>
        </div>
      </div>
      
      {error && <div className="error">{error}</div>}
      
      <div className="instructions">
        <h3>Comment jouer :</h3>
        <ul>
          <li>Créez une partie et partagez l'ID avec un ami</li>
          <li>Les pions peuvent se déplacer en diagonale vers l'avant</li>
          <li>Les pions peuvent prendre des pièces adverses en avant ou en arrière</li>
          <li>Un pion qui atteint la dernière rangée devient une dame</li>
          <li>Les dames peuvent se déplacer de plusieurs cases en diagonale</li>
        </ul>
      </div>
    </div>
  );
};

const Game: React.FC = () => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [player, setPlayer] = useState<Player | null>(null);
  const [pendingInvites, setPendingInvites] = useState<Array<{
    id: string;
    from: string;
    gameId: string;
  }>>([]);
  const [error, setError] = useState('');
  
  // Récupérer les informations du joueur depuis le localStorage
  useEffect(() => {
    const savedPlayer = localStorage.getItem('player');
    if (savedPlayer) {
      setPlayer(JSON.parse(savedPlayer));
    } else {
      // Rediriger vers la page d'accueil si aucun joueur n'est enregistré
      window.location.href = '/';
    }
  }, []);

  // Initialiser la connexion WebSocket
  const {
    connect,
    disconnect,
    makeMove,
    invitePlayer,
    acceptInvite,
    rejectInvite,
  } = useGameSocket({
    url: API_URL,
    playerId: player?.id || '',
    onGameStateUpdate: (newGameState) => {
      setGameState(newGameState);
    },
    onInviteReceived: (invite) => {
      setPendingInvites((prev) => [...prev, invite]);
    },
    onGameStart: (newGameState) => {
      setGameState(newGameState);
    },
    onOpponentLeft: () => {
      setError('Votre adversaire a quitté la partie');
    },
    onError: (message) => {
      setError(message);
    },
  });

  // Se connecter au serveur WebSocket lorsque le composant est monté
  useEffect(() => {
    if (player) {
      connect();
      
      // Nettoyer la connexion lors du démontage du composant
      return () => {
        disconnect();
      };
    }
  }, [player, connect, disconnect]);

  const handleMove = (move: Move) => {
    if (gameState && player) {
      makeMove(move);
    }
  };

  const handleInvitePlayer = (email: string) => {
    invitePlayer(email);
  };

  const handleAcceptInvite = (inviteId: string) => {
    acceptInvite(inviteId);
    setPendingInvites((prev) => prev.filter((invite) => invite.id !== inviteId));
  };

  const handleRejectInvite = (inviteId: string) => {
    rejectInvite(inviteId);
    setPendingInvites((prev) => prev.filter((invite) => invite.id !== inviteId));
  };

  if (!player) {
    return <div>Chargement...</div>;
  }

  if (!gameState) {
    return (
      <Lobby
        player={player}
        onInvitePlayer={handleInvitePlayer}
        pendingInvites={pendingInvites}
        onAcceptInvite={handleAcceptInvite}
        onRejectInvite={handleRejectInvite}
      />
    );
  }

  const currentPlayer = gameState.players.find((p) => p.id === player.id);
  const opponent = gameState.players.find((p) => p.id !== player.id);
  const isCurrentPlayerTurn = gameState.currentPlayer === player.id;

  return (
    <div className="game-container">
      <div className="game-info">
        <h2>Partie en cours</h2>
        <div className="player-info">
          <div className={`player ${isCurrentPlayerTurn ? 'active' : ''}`}>
            <div className="player-color" style={{ backgroundColor: 'black' }}></div>
            <span>{player.name} (Vous) - {currentPlayer?.color === 'black' ? 'Noirs' : 'Blancs'}</span>
            {isCurrentPlayerTurn && <span className="turn-indicator">À votre tour</span>}
          </div>
          
          {opponent && (
            <div className={`player ${!isCurrentPlayerTurn ? 'active' : ''}`}>
              <div className="player-color" style={{ backgroundColor: 'white' }}></div>
              <span>{opponent.name} - {opponent.color === 'black' ? 'Noirs' : 'Blancs'}</span>
              {!isCurrentPlayerTurn && <span className="turn-indicator">Au tour de l'adversaire</span>}
            </div>
          )}
        </div>
        
        {error && <div className="error-message">{error}</div>}
      </div>
      
      <div className="game-board-container">
        <GameBoard
          gameState={gameState}
          currentPlayerId={player.id}
          onMove={handleMove}
          playerId={player.id}
        />
      </div>
    </div>
  );
};

export default App;
