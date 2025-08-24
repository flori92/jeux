import React, { useState, useEffect } from 'react';
import { useGameSocket } from './hooks/useGameSocket';
import { useNotifications } from './hooks/useNotifications';
import GameSelector from './components/GameSelector';
import GameBoard from './components/GameBoard';
import LudoBoard from './components/LudoBoard';
import Lobby from './components/Lobby';
import ShareGameLink from './components/ShareGameLink';
import GameNotifications from './components/GameNotifications';
import './App.css';

type GameType = 'checkers' | 'ludo';
type GameMode = 'multiplayer' | 'ai';
type AppState = 'menu' | 'lobby' | 'game';

interface Player {
  id: string;
  name: string;
}

interface GameState {
  id: string;
  players: any[];
  currentPlayer: string;
  status: 'waiting' | 'playing' | 'finished';
  winner?: string;
  gameType: GameType;
  board?: any;
  pieces?: any;
  diceValue?: number;
  canRollDice?: boolean;
  possibleMoves?: string[];
}

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('menu');
  const [selectedGame, setSelectedGame] = useState<GameType | null>(null);
  const [selectedMode, setSelectedMode] = useState<GameMode | null>(null);
  const [player, setPlayer] = useState<Player | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [gameId, setGameId] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const [joinGameId, setJoinGameId] = useState('');
  const [isJoining, setIsJoining] = useState(false);

  const { notifications, addNotification, removeNotification, showSuccess, showError, showInfo } = useNotifications();

  // Configuration du socket
  const {
    connect,
    disconnect,
    createGame,
    joinGame,
    makeMove,
    rollDice,
    moveLudoPiece,
    invitePlayer
  } = useGameSocket({
    url: 'http://localhost:3001',
    playerId: player?.id || '',
    onGameStateUpdate: (newGameState) => {
      setGameState(newGameState);
      if (newGameState.status === 'playing' && appState !== 'game') {
        setAppState('game');
      }
    },
    onInviteReceived: (invite) => {
      showInfo('Invitation reçue', `${invite.from} vous invite à jouer !`);
    },
    onGameStart: (newGameState) => {
      setGameState(newGameState);
      setAppState('game');
      showSuccess('Partie commencée', 'La partie a commencé !');
    },
    onOpponentLeft: () => {
      showInfo('Adversaire parti', 'Votre adversaire a quitté la partie.');
    },
    onError: (message) => {
      showError('Erreur', message);
    }
  });

  // Initialisation du joueur
  useEffect(() => {
    if (!player && playerName) {
      const newPlayer: Player = {
        id: `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: playerName
      };
      setPlayer(newPlayer);
    }
  }, [playerName, player]);

  // Connexion socket
  useEffect(() => {
    if (player) {
      connect();
      return () => disconnect();
    }
  }, [player, connect, disconnect]);

  const handleGameSelect = async (gameType: GameType, mode: GameMode) => {
    setSelectedGame(gameType);
    setSelectedMode(mode);

    if (mode === 'ai') {
      // Mode IA - créer une partie directement
      if (!player) return;
      
      try {
        const { gameId: newGameId, gameState: newGameState } = await createGame(player.name, gameType);
        setGameId(newGameId);
        setGameState(newGameState);
        setAppState('game');
        showSuccess('Partie créée', 'Partie contre l\'IA créée avec succès !');
      } catch (error) {
        showError('Erreur', 'Impossible de créer la partie');
      }
    } else {
      // Mode multijoueur - aller au lobby
      setAppState('lobby');
    }
  };

  const handleCreateGame = async () => {
    if (!player || !selectedGame) return;

    try {
      const { gameId: newGameId, gameState: newGameState } = await createGame(player.name, selectedGame);
      setGameId(newGameId);
      setGameState(newGameState);
      setShowShareModal(true);
      showSuccess('Partie créée', `Partie créée avec l'ID: ${newGameId}`);
    } catch (error) {
      showError('Erreur', 'Impossible de créer la partie');
    }
  };

  const handleJoinGame = async () => {
    if (!player || !joinGameId.trim()) return;

    setIsJoining(true);
    try {
      const newGameState = await joinGame(joinGameId.trim(), player.name);
      setGameId(joinGameId.trim());
      setGameState(newGameState);
      setAppState('game');
      showSuccess('Partie rejointe', 'Vous avez rejoint la partie avec succès !');
    } catch (error) {
      showError('Erreur', 'Impossible de rejoindre la partie');
    } finally {
      setIsJoining(false);
    }
  };

  const handleMove = (move: any) => {
    if (!gameId) return;
    makeMove(move, gameId);
  };

  const handleRollDice = () => {
    if (!gameId) return;
    rollDice(gameId);
  };

  const handleMovePiece = (pieceId: string) => {
    if (!gameId) return;
    moveLudoPiece(gameId, pieceId);
  };

  const handleInvitePlayer = (email: string) => {
    invitePlayer(email);
    showSuccess('Invitation envoyée', `Invitation envoyée à ${email}`);
  };

  const handleBackToMenu = () => {
    setAppState('menu');
    setSelectedGame(null);
    setSelectedMode(null);
    setGameState(null);
    setGameId(null);
    setShowShareModal(false);
    setJoinGameId('');
  };

  // Interface de saisie du nom
  if (!player) {
    return (
      <div className="app">
        <div className="welcome-screen">
          <h1>🎮 Jeux de Plateau</h1>
          <div className="name-input-container">
            <h2>Entrez votre nom</h2>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Votre nom..."
              className="name-input"
              onKeyPress={(e) => e.key === 'Enter' && playerName.trim() && setPlayerName(playerName.trim())}
            />
            <button
              onClick={() => playerName.trim() && setPlayerName(playerName.trim())}
              disabled={!playerName.trim()}
              className="start-button"
            >
              Commencer
            </button>
          </div>
        </div>
        <GameNotifications
          notifications={notifications}
          onRemoveNotification={removeNotification}
        />
      </div>
    );
  }

  return (
    <div className="app">
      {/* Menu principal */}
      {appState === 'menu' && (
        <GameSelector onGameSelect={handleGameSelect} />
      )}

      {/* Lobby multijoueur */}
      {appState === 'lobby' && (
        <div className="lobby-container">
          <button onClick={handleBackToMenu} className="back-button">
            ← Retour au menu
          </button>
          
          <div className="lobby-content">
            <h2>Lobby - {selectedGame === 'checkers' ? 'Jeu de Dames' : 'Ludo'}</h2>
            
            <div className="lobby-actions">
              <div className="create-game-section">
                <h3>Créer une partie</h3>
                <button onClick={handleCreateGame} className="create-button">
                  Créer une nouvelle partie
                </button>
              </div>

              <div className="join-game-section">
                <h3>Rejoindre une partie</h3>
                <div className="join-form">
                  <input
                    type="text"
                    value={joinGameId}
                    onChange={(e) => setJoinGameId(e.target.value)}
                    placeholder="ID de la partie..."
                    className="game-id-input"
                  />
                  <button
                    onClick={handleJoinGame}
                    disabled={!joinGameId.trim() || isJoining}
                    className="join-button"
                  >
                    {isJoining ? 'Connexion...' : 'Rejoindre'}
                  </button>
                </div>
              </div>
            </div>

            {gameState && gameState.status === 'waiting' && (
              <div className="waiting-room">
                <h3>En attente d'un adversaire...</h3>
                <p>ID de la partie: <strong>{gameId}</strong></p>
                <button onClick={() => setShowShareModal(true)} className="share-button">
                  Partager la partie
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Jeu en cours */}
      {appState === 'game' && gameState && (
        <div className="game-container">
          <div className="game-header">
            <button onClick={handleBackToMenu} className="back-button">
              ← Quitter la partie
            </button>
            <h2>{selectedGame === 'checkers' ? 'Jeu de Dames' : 'Ludo'}</h2>
            {gameId && (
              <div className="game-info">
                ID: {gameId} | Joueurs: {gameState.players.length}
              </div>
            )}
          </div>

          {selectedGame === 'checkers' ? (
            <GameBoard
              gameState={gameState}
              currentPlayerId={gameState.currentPlayer}
              onMove={handleMove}
              playerId={player.id}
            />
          ) : (
            <LudoBoard
              gameState={gameState}
              playerId={player.id}
              onRollDice={handleRollDice}
              onMovePiece={handleMovePiece}
            />
          )}
        </div>
      )}

      {/* Modal de partage */}
      {showShareModal && gameId && (
        <ShareGameLink
          gameId={gameId}
          onClose={() => setShowShareModal(false)}
        />
      )}

      {/* Notifications */}
      <GameNotifications
        notifications={notifications}
        onRemoveNotification={removeNotification}
      />
    </div>
  );
};

export default App;