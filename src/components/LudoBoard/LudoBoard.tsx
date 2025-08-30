import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../../store';
import Houses from '../Houses';
import { SideBoard } from '../SideBoard';
import { rollDice, movePiece, endTurn } from '../../store/gameSlice';
import './LudoBoard.css';

export const LudoBoard: React.FC = () => {
  const dispatch = useDispatch();
  const { 
    players, 
    currentPlayerId, 
    diceValue, 
    gameStatus, 
    winner,
    canRollDice,
    possibleMoves
  } = useSelector((state: RootState) => ({
    players: state.game.players,
    currentPlayerId: state.game.currentPlayerId,
    diceValue: state.game.diceValue,
    gameStatus: state.game.gameStatus,
    winner: state.game.winner,
    canRollDice: state.game.canRollDice,
    possibleMoves: state.game.possibleMoves || []
  }));

  const [selectedPiece, setSelectedPiece] = useState<string | null>(null);
  const currentPlayer = players.find(p => p.id === currentPlayerId);

  // Gestion du lancer de dé
  const handleRollDice = useCallback(() => {
    if (canRollDice) {
      dispatch(rollDice({ playerId: currentPlayerId || '', value: Math.floor(Math.random() * 6) + 1 }));
    }
  }, [canRollDice, dispatch, currentPlayerId]);

  // Gestion du clic sur une pièce
  const handlePieceClick = useCallback((pieceId: string) => {
    if (!currentPlayer) {
      return;
    }

    const piece = currentPlayer.pieces.find(p => p.id === pieceId);
    if (!piece) {
      return;
    }

    // Si la pièce est sélectionnée, on la déselectionne
    if (selectedPiece === pieceId) {
      setSelectedPiece(null);
      return;
    }

    // Si c'est au tour du joueur et qu'il a déjà lancé le dé
    if (diceValue !== null && !canRollDice) {
      // Vérifier si la pièce peut être déplacée
      if (possibleMoves.includes(pieceId)) {
        // Calculer la position de destination basée sur la valeur du dé
        const currentPosition = piece.position;
        const newPosition = typeof currentPosition === 'number' ? currentPosition + (diceValue || 0) : 0;
        dispatch(movePiece({ pieceId, toPosition: newPosition }));
        setSelectedPiece(null);
      } else {
        setSelectedPiece(pieceId);
      }
    } else if (selectedPiece === null) {
      setSelectedPiece(pieceId);
    }
  }, [currentPlayer, diceValue, canRollDice, possibleMoves, selectedPiece, dispatch]);

  // Gestion de la fin de tour
  const handleEndTurn = useCallback(() => {
    dispatch(endTurn());
    setSelectedPiece(null);
  }, [dispatch]);

  // Effet pour gérer les touches du clavier
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedPiece(null);
      } else if (e.key === ' ' && canRollDice) {
        handleRollDice();
      } else if (e.key === 'Enter' && selectedPiece && possibleMoves.includes(selectedPiece)) {
        // Calculer la position de destination pour la pièce sélectionnée
        const selectedPieceObj = currentPlayer?.pieces.find(p => p.id === selectedPiece);
        if (selectedPieceObj) {
          const currentPosition = selectedPieceObj.position;
          const newPosition = typeof currentPosition === 'number' ? currentPosition + (diceValue || 0) : 0;
          dispatch(movePiece({ pieceId: selectedPiece, toPosition: newPosition }));
        }
        setSelectedPiece(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [canRollDice, selectedPiece, possibleMoves, handleRollDice, dispatch, currentPlayer?.pieces, diceValue]);

  // Vérifier s'il y a un gagnant
  useEffect(() => {
    if (gameStatus === 'finished' && winner) {
      console.log(`Le joueur ${winner.name} a gagné la partie !`);
    }
  }, [gameStatus, winner]);

  return (
    <div className="ludo-game-container">
      <div className="game-board">
        <Houses 
          onPieceClick={handlePieceClick}
          selectedPiece={selectedPiece}
        />
      </div>
      
      <SideBoard 
        onRollDice={handleRollDice}
        onEndTurn={handleEndTurn}
        canRollDice={canRollDice}
        canEndTurn={!canRollDice && diceValue !== null}
      />
    </div>
  );
};

export default LudoBoard;
