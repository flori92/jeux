import React, { useState, useEffect } from 'react';
import './CheckersBoard.css';
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
    // Initialize the board directly from gameState.board
    if (gameState.board && Array.isArray(gameState.board)) {
      setBoard(gameState.board);
    } else {
      // Fallback: create empty board if no board is provided
      const newBoard = Array(8).fill(null).map(() => Array(8).fill(null));
      
      // If we have pieces but no board, place pieces on the board
      if (gameState.pieces) {
        const allPieces = Object.values(gameState.pieces).flat();
        if (Array.isArray(allPieces)) {
          allPieces.forEach((piece: Piece) => {
            if (piece && piece.position) {
              const [row, col] = piece.position;
              if (row >= 0 && row < 8 && col >= 0 && col < 8) {
                newBoard[row][col] = piece;
              }
            }
          });
        }
      }
      
      setBoard(newBoard);
    }
  }, [gameState.board, gameState.pieces, gameState.id]);

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
    const moves: [number, number][] = [];
    
    // Determine player color from gameState
    const player = gameState.players.find(p => p.id === piece.playerId);
    const isWhite = player?.color === 'white';
    
    // Define movement directions based on piece type and color
    const directions = piece.isKing 
      ? [[-1, -1], [-1, 1], [1, -1], [1, 1]]  // Kings move in all directions
      : isWhite 
        ? [[-1, -1], [-1, 1]]  // White moves up (decreasing row)
        : [[1, -1], [1, 1]];   // Black moves down (increasing row)

    // First check for captures (they are mandatory)
    const captures: [number, number][] = [];
    
    for (const [dx, dy] of [[-2, -2], [-2, 2], [2, -2], [2, 2]]) {
      const captureRow = row + dx;
      const captureCol = col + dy;
      const jumpedRow = row + dx / 2;
      const jumpedCol = col + dy / 2;
      
      if (
        isValidPosition(captureRow, captureCol) &&
        isValidPosition(jumpedRow, jumpedCol) &&
        !board[captureRow][captureCol] &&
        board[jumpedRow][jumpedCol] &&
        board[jumpedRow][jumpedCol]?.playerId !== piece.playerId
      ) {
        // Verify direction is valid for non-kings
        if (piece.isKing || directions.some(([ddx, ddy]) => ddx === dx / 2 && ddy === dy / 2)) {
          captures.push([captureRow, captureCol]);
        }
      }
    }
    
    // If captures are available, only show captures (mandatory)
    if (captures.length > 0) {
      setPossibleMoves(captures);
      return;
    }
    
    // Otherwise, show normal moves
    for (const [dx, dy] of directions) {
      const newRow = row + dx;
      const newCol = col + dy;
      
      if (isValidPosition(newRow, newCol) && !board[newRow][newCol]) {
        moves.push([newRow, newCol]);
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

  const renderSquare = (piece: Piece | null, row: number, col: number) => {
    const isDark = (row + col) % 2 === 1;
    const isSquareSelected = isSelected(row, col);
    const isSquarePossibleMove = isPossibleMove(row, col);
    
    return (
      <div
        key={`${row}-${col}`}
        className={`checkers-square ${isDark ? 'dark' : 'light'} ${
          isSquareSelected ? 'selected' : ''
        } ${isSquarePossibleMove ? 'possible-move' : ''}`}
        onClick={() => handleSquareClick(row, col)}
      >
        {piece && (
          <div
            className={`checkers-piece ${
              gameState.players.find(p => p.id === piece.playerId)?.color || 'white'
            } ${piece.isKing ? 'king' : ''}`}
          />
        )}
      </div>
    );
  };

  if (gameState.winner) {
    const winner = gameState.players.find(p => p.id === gameState.winner);
    return (
      <div className="checkers-game-over">
        <h2>🎉 Partie Terminée !</h2>
        <p>
          <strong>{winner?.name || 'Joueur inconnu'}</strong> a gagné !
        </p>
      </div>
    );
  }

  return (
    <div className="checkers-board-container">
      <div className="checkers-game-info">
        <h3>Partie de Dames</h3>
        <div className="current-player">
          Tour de : <span style={{ color: gameState.players.find(p => p.id === currentPlayerId)?.color }}>
            {gameState.players.find(p => p.id === currentPlayerId)?.name || 'Joueur'}
          </span>
        </div>
        <div className="game-status">
          {gameState.status === 'playing' ? 'En cours' : 'En attente'}
        </div>
      </div>

      <div className="checkers-board">
        {board.map((row, rowIndex) => (
          <div key={rowIndex} className="checkers-row">
            {row.map((piece, colIndex) => renderSquare(piece, rowIndex, colIndex))}
          </div>
        ))}
      </div>

      <div className="players-info">
        {gameState.players.map(player => {
          const playerPieces = board.flat().filter(p => p && p.playerId === player.id);
          return (
            <div key={player.id} className={`player-info ${player.id === currentPlayerId ? 'active' : ''}`}>
              <div className={`player-color ${player.color}`}></div>
              <span>{player.name}</span>
              <span className="pieces-count">Pièces: {playerPieces.length}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default GameBoard;
