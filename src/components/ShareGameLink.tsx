import React, { useState } from 'react';
import './ShareGameLink.css';

interface ShareGameLinkProps {
  gameId: string;
  onClose: () => void;
}

const ShareGameLink: React.FC<ShareGameLinkProps> = ({ gameId, onClose }) => {
  const [copied, setCopied] = useState(false);
  
  const gameLink = `${window.location.origin}/game/${gameId}`;
  
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(gameLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback pour les navigateurs plus anciens
      const textArea = document.createElement('textarea');
      textArea.value = gameLink;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareViaEmail = () => {
    const subject = encodeURIComponent('Invitation à jouer');
    const body = encodeURIComponent(`Salut ! Je t'invite à jouer avec moi. Clique sur ce lien pour rejoindre la partie : ${gameLink}`);
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  const shareViaWhatsApp = () => {
    const message = encodeURIComponent(`Salut ! Je t'invite à jouer avec moi. Clique sur ce lien pour rejoindre la partie : ${gameLink}`);
    window.open(`https://wa.me/?text=${message}`);
  };

  const shareViaTelegram = () => {
    const message = encodeURIComponent(`Salut ! Je t'invite à jouer avec moi. Clique sur ce lien pour rejoindre la partie : ${gameLink}`);
    window.open(`https://t.me/share/url?url=${gameLink}&text=${message}`);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content share-modal">
        <div className="modal-header">
          <h3>Partager la partie</h3>
          <button onClick={onClose} className="modal-close">×</button>
        </div>
        
        <div className="share-content">
          <p>Partagez ce lien avec vos amis pour qu'ils puissent rejoindre votre partie :</p>
          
          <div className="link-container">
            <input 
              type="text" 
              value={gameLink} 
              readOnly 
              className="game-link-input"
            />
            <button 
              onClick={copyToClipboard} 
              className={`copy-btn ${copied ? 'copied' : ''}`}
            >
              {copied ? '✓ Copié !' : '📋 Copier'}
            </button>
          </div>
          
          <div className="share-options">
            <h4>Ou partager via :</h4>
            <div className="share-buttons">
              <button onClick={shareViaEmail} className="share-btn email">
                📧 Email
              </button>
              <button onClick={shareViaWhatsApp} className="share-btn whatsapp">
                💬 WhatsApp
              </button>
              <button onClick={shareViaTelegram} className="share-btn telegram">
                ✈️ Telegram
              </button>
            </div>
          </div>
          
          <div className="share-instructions">
            <h4>Instructions :</h4>
            <ul>
              <li>Copiez le lien et envoyez-le à vos amis</li>
              <li>Ils peuvent cliquer directement sur le lien pour rejoindre</li>
              <li>Ou coller le lien dans le champ "Rejoindre une partie"</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareGameLink;
