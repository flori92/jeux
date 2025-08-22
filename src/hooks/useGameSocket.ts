import { useEffect, useCallback } from 'react';
import io from 'socket.io-client';
import type { GameState, Move } from '../types/game.types';

interface GameSocketProps {
  url: string;
  playerId: string;
  onGameStateUpdate: (gameState: GameState) => void;
  onInviteReceived: (invite: { id: string; from: string; gameId: string }) => void;
  onGameStart: (gameState: GameState) => void;
  onOpponentLeft: () => void;
  onError: (message: string) => void;
}

export const useGameSocket = ({
  url,
  playerId,
  onGameStateUpdate,
  onInviteReceived,
  onGameStart,
  onOpponentLeft,
  onError,
}: GameSocketProps) => {
  const socket = io(url, {
    auth: { playerId },
    autoConnect: false,
  });

  const connect = useCallback(() => {
    socket.connect();
  }, [socket]);

  const disconnect = useCallback(() => {
    socket.disconnect();
  }, [socket]);

  const createGame = useCallback((playerName: string, gameType: 'checkers' | 'ludo' = 'checkers') => {
    return new Promise<{ gameId: string; gameState: GameState }>((resolve, reject) => {
      socket.emit('createGame', { playerName, gameType }, (response: { gameId: string; gameState: GameState } | { error: string }) => {
        if ('error' in response) {
          reject(new Error(response.error));
        } else {
          resolve(response);
        }
      });
    });
  }, [socket]);

  const joinGame = useCallback((gameId: string, playerName: string) => {
    return new Promise<GameState>((resolve, reject) => {
      socket.emit('joinGame', { gameId, playerName }, (response: { gameState: GameState } | { error: string }) => {
        if ('error' in response) {
          reject(new Error(response.error));
        } else {
          resolve(response.gameState);
        }
      });
    });
  }, [socket]);

  const makeMove = useCallback((move: Move, gameId: string) => {
    socket.emit('makeMove', { gameId, move });
  }, [socket]);

  const invitePlayer = useCallback((email: string) => {
    socket.emit('invitePlayer', { email });
  }, [socket]);

  const acceptInvite = useCallback((inviteId: string) => {
    socket.emit('acceptInvite', { inviteId });
  }, [socket]);

  const rejectInvite = useCallback((inviteId: string) => {
    socket.emit('rejectInvite', { inviteId });
  }, [socket]);

  const rollDice = useCallback((gameId: string) => {
    socket.emit('rollDice', { gameId });
  }, [socket]);

  const moveLudoPiece = useCallback((gameId: string, pieceId: string) => {
    socket.emit('moveLudoPiece', { gameId, pieceId });
  }, [socket]);

  useEffect(() => {
    // Gestion des événements du serveur
    const handleGameStateUpdate = (data: { gameState: GameState }) => {
      onGameStateUpdate(data.gameState);
    };

    const handleInviteReceived = (data: { invite: { id: string; from: string; gameId: string } }) => {
      onInviteReceived(data.invite);
    };

    const handleGameStarted = (data: { gameState: GameState }) => {
      onGameStart(data.gameState);
    };

    const handleOpponentLeft = () => {
      onOpponentLeft();
    };

    const handleError = (data: { message: string }) => {
      onError(data.message);
    };

    socket.on('gameStateUpdate', handleGameStateUpdate);
    socket.on('inviteReceived', handleInviteReceived);
    socket.on('gameStarted', handleGameStarted);
    socket.on('opponentLeft', handleOpponentLeft);
    socket.on('error', handleError);

    // Nettoyage
    return () => {
      socket.off('gameStateUpdate', handleGameStateUpdate);
      socket.off('inviteReceived', handleInviteReceived);
      socket.off('gameStarted', handleGameStarted);
      socket.off('opponentLeft', handleOpponentLeft);
      socket.off('error', handleError);
    };
  }, [socket, onGameStateUpdate, onInviteReceived, onGameStart, onOpponentLeft, onError]);

  return {
    connect,
    disconnect,
    createGame,
    joinGame,
    makeMove,
    invitePlayer,
    acceptInvite,
    rejectInvite,
    rollDice,
    moveLudoPiece,
    socket,
  };
};
