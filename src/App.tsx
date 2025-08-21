import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import GameBoard from './components/GameBoard';
import LudoBoard from './components/LudoBoard';
import Lobby from './components/Lobby';
import GameSelector from './components/GameSelector';
import { useGameSocket } from './hooks/useGameSocket';
import type { GameState, Player, Move } from './types/game.types';
import './App.css';
import './components/GameSelector.css';

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
  const [selectedGame, setSelectedGame] = useState<'checkers' | 'ludo' | null>(null);
  const [playerName, setPlayerName] = useState('');
  const [gameId, setGameId] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleGameSelect = (gameType: 'checkers' | 'ludo') => {
    setSelectedGame(gameType);
    setError('');
  };

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
    socket.emit('createGame', { playerName, gameType: selectedGame }, (response: { gameId: string; error?: string; gameState?: GameState }) => {
      if (response.error) {
        setError(response.error);
        socket.disconnect();
      } else {
        // Sauvegarder les informations du joueur dans le localStorage
        localStorage.setItem('player', JSON.stringify({ id: playerId, name: playerName }));
        localStorage.setItem('gameId', response.gameId);
        localStorage.setItem('gameType', selectedGame || 'checkers');
        
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
        localStorage.setItem('gameType', response.gameState?.gameType || 'checkers');
        
        socket.disconnect();
        // Rediriger vers la page du jeu
        navigate(`/game/${gameId}`);
      }
    });
  };

  const handleBackToSelection = () => {
    setSelectedGame(null);
    setError('');
  };

  if (!selectedGame) {
    return <GameSelector onGameSelect={handleGameSelect} />;
  }

  const gameTitle = selectedGame === 'checkers' ? 'Jeu de Dames' : 'Ludo';
  const instructions = selectedGame === 'checkers' ? [
    'Les pions peuvent se déplacer en diagonale vers l\'avant',
    'Les pions peuvent prendre des pièces adverses en avant ou en arrière',
    'Un pion qui atteint la dernière rangée devient une dame',
    'Les dames peuvent se déplacer de plusieurs cases en diagonale'
  ] : [
    'Lancez le dé pour déplacer vos pions',
    'Sortez vos pions de la base avec un 6',
    'Capturez les pions adverses en tombant dessus',
    'Premier à amener tous ses pions à l\'arrivée gagne'
  ];

  return (
    <div className="home">
      <button onClick={handleBackToSelection} className="btn btn-back">
        ← Changer de jeu
      </button>
      
      <h2>{gameTitle} en ligne</h2>
      
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
          {instructions.map((instruction, index) => (
            <li key={index}>{instruction}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

const Game: React.FC = () => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [player, setPlayer] = useState<Player | null>(null);
  const [gameType, setGameType] = useState<'checkers' | 'ludo'>('checkers');
  const [gameId, setGameId] = useState<string>('');
  const [pendingInvites, setPendingInvites] = useState<Array<{
    id: string;
    from: string;
    gameId: string;
  }>>([]);
  const [error, setError] = useState('');
  
  // Récupérer les informations du joueur depuis le localStorage
  useEffect(() => {
    const savedPlayer = localStorage.getItem('player');
    const savedGameType = localStorage.getItem('gameType');
    const savedGameId = localStorage.getItem('gameId');
    
    if (savedPlayer) {
      setPlayer(JSON.parse(savedPlayer));
    } else {
      window.location.href = '/';
    }
    
    if (savedGameType) {
      setGameType(savedGameType as 'checkers' | 'ludo');
    }
    
    if (savedGameId) {
      setGameId(savedGameId);
    }
  }, []);

  // Initialiser la connexion WebSocket
  const {
    connect,
    disconnect,
    makeMove,
    rollDice,
    moveLudoPiece,
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
      
      return () => {
        disconnect();
      };
    }
  }, [player, connect, disconnect]);

  const handleMove = (move: Move) => {
    if (gameState && player && gameId) {
      makeMove(move, gameId);
    }
  };

  const handleRollDice = () => {
    if (gameId) {
      rollDice(gameId);
    }
  };

  const handleMovePiece = (pieceId: string) => {
    if (gameId) {
      moveLudoPiece(gameId, pieceId);
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
  const actualGameType = gameState.gameType || gameType;

  return (
    <div className="game-container">
      <div className="game-info">
        <h2>{actualGameType === 'ludo' ? 'Partie de Ludo' : 'Partie de Dames'}</h2>
        <div className="player-info">
          <div className={`player ${isCurrentPlayerTurn ? 'active' : ''}`}>
            <div className="player-color" style={{ backgroundColor: actualGameType === 'ludo' ? currentPlayer?.color || 'red' : 'black' }}></div>
            <span>{player.name} (Vous)</span>
            {isCurrentPlayerTurn && <span className="turn-indicator">À votre tour</span>}
          </div>
          
          {opponent && (
            <div className={`player ${!isCurrentPlayerTurn ? 'active' : ''}`}>
              <div className="player-color" style={{ backgroundColor: actualGameType === 'ludo' ? opponent?.color || 'blue' : 'white' }}></div>
              <span>{opponent.name}</span>
              {!isCurrentPlayerTurn && <span className="turn-indicator">Au tour de l'adversaire</span>}
            </div>
          )}
        </div>
        
        {error && <div className="error-message">{error}</div>}
      </div>
      
      <div className="game-board-container">
        {actualGameType === 'ludo' ? (
          <LudoBoard
            gameState={{
              players: gameState.players.map((p) => {
                // Créer des pièces Ludo par défaut pour chaque joueur
                const ludoPieces = Array.from({ length: 4 }, (_, index) => ({
                  id: `${p.id}_piece_${index}`,
                  color: p.color,
                  position: 'base' as string | number,
                  isInPlay: false,
                  distanceTraveled: 0
                }));
                
                return {
                  id: p.id,
                  name: p.name,
                  color: p.color,
                  pieces: ludoPieces,
                  finishedPieces: 0,
                  isActive: true
                };
              }),
              currentPlayerIndex: gameState.players.findIndex(p => p.id === gameState.currentPlayer),
              currentPlayer: (() => {
                const currentP = gameState.players.find(p => p.id === gameState.currentPlayer) || gameState.players[0];
                const ludoPieces = Array.from({ length: 4 }, (_, index) => ({
                  id: `${currentP.id}_piece_${index}`,
                  color: currentP.color,
                  position: 'base' as string | number,
                  isInPlay: false,
                  distanceTraveled: 0
                }));
                
                return {
                  id: currentP.id,
                  name: currentP.name,
                  color: currentP.color,
                  pieces: ludoPieces,
                  finishedPieces: 0,
                  isActive: true
                };
              })(),
              diceValue: gameState.diceValue || null,
              gameStatus: gameState.gameStatus || gameState.status,
              winner: gameState.winner ? {
                id: gameState.winner,
                name: gameState.players.find(p => p.id === gameState.winner)?.name || '',
                color: gameState.players.find(p => p.id === gameState.winner)?.color || '',
                pieces: [],
                finishedPieces: 4,
                isActive: false
              } : null,
              canRollDice: gameState.canRollDice || false,
              possibleMoves: (gameState.possibleMoves || []).map(pieceId => ({
                pieceId,
                from: 'base',
                to: 'track',
                type: 'move'
              }))
            }}
            playerId={player.id}
            onRollDice={handleRollDice}
            onMovePiece={handleMovePiece}
          />
        ) : (
          <GameBoard
            gameState={gameState}
            currentPlayerId={player.id}
            onMove={handleMove}
            playerId={player.id}
          />
        )}
      </div>
    </div>
  );
};

export default App;
