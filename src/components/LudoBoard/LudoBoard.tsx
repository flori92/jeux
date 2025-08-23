import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { Houses } from '../Houses';
import { SideBoard } from '../SideBoard';
import { rollDice, movePiece, endTurn } from '../../store/gameSlice';
import type { LudoPiece, LudoPlayer } from '../../types/game.types';
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
    gameStatus: state.game.status,
    winner: state.game.winner,
    canRollDice: state.game.canRollDice,
    possibleMoves: state.game.possibleMoves || []
  }));

  const [selectedPiece, setSelectedPiece] = useState<string | null>(null);
  const currentPlayer = players.find(p => p.id === currentPlayerId);

  // Gestion du lancer de dé
  const handleRollDice = useCallback(() => {
    if (canRollDice) {
      dispatch(rollDice());
    }
  }, [canRollDice, dispatch]);

  // Gestion du clic sur une pièce
  const handlePieceClick = useCallback((pieceId: string) => {
    if (!currentPlayer) return;

    const piece = currentPlayer.pieces.find(p => p.id === pieceId);
    if (!piece) return;

    // Si la pièce est sélectionnée, on la déselectionne
    if (selectedPiece === pieceId) {
      setSelectedPiece(null);
      return;
    }

    // Si c'est au tour du joueur et qu'il a déjà lancé le dé
    if (diceValue !== null && !canRollDice) {
      // Vérifier si la pièce peut être déplacée
      if (possibleMoves.includes(pieceId)) {
        dispatch(movePiece({ pieceId }));
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
        dispatch(movePiece({ pieceId: selectedPiece }));
        setSelectedPiece(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [canRollDice, selectedPiece, possibleMoves, handleRollDice, dispatch]);

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
