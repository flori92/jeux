import React from 'react';

interface GameSelectorProps {
  onGameSelect: (gameType: 'checkers' | 'ludo') => void;
}

const GameSelector: React.FC<GameSelectorProps> = ({ onGameSelect }) => {
  return (
    <div className="game-selector">
      <h2>Choisissez votre jeu</h2>
      <div className="game-options">
        <div className="game-card" onClick={() => onGameSelect('checkers')}>
          <div className="game-icon">♛</div>
          <h3>Jeu de Dames</h3>
          <p>Jeu classique de stratégie sur plateau 8x8</p>
          <ul>
            <li>2 joueurs</li>
            <li>Déplacements diagonaux</li>
            <li>Captures obligatoires</li>
            <li>Promotion en dame</li>
          </ul>
          <button className="btn btn-primary">Jouer aux Dames</button>
        </div>

        <div className="game-card" onClick={() => onGameSelect('ludo')}>
          <div className="game-icon">🎲</div>
          <h3>Ludo</h3>
          <p>Jeu de parcours avec dés pour 2-4 joueurs</p>
          <ul>
            <li>2 à 4 joueurs</li>
            <li>Lancé de dé</li>
            <li>Course vers l'arrivée</li>
            <li>Captures possibles</li>
          </ul>
          <button className="btn btn-secondary">Jouer au Ludo</button>
        </div>
      </div>
    </div>
  );
};

export default GameSelector;
