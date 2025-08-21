import React from 'react';

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInvite: () => void;
  email: string;
  onEmailChange: (email: string) => void;
}

const InviteModal: React.FC<InviteModalProps> = ({
  isOpen,
  onClose,
  onInvite,
  email,
  onEmailChange,
}) => {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '8px',
          width: '400px',
          maxWidth: '90%',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3>Inviter un joueur</h3>
        <div style={{ margin: '20px 0' }}>
          <label htmlFor="email" style={{ display: 'block', marginBottom: '8px' }}>
            Email du joueur à inviter :
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            style={{
              width: '100%',
              padding: '8px',
              fontSize: '16px',
              borderRadius: '4px',
              border: '1px solid #ccc',
            }}
            placeholder="email@exemple.com"
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button
            onClick={onClose}
            style={{
              padding: '8px 16px',
              backgroundColor: '#f5f5f5',
              border: '1px solid #ccc',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Annuler
          </button>
          <button
            onClick={onInvite}
            disabled={!email}
            style={{
              padding: '8px 16px',
              backgroundColor: email ? '#4CAF50' : '#cccccc',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: email ? 'pointer' : 'not-allowed',
            }}
          >
            Envoyer l'invitation
          </button>
        </div>
      </div>
    </div>
  );
};

export default InviteModal;
