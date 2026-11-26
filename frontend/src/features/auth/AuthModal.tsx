import { useState } from 'react';
import { apiClient, AuthResponseData } from '../../shared/api/apiClient';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (authData: AuthResponseData) => void;
}

export function AuthModal({ isOpen, onClose, onAuthSuccess }: AuthModalProps) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [characterName, setCharacterName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      let authData: AuthResponseData;
      if (isRegister) {
        if (!characterName.trim()) {
          setErrorMsg('Character name is required');
          setLoading(false);
          return;
        }
        authData = await apiClient.register(email.trim(), password, characterName.trim());
      } else {
        authData = await apiClient.login(email.trim(), password);
      }
      onAuthSuccess(authData);
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Authentication failed';
      setErrorMsg(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 999,
        padding: '16px'
      }}
    >
      <div
        className="pixel-box"
        style={{
          width: '100%',
          maxWidth: '360px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}
      >
        <div className="stage-header">
          <strong>{isRegister ? 'NEW CHARACTER' : 'HERO LOGIN'}</strong>
          <button
            type="button"
            className="pixel-btn"
            style={{ padding: '2px 8px', fontSize: '11px' }}
            onClick={onClose}
          >
            X
          </button>
        </div>

        {errorMsg && (
          <div
            style={{
              padding: '6px 8px',
              backgroundColor: 'rgba(239, 68, 68, 0.2)',
              border: '1px solid var(--accent-red)',
              color: 'var(--accent-red)',
              fontSize: '11px'
            }}
          >
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {isRegister && (
            <div>
              <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Character Name</label>
              <input
                className="pixel-input"
                style={{ width: '100%', marginTop: '3px' }}
                type="text"
                required
                placeholder="e.g. Musashi"
                value={characterName}
                onChange={(e) => setCharacterName(e.target.value)}
              />
            </div>
          )}

          <div>
            <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Email</label>
            <input
              className="pixel-input"
              style={{ width: '100%', marginTop: '3px' }}
              type="email"
              required
              placeholder="hero@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Password</label>
            <input
              className="pixel-input"
              style={{ width: '100%', marginTop: '3px' }}
              type="password"
              required
              minLength={6}
              placeholder="••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            className="pixel-btn"
            type="submit"
            disabled={loading}
            style={{ marginTop: '8px', width: '100%' }}
          >
            {loading ? 'CONNECTING...' : isRegister ? 'SPAWN CHARACTER' : 'ENTER QUEST'}
          </button>
        </form>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginTop: '4px' }}>
          <button
            type="button"
            style={{ background: 'none', border: 'none', color: 'var(--accent-cyan)', cursor: 'pointer', padding: 0 }}
            onClick={() => {
              setIsRegister(!isRegister);
              setErrorMsg(null);
            }}
          >
            {isRegister ? 'Already have a hero? Login' : 'Create new character'}
          </button>
          <button
            type="button"
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0 }}
            onClick={onClose}
          >
            Play Offline
          </button>
        </div>
      </div>
    </div>
  );
}
