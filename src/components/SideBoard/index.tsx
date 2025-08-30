import React from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';
import './SideBoard.css';

interface SideBoardProps {
  onRollDice?: () => void;
  onEndTurn?: () => void;
  canRollDice?: boolean;
  canEndTurn?: boolean;
}

export const SideBoard: React.FC<SideBoardProps> = ({ onRollDice, onEndTurn, canRollDice, canEndTurn }) => {
  const { 
    currentPlayerId, 
    players, 
    diceValue, 
    gameStatus, 
    winner 
  } = useSelector((state: RootState) => ({
    currentPlayerId: state.game.currentPlayerId,
    players: state.game.players,
    diceValue: state.game.diceValue,
    gameStatus: state.game.gameStatus,
    winner: state.game.winner
  }));

  // Trier les joueurs par ordre de score (du plus élevé au plus bas)
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

  return (
    <div className="side-board">
      <div className="game-status">
        <h3>État du jeu</h3>
        <div className={`status-indicator ${gameStatus}`}>
          {gameStatus === 'waiting' ? 'En attente des joueurs...' : 
           gameStatus === 'playing' ? 'En cours' :
           gameStatus === 'finished' ? 'Terminé' : 'Inconnu'}
        </div>
        
        {winner && (
          <div className="winner-banner">
            🎉 {winner.name} a gagné ! 🎉
          </div>
        )}
      </div>

      <div className="dice-container">
        <h3>Dé</h3>
        <div className="dice-value">
          {diceValue || '-'}
        </div>
        <button 
          className="roll-button"
          disabled={!canRollDice || gameStatus !== 'playing'}
          onClick={onRollDice}
        >
          Lancer le dé
        </button>
      </div>

      <div className="players-list">
        <h3>Joueurs</h3>
        <div className="players">
          {sortedPlayers.map((player) => (
            <div 
              key={player.id} 
              className={`player-card ${player.id === currentPlayerId ? 'current' : ''}`}
            >
              <div 
                className="player-color" 
                style={{ backgroundColor: player.color }}
              />
              <div className="player-info">
                <div className="player-name">
                  {player.name}
                  {player.id === currentPlayerId && ' (Vous)'}
                </div>
                <div className="player-score">Score: {player.score}</div>
                <div className="player-pieces">
                  Pièces arrivées: {player.pieces.filter(p => p.position === 'end').length} / 4
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="game-actions">
        <h3>Actions</h3>
        <div className="buttons">
          <button className="action-button">
            Règles du jeu
          </button>
          {canEndTurn && (
            <button className="action-button" onClick={onEndTurn}>
              Finir le tour
            </button>
          )}
          <button className="action-button">
            Abandonner
          </button>
        </div>
      </div>
    </div>
  );
};

export default SideBoard;
