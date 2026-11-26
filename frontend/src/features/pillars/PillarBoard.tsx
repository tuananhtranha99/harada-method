import { useState } from 'react';
import { HaradaPillarItem, HaradaActionItem } from './types';

interface PillarBoardProps {
  goalTitle: string;
  pillars: HaradaPillarItem[];
  onToggleAction: (slotIndex: number, actionId: string) => void;
  onAddAction: (slotIndex: number, title: string) => void;
  onUpdatePillar: (slotIndex: number, title: string) => void;
  onUpdateGoal: (title: string, purpose?: string) => void;
  onDeleteAction?: (slotIndex: number, actionId: string) => void;
  onUpdateAction?: (slotIndex: number, actionId: string, title: string) => void;
}

export function isPillarLit(pillar: HaradaPillarItem): boolean {
  return pillar.actions.length > 0 && pillar.actions.every((a) => a.completedToday);
}

// 3x3 Slot Mapping around center (clockwise / compass order):
// [1: TL] [2: TC] [3: TR]
// [8: ML] [CENTER][4: MR]
// [7: BL] [6: BC] [5: BR]
const SLOT_COORDINATES: Record<number, { row: number; col: number; label: string }> = {
  1: { row: 1, col: 1, label: 'TOP-LEFT' },
  2: { row: 1, col: 2, label: 'TOP' },
  3: { row: 1, col: 3, label: 'TOP-RIGHT' },
  4: { row: 2, col: 3, label: 'RIGHT' },
  5: { row: 3, col: 3, label: 'BOTTOM-RIGHT' },
  6: { row: 3, col: 2, label: 'BOTTOM' },
  7: { row: 3, col: 1, label: 'BOTTOM-LEFT' },
  8: { row: 2, col: 1, label: 'LEFT' }
};

const STAT_COLORS: Record<string, string> = {
  STR: 'var(--stat-str)',
  INT: 'var(--stat-int)',
  VIT: 'var(--stat-vit)',
  WIS: 'var(--stat-wis)',
  CHA: 'var(--stat-cha)',
  DEX: 'var(--stat-dex)',
  FOC: 'var(--stat-foc)',
  WIL: 'var(--stat-wil)'
};

export function PillarBoard({
  goalTitle,
  pillars,
  onToggleAction,
  onAddAction,
  onUpdatePillar,
  onUpdateGoal,
  onDeleteAction,
  onUpdateAction
}: PillarBoardProps) {
  const [viewMode, setViewMode] = useState<'mandala' | 'matrix9x9'>('mandala');
  const [selectedSlot, setSelectedSlot] = useState<number>(1);
  const [newActionTitle, setNewActionTitle] = useState('');

  // Modals for renaming
  const [editingGoal, setEditingGoal] = useState(false);
  const [goalInput, setGoalInput] = useState(goalTitle);

  const [editingPillarSlot, setEditingPillarSlot] = useState<number | null>(null);
  const [pillarInput, setPillarInput] = useState('');

  const [editingActionItem, setEditingActionItem] = useState<{ slotIndex: number; action: HaradaActionItem } | null>(null);
  const [actionInput, setActionInput] = useState('');

  const activePillar = pillars.find((p) => p.slotIndex === selectedSlot) ?? pillars[0];
  const litCount = pillars.filter(isPillarLit).length;
  const totalActionsCount = pillars.reduce((sum, p) => sum + p.actions.length, 0);
  const completedActionsCount = pillars.reduce(
    (sum, p) => sum + p.actions.filter((a) => a.completedToday).length,
    0
  );
  const completionPercentage =
    totalActionsCount > 0 ? Math.round((completedActionsCount / totalActionsCount) * 100) : 0;

  const handleSubmitNewAction = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newActionTitle.trim();
    if (!trimmed || activePillar.actions.length >= 8) return;
    onAddAction(activePillar.slotIndex, trimmed);
    setNewActionTitle('');
  };

  const handleOpenEditPillar = (slotIndex: number) => {
    const p = pillars.find((item) => item.slotIndex === slotIndex);
    if (!p) return;
    setEditingPillarSlot(slotIndex);
    setPillarInput(p.title);
  };

  const handleSavePillar = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPillarSlot !== null && pillarInput.trim()) {
      onUpdatePillar(editingPillarSlot, pillarInput.trim());
      setEditingPillarSlot(null);
    }
  };

  const handleSaveGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (goalInput.trim()) {
      onUpdateGoal(goalInput.trim());
      setEditingGoal(false);
    }
  };

  const handleSaveAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingActionItem && actionInput.trim() && onUpdateAction) {
      onUpdateAction(editingActionItem.slotIndex, editingActionItem.action.id, actionInput.trim());
      setEditingActionItem(null);
    }
  };

  const handleDeleteAction = () => {
    if (editingActionItem && onDeleteAction) {
      onDeleteAction(editingActionItem.slotIndex, editingActionItem.action.id);
      setEditingActionItem(null);
    }
  };

  return (
    <section className="pixel-box" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      {/* View Switcher Bar */}
      <div className="view-mode-tabs">
        <button
          type="button"
          className={`view-tab-btn ${viewMode === 'mandala' ? 'active' : ''}`}
          onClick={() => setViewMode('mandala')}
        >
          🔲 3x3 MANDALA HUB
        </button>
        <button
          type="button"
          className={`view-tab-btn ${viewMode === 'matrix9x9' ? 'active' : ''}`}
          onClick={() => setViewMode('matrix9x9')}
        >
          🌐 OPEN WINDOW 64 (9x9)
        </button>
      </div>

      {viewMode === 'mandala' ? (
        <>
          {/* =========================================================
              LEVEL 1 (TOP): SUB-MANDALA (3x3 Action Window of Active Pillar)
             ========================================================= */}
          <div className="sub-mandala-section" style={{ marginTop: 0, paddingTop: 0, borderTop: 'none' }}>
            <div className="sub-mandala-header">
              <div className="sub-mandala-title">
                <span
                  className="pillar-stat-chip"
                  style={{ color: STAT_COLORS[activePillar.statCode] || 'var(--accent-cyan)' }}
                >
                  {activePillar.statCode}
                </span>
                <span>
                  PILLAR {activePillar.slotIndex}: <strong>{activePillar.title}</strong>
                </span>
                <button
                  type="button"
                  className="pixel-btn"
                  style={{ padding: '2px 6px', fontSize: '9px', marginLeft: '6px' }}
                  onClick={() => handleOpenEditPillar(activePillar.slotIndex)}
                  title="Rename this pillar"
                >
                  ✏️ RENAME
                </button>
              </div>
              <span className="badge badge-gold">
                {activePillar.actions.filter((a) => a.completedToday).length}/{activePillar.actions.length} DONE
              </span>
            </div>

            {/* 3x3 Grid of 8 Actions around the Pillar */}
            <div className="actions-3x3-grid">
              {/* Center Tile of Action 3x3: The Pillar itself (Clickable to Rename) */}
              <div
                className="action-3x3-center-pillar"
                onClick={() => handleOpenEditPillar(activePillar.slotIndex)}
                style={{ cursor: 'pointer', position: 'relative' }}
                title="Click to rename this pillar"
              >
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 800,
                    color: STAT_COLORS[activePillar.statCode] || 'var(--accent-cyan)'
                  }}
                >
                  {activePillar.statCode} PILLAR
                </span>
                <span style={{ fontSize: '9px', color: 'var(--text-main)', marginTop: '2px', fontWeight: 600 }}>
                  {activePillar.title}
                </span>
                <span style={{ fontSize: '8px', color: 'var(--accent-gold)', marginTop: '2px' }}>
                  ✏️ TAP TO RENAME
                </span>
                {isPillarLit(activePillar) && (
                  <span style={{ fontSize: '10px', color: 'var(--accent-gold)', marginTop: '2px' }}>
                    🔥 LIT UP!
                  </span>
                )}
              </div>

              {/* 8 Action Slots around the Pillar */}
              {[1, 2, 3, 4, 5, 6, 7, 8].map((slot) => {
                const action: HaradaActionItem | undefined = activePillar.actions[slot - 1];
                const coord = SLOT_COORDINATES[slot];

                if (!action) {
                  return (
                    <button
                      key={`empty-action-${slot}`}
                      type="button"
                      style={{ gridRow: coord.row, gridColumn: coord.col }}
                      className="action-3x3-cell empty"
                      onClick={() => {
                        const inputEl = document.getElementById('action-input-field');
                        inputEl?.focus();
                      }}
                    >
                      <span style={{ fontSize: '14px' }}>+</span>
                      <span style={{ fontSize: '8px' }}>SLOT {slot}</span>
                    </button>
                  );
                }

                return (
                  <div
                    key={action.id}
                    style={{ gridRow: coord.row, gridColumn: coord.col }}
                    className={`action-3x3-cell ${action.completedToday ? 'done' : ''}`}
                  >
                    <div
                      style={{ width: '100%', cursor: 'pointer' }}
                      onClick={() => onToggleAction(activePillar.slotIndex, action.id)}
                    >
                      <span className="action-3x3-title">{action.title}</span>
                    </div>

                    <div className="action-3x3-footer">
                      <span
                        className="action-3x3-xp"
                        onClick={() => onToggleAction(activePillar.slotIndex, action.id)}
                        style={{ cursor: 'pointer' }}
                      >
                        +{action.xpReward} XP
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <button
                          type="button"
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '10px',
                            padding: '1px',
                            color: 'var(--text-muted)'
                          }}
                          onClick={() => {
                            setEditingActionItem({ slotIndex: activePillar.slotIndex, action });
                            setActionInput(action.title);
                          }}
                          title="Edit action text"
                        >
                          ✏️
                        </button>
                        <span
                          className="action-check-badge"
                          style={{ cursor: 'pointer' }}
                          onClick={() => onToggleAction(activePillar.slotIndex, action.id)}
                        >
                          {action.completedToday ? '✓' : '○'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick Add Action Form */}
            {activePillar.actions.length < 8 && (
              <form className="add-form" onSubmit={handleSubmitNewAction}>
                <input
                  id="action-input-field"
                  className="pixel-input"
                  type="text"
                  placeholder={`Add action for ${activePillar.statCode} (max 8)...`}
                  value={newActionTitle}
                  onChange={(e) => setNewActionTitle(e.target.value)}
                />
                <button className="pixel-btn" type="submit">
                  + ADD TO GRID
                </button>
              </form>
            )}
          </div>

          {/* =========================================================
              LEVEL 2 (BOTTOM): CORE 3x3 MANDALA HUB
             ========================================================= */}
          <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '2px dashed rgba(55, 65, 99, 0.6)' }}>
            <div
              style={{
                fontSize: '11px',
                fontWeight: 700,
                color: 'var(--text-muted)',
                marginBottom: '8px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <span>★ 3x3 MANDALA (CLICK TO SWITCH OR ✏️ RENAME) ★</span>
              <span style={{ color: 'var(--accent-gold)' }}>{litCount}/8 LIT</span>
            </div>

            <div className="mandala-matrix">
              {/* Center Core Goal (Clickable to Edit) */}
              <div
                className="mandala-cell mandala-core-goal"
                onClick={() => {
                  setGoalInput(goalTitle);
                  setEditingGoal(true);
                }}
                style={{ cursor: 'pointer' }}
                title="Click to edit Core Goal"
              >
                <span className="core-goal-badge">★ HARADA CORE ★</span>
                <span className="core-goal-title">{goalTitle}</span>
                <span style={{ fontSize: '8px', color: 'var(--accent-gold)', marginBottom: '3px' }}>
                  ✏️ TAP TO EDIT
                </span>
                <div className="core-lit-meter">
                  <span>{litCount}/8 LIT</span>
                  <span>•</span>
                  <span>{completionPercentage}%</span>
                </div>
              </div>

              {/* 8 Surrounding Pillars */}
              {[1, 2, 3, 4, 5, 6, 7, 8].map((slot) => {
                const pillar = pillars.find((p) => p.slotIndex === slot);
                if (!pillar) return null;
                const lit = isPillarLit(pillar);
                const isSelected = pillar.slotIndex === activePillar.slotIndex;
                const statColor = STAT_COLORS[pillar.statCode] || 'var(--accent-gold)';
                const completedCount = pillar.actions.filter((a) => a.completedToday).length;

                const coord = SLOT_COORDINATES[slot];

                return (
                  <button
                    key={pillar.slotIndex}
                    type="button"
                    style={{ gridRow: coord.row, gridColumn: coord.col }}
                    className={`mandala-cell mandala-pillar ${isSelected ? 'selected' : ''} ${lit ? 'lit' : ''}`}
                    onClick={() => setSelectedSlot(pillar.slotIndex)}
                  >
                    <div className="pillar-header-row">
                      <span className="pillar-stat-chip" style={{ color: statColor }}>
                        {pillar.statCode}
                      </span>
                      <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>
                        {completedCount}/{pillar.actions.length}
                      </span>
                    </div>

                    <span className="pillar-title-text">{pillar.title}</span>

                    {/* 8-dot visual progress indicator */}
                    <div className="pillar-action-dots">
                      {Array.from({ length: 8 }).map((_, idx) => {
                        const action = pillar.actions[idx];
                        const isCompleted = action?.completedToday;
                        const hasAction = !!action;
                        return (
                          <div
                            key={idx}
                            className={`action-dot ${hasAction ? 'filled' : ''} ${isCompleted ? 'completed' : ''}`}
                          />
                        );
                      })}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      ) : (
        /* =========================================================
           OPEN WINDOW 64: FULL 9x9 SHOHEI OHTANI MASTER MATRIX
           ========================================================= */
        <div className="matrix-9x9-wrapper">
          <div style={{ marginBottom: '6px', fontSize: '11px', color: 'var(--text-muted)' }}>
            ★ <strong>Shohei Ohtani 64-Grid Matrix</strong>: Tap any action to check off, tap headers to switch!
          </div>
          <div className="matrix-9x9-scroll">
            <div className="matrix-9x9-grid">
              {[0, 1, 2].map((blockRow) =>
                [0, 1, 2].map((blockCol) => {
                  const isCenterBlock = blockRow === 1 && blockCol === 1;

                  if (isCenterBlock) {
                    return (
                      <div
                        key="center-block"
                        style={{
                          gridRow: '4 / span 3',
                          gridColumn: '4 / span 3',
                          display: 'grid',
                          gridTemplateColumns: 'repeat(3, 1fr)',
                          gap: '2px',
                          border: '2px solid var(--accent-gold)'
                        }}
                      >
                        {[1, 2, 3, 8, 0, 4, 7, 6, 5].map((slot) => {
                          if (slot === 0) {
                            return (
                              <div
                                key="core-center"
                                className="cell-9x9 core-goal-center"
                                style={{ cursor: 'pointer' }}
                                onClick={() => {
                                  setGoalInput(goalTitle);
                                  setEditingGoal(true);
                                }}
                              >
                                <span style={{ fontSize: '7px', color: 'var(--accent-gold)' }}>CORE ✏️</span>
                                <span style={{ fontSize: '8px' }}>{goalTitle}</span>
                              </div>
                            );
                          }
                          const pillar = pillars.find((p) => p.slotIndex === slot);
                          return (
                            <div
                              key={`center-pillar-${slot}`}
                              className="cell-9x9 pillar-header"
                              onClick={() => {
                                setSelectedSlot(slot);
                                setViewMode('mandala');
                              }}
                            >
                              <span style={{ color: STAT_COLORS[pillar?.statCode || 'STR'] }}>
                                {pillar?.statCode}
                              </span>
                              <span style={{ fontSize: '7px' }}>{pillar?.title}</span>
                            </div>
                          );
                        })}
                      </div>
                    );
                  }

                  const pillarSlotMapping: Record<string, number> = {
                    '0-0': 1,
                    '0-1': 2,
                    '0-2': 3,
                    '1-2': 4,
                    '2-2': 5,
                    '2-1': 6,
                    '2-0': 7,
                    '1-0': 8
                  };
                  const pillarSlot = pillarSlotMapping[`${blockRow}-${blockCol}`] || 1;
                  const pillar = pillars.find((p) => p.slotIndex === pillarSlot);
                  const startRow = blockRow * 3 + 1;
                  const startCol = blockCol * 3 + 1;

                  return (
                    <div
                      key={`block-${blockRow}-${blockCol}`}
                      style={{
                        gridRow: `${startRow} / span 3`,
                        gridColumn: `${startCol} / span 3`,
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: '2px',
                        border: '1px solid #334155'
                      }}
                    >
                      {[1, 2, 3, 8, 0, 4, 7, 6, 5].map((actionSlot) => {
                        if (actionSlot === 0) {
                          return (
                            <div
                              key={`sub-pillar-${pillarSlot}`}
                              className="cell-9x9 pillar-header"
                              onClick={() => {
                                setSelectedSlot(pillarSlot);
                                setViewMode('mandala');
                              }}
                            >
                              <span style={{ color: STAT_COLORS[pillar?.statCode || 'STR'] }}>
                                {pillar?.statCode}
                              </span>
                              <span style={{ fontSize: '7px' }}>{pillar?.title}</span>
                            </div>
                          );
                        }

                        const action = pillar?.actions[actionSlot - 1];
                        if (!action) {
                          return (
                            <div
                              key={`empty-${pillarSlot}-${actionSlot}`}
                              className="cell-9x9"
                              style={{ opacity: 0.35, textAlign: 'center', justifyContent: 'center' }}
                              onClick={() => {
                                setSelectedSlot(pillarSlot);
                                setViewMode('mandala');
                              }}
                            >
                              <span>+</span>
                            </div>
                          );
                        }

                        return (
                          <div
                            key={action.id}
                            className={`cell-9x9 ${action.completedToday ? 'done' : ''}`}
                            onClick={() => onToggleAction(pillarSlot, action.id)}
                          >
                            <span style={{ fontSize: '7px', fontWeight: 600 }}>{action.title}</span>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '7px' }}>
                              <span style={{ color: 'var(--accent-cyan)' }}>+{action.xpReward}</span>
                              <span>{action.completedToday ? '✓' : '○'}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          MODALS FOR EDITING (NO LOGIN REQUIRED, WORKS OFFLINE & ONLINE)
         ========================================================= */}

      {/* 1. EDIT PILLAR MODAL */}
      {editingPillarSlot !== null && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '16px'
          }}
        >
          <div className="pixel-box" style={{ width: '100%', maxWidth: '380px' }}>
            <div className="stage-header" style={{ marginBottom: '10px' }}>
              <strong>✏️ RENAME PILLAR {editingPillarSlot}</strong>
              <button
                type="button"
                className="pixel-btn"
                style={{ padding: '2px 8px', fontSize: '11px' }}
                onClick={() => setEditingPillarSlot(null)}
              >
                X
              </button>
            </div>
            <form onSubmit={handleSavePillar}>
              <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Pillar Title / Category Name:</label>
              <input
                className="pixel-input"
                style={{ width: '100%', marginTop: '4px', marginBottom: '12px' }}
                type="text"
                autoFocus
                required
                value={pillarInput}
                onChange={(e) => setPillarInput(e.target.value)}
              />
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className="pixel-btn"
                  style={{ background: '#334155', color: '#fff', borderColor: '#475569' }}
                  onClick={() => setEditingPillarSlot(null)}
                >
                  CANCEL
                </button>
                <button type="submit" className="pixel-btn">
                  SAVE PILLAR
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. EDIT CORE GOAL MODAL */}
      {editingGoal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '16px'
          }}
        >
          <div className="pixel-box" style={{ width: '100%', maxWidth: '380px' }}>
            <div className="stage-header" style={{ marginBottom: '10px' }}>
              <strong>★ EDIT CENTRAL CORE GOAL ★</strong>
              <button
                type="button"
                className="pixel-btn"
                style={{ padding: '2px 8px', fontSize: '11px' }}
                onClick={() => setEditingGoal(false)}
              >
                X
              </button>
            </div>
            <form onSubmit={handleSaveGoal}>
              <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Overarching Center Goal:</label>
              <input
                className="pixel-input"
                style={{ width: '100%', marginTop: '4px', marginBottom: '12px' }}
                type="text"
                autoFocus
                required
                value={goalInput}
                onChange={(e) => setGoalInput(e.target.value)}
              />
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className="pixel-btn"
                  style={{ background: '#334155', color: '#fff', borderColor: '#475569' }}
                  onClick={() => setEditingGoal(false)}
                >
                  CANCEL
                </button>
                <button type="submit" className="pixel-btn">
                  SAVE CORE GOAL
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. EDIT / DELETE ACTION MODAL */}
      {editingActionItem && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '16px'
          }}
        >
          <div className="pixel-box" style={{ width: '100%', maxWidth: '380px' }}>
            <div className="stage-header" style={{ marginBottom: '10px' }}>
              <strong>✏️ EDIT ACTION</strong>
              <button
                type="button"
                className="pixel-btn"
                style={{ padding: '2px 8px', fontSize: '11px' }}
                onClick={() => setEditingActionItem(null)}
              >
                X
              </button>
            </div>
            <form onSubmit={handleSaveAction}>
              <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Action Title:</label>
              <input
                className="pixel-input"
                style={{ width: '100%', marginTop: '4px', marginBottom: '12px' }}
                type="text"
                autoFocus
                required
                value={actionInput}
                onChange={(e) => setActionInput(e.target.value)}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button
                  type="button"
                  className="pixel-btn"
                  style={{ background: '#ef4444', color: '#fff', borderColor: '#f87171', padding: '6px 10px' }}
                  onClick={handleDeleteAction}
                >
                  🗑️ DELETE
                </button>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    className="pixel-btn"
                    style={{ background: '#334155', color: '#fff', borderColor: '#475569' }}
                    onClick={() => setEditingActionItem(null)}
                  >
                    CANCEL
                  </button>
                  <button type="submit" className="pixel-btn">
                    SAVE
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
