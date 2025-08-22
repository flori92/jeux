import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../../store';
import { updateSettings } from '../../store';
import type { GameSettings } from '../../types/game.types';
import './SettingsMenu.css';

interface SettingsMenuProps {
  onStartGame: () => void;
  onClose: () => void;
}

const SettingsMenu: React.FC<SettingsMenuProps> = ({ onStartGame, onClose }) => {
  const dispatch = useDispatch();
  const settings = useSelector((state: RootState) => state.settings);

  const handleSettingChange = (key: keyof GameSettings, value: boolean) => {
    dispatch(updateSettings({ [key]: value }));
  };

  return (
    <div className="settings-menu">
      <h2>Paramètres du jeu</h2>
      
      <div className="setting-option">
        <label>
          <input
            type="checkbox"
            checked={settings.enableSafeZones}
            onChange={(e) => handleSettingChange('enableSafeZones', e.target.checked)}
          />
          Activer les cases sécurisées
        </label>
        <p className="setting-description">
          Les pions sur les cases sécurisées ne peuvent pas être capturés.
        </p>
      </div>

      <div className="setting-option">
        <label>
          <input
            type="checkbox"
            checked={settings.requireAlignedPiecesForWin}
            onChange={(e) => handleSettingChange('requireAlignedPiecesForWin', e.target.checked)}
          />
          Alignement requis pour gagner
        </label>
        <p className="setting-description">
          Tous les pions doivent être alignés sur les cases de fin avant de pouvoir gagner.
        </p>
      </div>

      <div className="settings-actions">
        <button onClick={onClose} className="btn btn-secondary">
          Annuler
        </button>
        <button onClick={onStartGame} className="btn btn-primary">
          Démarrer la partie
        </button>
      </div>
    </div>
  );
};

export default SettingsMenu;
