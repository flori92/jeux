import React from 'react';
import { Piece } from '../types/game.types';

interface SquareProps {
  piece: Piece | null;
  isSelected: boolean;
  isPossibleMove: boolean;
  onClick: () => void;
  row: number;
  col: number;
}

export const Square: React.FC<SquareProps> = ({
  piece,
  isSelected,
  isPossibleMove,
  onClick,
  row,
  col,
}) => {
  const isDark = (row + col) % 2 === 1;
  const backgroundColor = isDark ? '#769656' : '#eeeed2';
  const highlightColor = isSelected ? 'rgba(255, 255, 0, 0.4)' : 'transparent';
  const possibleMoveHighlight = isPossibleMove ? 'rgba(0, 255, 0, 0.4)' : 'transparent';

  return (
    <div
      onClick={onClick}
      style={{
        width: '60px',
        height: '60px',
        backgroundColor,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        cursor: 'pointer',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: highlightColor || possibleMoveHighlight,
          zIndex: 1,
        }}
      />
      {piece && (
        <div
          style={{
            width: '80%',
            height: '80%',
            borderRadius: '50%',
            backgroundColor: piece.playerId === '1' ? '#000' : '#fff',
            border: '2px solid #333',
            zIndex: 2,
            position: 'relative',
          }}
        >
          {piece.isKing && (
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                color: piece.playerId === '1' ? '#fff' : '#000',
                fontWeight: 'bold',
                fontSize: '12px',
              }}
            >
              K
            </div>
          )}
        </div>
      )}
    </div>
  );
};
