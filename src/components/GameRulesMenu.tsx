import React, { useState, useEffect } from 'react';
import './GameRulesMenu.css';

interface GameRulesMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (rules: GameRules) => void;
  initialRules: GameRules;
}

export interface GameRules {
  allowBackwardInEndZone: boolean;
  requireAllPiecesInEndZone: boolean;
}

const GameRulesMenu: React.FC<GameRulesMenuProps> = ({
  isOpen,
  onClose,
  onSave,
  initialRules
}) => {
  const [rules, setRules] = useState<GameRules>(initialRules);

  useEffect(() => {
    if (isOpen) {
      setRules(initialRules);
    }
  }, [isOpen, initialRules]);

  const handleRuleChange = (rule: keyof GameRules) => {
    setRules(prev => ({
      ...prev,
      [rule]: !prev[rule]
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(rules);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="rules-menu-overlay">
      <div className="rules-menu">
        <h2>Règles du jeu</h2>
        <form onSubmit={handleSubmit}>
          <div className="rule-option">
            <label className="switch">
              <input
                type="checkbox"
                checked={rules.allowBackwardInEndZone}
                onChange={() => handleRuleChange('allowBackwardInEndZone')}
              />
              <span className="slider round"></span>
            </label>
            <span className="rule-label">Autoriser le recul dans la zone de fin</span>
            <div className="rule-description">
              Permet aux pions de reculer dans leur zone de fin
            </div>
          </div>

          <div className="rule-option">
            <label className="switch">
              <input
                type="checkbox"
                checked={rules.requireAllPiecesInEndZone}
                onChange={() => handleRuleChange('requireAllPiecesInEndZone')}
              />
              <span className="slider round"></span>
            </label>
            <span className="rule-label">Pions alignés</span>
            <div className="rule-description">
              Tous les pions doivent être dans la zone de fin avant d'atteindre la case finale
            </div>
          </div>

          <div className="rules-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>
              Annuler
            </button>
            <button type="submit" className="save-btn">
              Enregistrer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GameRulesMenu;
