import { useEffect, useState, useRef } from 'react';
import { PixelStage } from './features/character/PixelStage';
import { PillarBoard } from './features/pillars/PillarBoard';
import { HaradaPillarItem } from './features/pillars/types';
import { AuthModal } from './features/auth/AuthModal';
import { apiClient, DashboardData, AuthResponseData } from './shared/api/apiClient';

const INITIAL_PILLARS: HaradaPillarItem[] = [
  {
    slotIndex: 1,
    title: 'Body & Stamina',
    statCode: 'STR',
    statLevel: 1,
    actions: [
      { id: 'a1', slotIndex: 1, title: 'Run 20 minutes', xpReward: 25, completedToday: false },
      { id: 'a2', slotIndex: 2, title: '30 push-ups', xpReward: 25, completedToday: false }
    ]
  },
  {
    slotIndex: 2,
    title: 'Deep Learning',
    statCode: 'INT',
    statLevel: 1,
    actions: [
      { id: 'a3', slotIndex: 1, title: 'Read 20 pages book', xpReward: 25, completedToday: false },
      { id: 'a4', slotIndex: 2, title: 'Study 1 architecture topic', xpReward: 25, completedToday: false }
    ]
  },
  {
    slotIndex: 3,
    title: 'Sleep & Health',
    statCode: 'VIT',
    statLevel: 1,
    actions: [
      { id: 'a5', slotIndex: 1, title: 'Sleep before 11:30 PM', xpReward: 25, completedToday: false },
      { id: 'a6', slotIndex: 2, title: 'Drink 2L water', xpReward: 25, completedToday: false }
    ]
  },
  {
    slotIndex: 4,
    title: 'Reflection',
    statCode: 'WIS',
    statLevel: 1,
    actions: [
      { id: 'a7', slotIndex: 1, title: 'Daily review journal', xpReward: 25, completedToday: false },
      { id: 'a8', slotIndex: 2, title: '10 min mindfulness', xpReward: 25, completedToday: false }
    ]
  },
  {
    slotIndex: 5,
    title: 'Network & Service',
    statCode: 'CHA',
    statLevel: 1,
    actions: [
      { id: 'a9', slotIndex: 1, title: 'Send 1 gratitude note', xpReward: 25, completedToday: false },
      { id: 'a10', slotIndex: 2, title: 'Support 1 colleague', xpReward: 25, completedToday: false }
    ]
  },
  {
    slotIndex: 6,
    title: 'Core Craft',
    statCode: 'DEX',
    statLevel: 1,
    actions: [
      { id: 'a11', slotIndex: 1, title: 'Ship 1 clean commit', xpReward: 25, completedToday: false },
      { id: 'a12', slotIndex: 2, title: 'Refactor 1 module', xpReward: 25, completedToday: false }
    ]
  },
  {
    slotIndex: 7,
    title: 'Focus & Deep Work',
    statCode: 'FOC',
    statLevel: 1,
    actions: [
      { id: 'a13', slotIndex: 1, title: '90m deep work block', xpReward: 25, completedToday: false },
      { id: 'a14', slotIndex: 2, title: 'No phone during focus', xpReward: 25, completedToday: false }
    ]
  },
  {
    slotIndex: 8,
    title: 'Hardcore Grit',
    statCode: 'WIL',
    statLevel: 1,
    actions: [
      { id: 'a15', slotIndex: 1, title: 'Top priority task first', xpReward: 25, completedToday: false },
      { id: 'a16', slotIndex: 2, title: 'Cold shower reset', xpReward: 25, completedToday: false }
    ]
  }
];

export default function App() {
  const [pillars, setPillars] = useState<HaradaPillarItem[]>(() => {
    const saved = localStorage.getItem('harada_custom_pillars');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        /* ignore fallback */
      }
    }
    return INITIAL_PILLARS;
  });

  const [goalTitle, setGoalTitle] = useState<string>(() => {
    return localStorage.getItem('harada_custom_goal') || 'Master Daily Discipline';
  });

  const [characterName, setCharacterName] = useState('Harada Hero');
  const [level, setLevel] = useState(1);
  const [totalXp, setTotalXp] = useState(0);
  const [hp, setHp] = useState(100);
  const [maxHp, setMaxHp] = useState(100);
  const [streak, setStreak] = useState(1);
  const [celebrating, setCelebrating] = useState(false);
  const celebrationTimerRef = useRef<number | null>(null);

  const triggerCelebration = () => {
    if (celebrationTimerRef.current) {
      clearTimeout(celebrationTimerRef.current);
    }
    setCelebrating(true);
    celebrationTimerRef.current = window.setTimeout(() => {
      setCelebrating(false);
    }, 1500);
  };

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => !!apiClient.getAccessToken());
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  const syncFromDashboard = (data: DashboardData) => {
    setCharacterName(data.user.characterName);
    setLevel(data.user.characterLevel);
    setTotalXp(data.user.totalXp);
    setHp(data.user.hp);
    setMaxHp(data.user.maxHp);
    setStreak(data.user.currentStreak);
    setGoalTitle(data.goalTitle);
    setPillars(data.pillars);
    // Also backup to localStorage
    localStorage.setItem('harada_custom_goal', data.goalTitle);
    localStorage.setItem('harada_custom_pillars', JSON.stringify(data.pillars));
  };

  useEffect(() => {
    const loadRemoteDashboard = async () => {
      if (!apiClient.getAccessToken()) return;
      try {
        setSyncStatus('Syncing...');
        const dashboard = await apiClient.getDashboard();
        syncFromDashboard(dashboard);
        setIsAuthenticated(true);
        setSyncStatus(null);
      } catch (err: unknown) {
        console.warn('Could not sync with backend:', err);
        setSyncStatus('Offline');
      }
    };
    loadRemoteDashboard();
  }, [isAuthenticated]);

  const handleAuthSuccess = (authData: AuthResponseData) => {
    setIsAuthenticated(true);
    setCharacterName(authData.user.characterName);
    setLevel(authData.user.characterLevel);
    setTotalXp(authData.user.totalXp);
    setHp(authData.user.hp);
    setMaxHp(authData.user.maxHp);
    setStreak(authData.user.currentStreak);
    apiClient.getDashboard()
      .then(syncFromDashboard)
      .catch((err) => console.warn('Dashboard load error:', err));
  };

  const handleLogout = () => {
    apiClient.logout();
    setIsAuthenticated(false);
    setCharacterName('Harada Hero');
    setTotalXp(0);
    setLevel(1);
    setHp(100);
    setMaxHp(100);
    setStreak(1);
  };

  const handleToggleAction = async (slotIndex: number, actionId: string) => {
    if (isAuthenticated) {
      try {
        const updatedDashboard = await apiClient.toggleAction(actionId);
        syncFromDashboard(updatedDashboard);
        triggerCelebration();
        return;
      } catch (err: unknown) {
        console.error('Remote action toggle failed, falling back to local state:', err);
      }
    }

    // Local offline toggle
    setPillars((prev) => {
      const next = prev.map((pillar) => {
        if (pillar.slotIndex !== slotIndex) return pillar;
        return {
          ...pillar,
          actions: pillar.actions.map((action) => {
            if (action.id !== actionId) return action;
            const nextDone = !action.completedToday;
            const nextXp = Math.max(0, totalXp + (nextDone ? action.xpReward : -action.xpReward));
            setTotalXp(nextXp);
            setLevel(Math.floor(nextXp / 100) + 1);
            if (nextDone) {
              triggerCelebration();
            }
            return { ...action, completedToday: nextDone };
          })
        };
      });
      localStorage.setItem('harada_custom_pillars', JSON.stringify(next));
      return next;
    });
  };

  const handleAddAction = async (slotIndex: number, title: string) => {
    if (isAuthenticated) {
      try {
        const updatedDashboard = await apiClient.addAction(slotIndex, title);
        syncFromDashboard(updatedDashboard);
        return;
      } catch (err: unknown) {
        console.error('Remote action add failed, falling back to local state:', err);
      }
    }

    // Local offline add
    setPillars((prev) => {
      const next = prev.map((pillar) => {
        if (pillar.slotIndex !== slotIndex || pillar.actions.length >= 8) return pillar;
        return {
          ...pillar,
          actions: [
            ...pillar.actions,
            {
              id: `local-${Date.now()}`,
              slotIndex: pillar.actions.length + 1,
              title,
              xpReward: 25,
              completedToday: false
            }
          ]
        };
      });
      localStorage.setItem('harada_custom_pillars', JSON.stringify(next));
      return next;
    });
  };

  const handleUpdatePillar = async (slotIndex: number, newTitle: string) => {
    const nextPillars = pillars.map((p) =>
      p.slotIndex === slotIndex ? { ...p, title: newTitle } : p
    );
    setPillars(nextPillars);
    localStorage.setItem('harada_custom_pillars', JSON.stringify(nextPillars));

    if (isAuthenticated) {
      try {
        const updated = await apiClient.updatePillar(slotIndex, newTitle);
        syncFromDashboard(updated);
      } catch (err: unknown) {
        console.error('Remote update pillar failed:', err);
      }
    }
  };

  const handleUpdateGoal = async (newTitle: string, purpose?: string) => {
    setGoalTitle(newTitle);
    localStorage.setItem('harada_custom_goal', newTitle);

    if (isAuthenticated) {
      try {
        const updated = await apiClient.updateGoal(newTitle, purpose);
        syncFromDashboard(updated);
      } catch (err: unknown) {
        console.error('Remote update goal failed:', err);
      }
    }
  };

  const handleDeleteAction = (slotIndex: number, actionId: string) => {
    const nextPillars = pillars.map((p) => {
      if (p.slotIndex !== slotIndex) return p;
      return {
        ...p,
        actions: p.actions.filter((a) => a.id !== actionId)
      };
    });
    setPillars(nextPillars);
    localStorage.setItem('harada_custom_pillars', JSON.stringify(nextPillars));
  };

  const handleUpdateAction = (slotIndex: number, actionId: string, newTitle: string) => {
    const nextPillars = pillars.map((p) => {
      if (p.slotIndex !== slotIndex) return p;
      return {
        ...p,
        actions: p.actions.map((a) => (a.id === actionId ? { ...a, title: newTitle } : a))
      };
    });
    setPillars(nextPillars);
    localStorage.setItem('harada_custom_pillars', JSON.stringify(nextPillars));
  };

  return (
    <main className="app-shell">
      {/* Top Connection & Status Bar */}
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '11px',
          padding: '4px 2px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ color: isAuthenticated ? 'var(--accent-green)' : 'var(--accent-gold)' }}>
            {isAuthenticated ? '● ONLINE' : '○ OFFLINE DEMO'}
          </span>
          {syncStatus && <span style={{ color: 'var(--text-muted)' }}>({syncStatus})</span>}
        </div>
        <div>
          {isAuthenticated ? (
            <button
              type="button"
              className="pixel-btn"
              style={{ padding: '3px 8px', fontSize: '10px' }}
              onClick={handleLogout}
            >
              LOGOUT
            </button>
          ) : (
            <button
              type="button"
              className="pixel-btn"
              style={{ padding: '3px 8px', fontSize: '10px' }}
              onClick={() => setShowAuthModal(true)}
            >
              LOGIN / SYNC
            </button>
          )}
        </div>
      </header>

      <PixelStage
        characterName={characterName}
        level={level}
        totalXp={totalXp}
        hp={hp}
        maxHp={maxHp}
        streak={streak}
        celebrating={celebrating}
      />

      <PillarBoard
        goalTitle={goalTitle}
        pillars={pillars}
        onToggleAction={handleToggleAction}
        onAddAction={handleAddAction}
        onUpdatePillar={handleUpdatePillar}
        onUpdateGoal={handleUpdateGoal}
        onDeleteAction={handleDeleteAction}
        onUpdateAction={handleUpdateAction}
      />

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onAuthSuccess={handleAuthSuccess}
      />
    </main>
  );
}
