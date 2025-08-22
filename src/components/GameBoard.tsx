import React, { useState, useEffect } from 'react';
import { Square } from './Square';
import type { GameState, Piece, Move } from '../types/game.types';

interface GameBoardProps {
  gameState: GameState;
  currentPlayerId: string;
  onMove: (move: Move) => void;
  playerId: string;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  gameState,
  currentPlayerId,
  onMove,
  playerId,
}) => {
  const [selectedPiece, setSelectedPiece] = useState<[number, number] | null>(null);
  const [possibleMoves, setPossibleMoves] = useState<[number, number][]>([]);
  const [board, setBoard] = useState<(Piece | null)[][]>([]);

  useEffect(() => {
    // Initialize the board
    const newBoard = Array(8).fill(null).map(() => Array(8).fill(null));
    
    // Place pieces on the board
    if (gameState.board) {
      gameState.board.flat().forEach((piece: Piece | null) => {
        if (!piece) return;
        const [x, y] = piece.position;
        if (x >= 0 && x < 8 && y >= 0 && y < 8) {
          newBoard[x][y] = piece;
        }
      });
    }
    
    setBoard(newBoard);
  }, [gameState]);

  const handleSquareClick = (row: number, col: number) => {
    // If it's not the current player's turn, do nothing
    if (currentPlayerId !== playerId) return;

    const piece = board[row][col];

    // If a piece is selected and we click on a possible move
    if (selectedPiece && possibleMoves.some(([r, c]) => r === row && c === col)) {
      const move: Move = {
        from: selectedPiece,
        to: [row, col],
      };
      
      // Check if this is a capture move
      const dx = row - selectedPiece[0];
      const dy = col - selectedPiece[1];
      
      if (Math.abs(dx) === 2) {
        // This is a capture move
        const capturedRow = selectedPiece[0] + dx / 2;
        const capturedCol = selectedPiece[1] + dy / 2;
        move.capturedPiece = [capturedRow, capturedCol];
      }
      
      onMove(move);
      setSelectedPiece(null);
      setPossibleMoves([]);
      return;
    }

    // If we click on an empty square with no piece selected, do nothing
    if (!piece) {
      setSelectedPiece(null);
      setPossibleMoves([]);
      return;
    }

    // If we click on an opponent's piece, do nothing
    if (piece.playerId !== playerId) return;

    // Select the piece and calculate possible moves
    setSelectedPiece([row, col]);
    calculatePossibleMoves(row, col, piece);
  };

  const calculatePossibleMoves = (row: number, col: number, piece: Piece) => {
    const directions = piece.isKing 
      ? [[-1, -1], [-1, 1], [1, -1], [1, 1]]
      : piece.playerId === '1' 
        ? [[1, -1], [1, 1]] 
        : [[-1, -1], [-1, 1]];

    const moves: [number, number][] = [];
    
    for (const [dx, dy] of directions) {
      // Check normal moves (one square)
      const newRow = row + dx;
      const newCol = col + dy;
      
      if (isValidPosition(newRow, newCol) && !board[newRow][newCol]) {
        moves.push([newRow, newCol]);
      }
      
      // Check capture moves (two squares)
      const captureRow = row + 2 * dx;
      const captureCol = col + 2 * dy;
      const jumpedRow = row + dx;
      const jumpedCol = col + dy;
      
      if (
        isValidPosition(captureRow, captureCol) &&
        !board[captureRow][captureCol] &&
        board[jumpedRow]?.[jumpedCol] &&
        board[jumpedRow][jumpedCol]?.playerId !== piece.playerId
      ) {
        moves.push([captureRow, captureCol]);
      }
    }
    
    setPossibleMoves(moves);
  };

  const isValidPosition = (row: number, col: number): boolean => {
    return row >= 0 && row < 8 && col >= 0 && col < 8;
  };

  const isPossibleMove = (row: number, col: number): boolean => {
    return possibleMoves.some(([r, c]) => r === row && c === col);
  };

  const isSelected = (row: number, col: number): boolean => {
    return selectedPiece ? selectedPiece[0] === row && selectedPiece[1] === col : false;
  };

  return (
    <div style={{ display: 'inline-block', border: '2px solid #333' }}>
      {board.map((row, rowIndex) => (
        <div key={rowIndex} style={{ display: 'flex' }}>
          {row.map((piece, colIndex) => (
            <Square
              key={`${rowIndex}-${colIndex}`}
              piece={piece}
              isSelected={isSelected(rowIndex, colIndex)}
              isPossibleMove={isPossibleMove(rowIndex, colIndex)}
              onClick={() => handleSquareClick(rowIndex, colIndex)}
              row={rowIndex}
              col={colIndex}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export default GameBoard;
