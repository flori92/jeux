import React, { useState } from 'react';
import type { Player } from '../types/game.types';
import InviteModal from './InviteModal.tsx';

interface LobbyProps {
  player: Player;
  onInvitePlayer: (email: string) => void;
  pendingInvites: Array<{
    id: string;
    from: string;
    gameId: string;
  }>;
  onAcceptInvite: (inviteId: string) => void;
  onRejectInvite: (inviteId: string) => void;
}

const Lobby: React.FC<LobbyProps> = ({
  player,
  onInvitePlayer,
  pendingInvites,
  onAcceptInvite,
  onRejectInvite,
}) => {
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [opponentEmail, setOpponentEmail] = useState('');

  const handleInvitePlayer = () => {
    if (opponentEmail.trim()) {
      onInvitePlayer(opponentEmail.trim());
      setOpponentEmail('');
      setShowInviteModal(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <h2>Salon d'attente</h2>
      <div style={{ marginBottom: '20px' }}>
        <h3>Bienvenue, {player.name}!</h3>
        <p>Votre ID de joueur: {player.id}</p>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={() => setShowInviteModal(true)}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Inviter un joueur
        </button>
      </div>

      {pendingInvites.length > 0 && (
        <div style={{ marginTop: '20px' }}>
          <h3>Invitations en attente</h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {pendingInvites.map((invite) => (
              <li 
                key={invite.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px',
                  backgroundColor: '#f5f5f5',
                  marginBottom: '10px',
                  borderRadius: '4px',
                }}
              >
                <span>Invitation de {invite.from}</span>
                <div>
                  <button 
                    onClick={() => onAcceptInvite(invite.id)}
                    style={{
                      marginRight: '10px',
                      padding: '5px 10px',
                      backgroundColor: '#4CAF50',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                    }}
                  >
                    Accepter
                  </button>
                  <button 
                    onClick={() => onRejectInvite(invite.id)}
                    style={{
                      padding: '5px 10px',
                      backgroundColor: '#f44336',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                    }}
                  >
                    Refuser
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <InviteModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        onInvite={handleInvitePlayer}
        email={opponentEmail}
        onEmailChange={setOpponentEmail}
      />
    </div>
  );
};

export default Lobby;
