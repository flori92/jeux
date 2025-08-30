import React, { useState, useEffect } from 'react';
import { useGameSocket } from './hooks/useGameSocket';
import { useNotifications } from './hooks/useNotifications';
import GameSelector from './components/GameSelector';
import GameBoard from './components/GameBoard';
import { LudoBoard } from './components/LudoBoard/LudoBoard';
import ShareGameLink from './components/ShareGameLink';
import GameNotifications from './components/GameNotifications';
import type { GameState as ImportedGameState, LudoGameState, Move } from './types/game.types';
import './App.css';

type GameType = 'checkers' | 'ludo';
type GameMode = 'multiplayer' | 'ai';
type AppState = 'menu' | 'lobby' | 'game';

interface Player {
  id: string;
  name: string;
}

interface AppGameState {
  id: string;
  players: Player[];
  currentPlayer: string;
  status: 'waiting' | 'playing' | 'finished';
  winner?: string | null;
  gameType: GameType;
  board?: unknown;
  pieces?: unknown;
  diceValue?: number;
  canRollDice?: boolean;
  possibleMoves?: string[];
  captureChain?: unknown;
  currentPlayerIndex?: number;
  gameStatus?: string;
}

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('menu');
  const [selectedGame, setSelectedGame] = useState<GameType | null>(null);
  const [player, setPlayer] = useState<Player | null>(null);
  const [gameState, setGameState] = useState<AppGameState | null>(null);
  const [gameId, setGameId] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const [joinGameId, setJoinGameId] = useState('');
  const [isJoining, setIsJoining] = useState(false);

  const { notifications, removeNotification, showSuccess, showError, showInfo } = useNotifications();

  // Fonction utilitaire pour adapter les états de jeu
  const adaptGameState = (newGameState: ImportedGameState | LudoGameState): AppGameState => {
    const isLudoState = 'currentPlayerId' in newGameState;
    const winner = 'winner' in newGameState ? newGameState.winner : null;
    
    return {
      id: newGameState.id,
      players: Array.isArray(newGameState.players) 
        ? newGameState.players.map(p => ({ 
            id: typeof p === 'string' ? p : p.id || '', 
            name: typeof p === 'string' ? p : p.name || '' 
          })) 
        : [],
      currentPlayer: isLudoState ? newGameState.currentPlayerId || '' : newGameState.currentPlayer,
      status: newGameState.status,
      winner: typeof winner === 'string' ? winner : winner?.id || null,
      gameType: ('gameType' in newGameState ? newGameState.gameType : isLudoState ? 'ludo' : 'checkers') as GameType,
      board: 'board' in newGameState ? newGameState.board : undefined,
      pieces: 'pieces' in newGameState ? newGameState.pieces : undefined,
      diceValue: 'diceValue' in newGameState ? newGameState.diceValue || undefined : undefined,
      canRollDice: 'canRollDice' in newGameState ? newGameState.canRollDice : undefined,
      possibleMoves: 'possibleMoves' in newGameState ? newGameState.possibleMoves : undefined,
      captureChain: 'captureChain' in newGameState ? newGameState.captureChain : undefined,
      currentPlayerIndex: 'currentPlayerIndex' in newGameState ? (typeof newGameState.currentPlayerIndex === 'number' ? newGameState.currentPlayerIndex : undefined) : undefined,
      gameStatus: 'gameStatus' in newGameState ? (typeof newGameState.gameStatus === 'string' ? newGameState.gameStatus : undefined) : undefined
    };
  };

  // Configuration du socket
  const {
    connect,
    disconnect,
    createGame,
    joinGame,
    makeMove,
  } = useGameSocket({
    url: 'http://localhost:3001',
    playerId: player?.id || '',
    onGameStateUpdate: (newGameState: ImportedGameState | LudoGameState) => {
      const adaptedState = adaptGameState(newGameState);
      setGameState(adaptedState);
      if (adaptedState.status === 'playing' && appState !== 'game') {
        setAppState('game');
      }
    },
    onInviteReceived: (invite) => {
      showInfo('Invitation reçue', `${invite.from} vous invite à jouer !`);
    },
    onGameStart: (newGameState: ImportedGameState | LudoGameState) => {
      const adaptedState = adaptGameState(newGameState);
      setGameState(adaptedState);
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
    // Mode sélectionné géré par gameType

    if (mode === 'ai') {
      // Mode IA - créer une partie directement
      if (!player) {
        return;
      }
      
      try {
        const { gameId: newGameId, gameState: newGameState } = await createGame(player.name, gameType);
        setGameId(newGameId);
        const adaptedState = adaptGameState(newGameState);
        setGameState(adaptedState);
        setAppState('game');
        showSuccess('Partie créée', 'Partie contre l\'IA créée avec succès !');
      } catch {
        showError('Erreur', 'Impossible de créer la partie');
      }
    } else {
      // Mode multijoueur - aller au lobby
      setAppState('lobby');
    }
  };

  const handleCreateGame = async () => {
    if (!player || !selectedGame) {
      return;
    }

    try {
      const { gameId: newGameId, gameState: newGameState } = await createGame(player.name, selectedGame);
      setGameId(newGameId);
      const adaptedState = adaptGameState(newGameState);
      setGameState(adaptedState);
      setShowShareModal(true);
      showSuccess('Partie créée', `Partie créée avec l'ID: ${newGameId}`);
    } catch {
      showError('Erreur', 'Impossible de créer la partie');
    }
  };

  const handleJoinGame = async () => {
    if (!player || !joinGameId.trim()) {
      return;
    }

    setIsJoining(true);
    try {
      const newGameState = await joinGame(joinGameId.trim(), player.name);
      setGameId(joinGameId.trim());
      const adaptedState = adaptGameState(newGameState);
      setGameState(adaptedState);
      setAppState('game');
      showSuccess('Partie rejointe', 'Vous avez rejoint la partie avec succès !');
    } catch {
      showError('Erreur', 'Impossible de rejoindre la partie');
    } finally {
      setIsJoining(false);
    }
  };

  const handleMove = (move: Move) => {
    if (!gameId) {
      return;
    }
    if (gameState && gameState.status === 'finished') {
      return;
    }
    makeMove(move, gameId);
  };


  const handleBackToMenu = () => {
    setAppState('menu');
    setSelectedGame(null);
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
              gameState={gameState as unknown as ImportedGameState}
              currentPlayerId={gameState.currentPlayer}
              onMove={handleMove}
              playerId={player.id}
            />
          ) : (
            <LudoBoard />
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
