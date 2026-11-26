import { useMemo } from 'react';

interface PixelStageProps {
  characterName: string;
  level: number;
  totalXp: number;
  hp: number;
  maxHp: number;
  streak: number;
  celebrating: boolean;
}

export interface MegamanXEvolution {
  minLevel: number;
  maxLevel: number;
  code: string;
  name: string;
  spriteUrl: string;
  altSpriteUrl?: string;
  icon: string;
  elementColor: string;
  description: string;
}

export const MEGAMAN_X_EVOLUTIONS: MegamanXEvolution[] = [
  {
    minLevel: 1,
    maxLevel: 2,
    code: 'X-BUSTER',
    name: 'Mega Man X (Buster Stance)',
    spriteUrl: '/sprites/megaman_x_idle.png',
    altSpriteUrl: '/sprites/megaman_x_alt.png',
    icon: '⚡',
    elementColor: '#38bdf8',
    description: '32-bit combat ready stance. Fires plasma energy to break initial task inertia.'
  },
  {
    minLevel: 3,
    maxLevel: 4,
    code: 'CHARGE BUSTER',
    name: 'Mega Man X (Alt Charge Pose)',
    spriteUrl: '/sprites/megaman_x_alt.png',
    altSpriteUrl: '/sprites/megaman_x_frost1.png',
    icon: '🎯',
    elementColor: '#fbbf24',
    description: 'Concentrated charge pose. Fully locked buster for laser-focused execution.'
  },
  {
    minLevel: 5,
    maxLevel: 6,
    code: 'FROST SPIRE',
    name: 'Mega Man X (Frost Spire Armor)',
    spriteUrl: '/sprites/megaman_x_frost1.png',
    altSpriteUrl: '/sprites/megaman_x_frost2.png',
    icon: '🧊',
    elementColor: '#67e8f9',
    description: 'Rising glacial crystal spire shields against daily distractions.'
  },
  {
    minLevel: 7,
    maxLevel: 9,
    code: 'FROST TOWER',
    name: 'Mega Man X (Frost Tower Complete)',
    spriteUrl: '/sprites/megaman_x_frost2.png',
    altSpriteUrl: '/sprites/megaman_x_special.png',
    icon: '❄️',
    elementColor: '#a5f3fc',
    description: 'Full Frost Tower technique. Glacial fortress guards all 8 pillars.'
  },
  {
    minLevel: 10,
    maxLevel: 999,
    code: 'GIGA NOVA',
    name: 'Mega Man X (Frost Giga Attack)',
    spriteUrl: '/sprites/megaman_x_special.png',
    altSpriteUrl: '/sprites/megaman_x_frost2.png',
    icon: '👑',
    elementColor: '#e0f2fe',
    description: 'Screen-shattering 32-bit Giga Attack! The ultimate mark of the Harada Master.'
  }
];

export function PixelStage({
  characterName,
  level,
  totalXp,
  hp,
  maxHp,
  streak,
  celebrating
}: PixelStageProps) {
  const xpInLevel = totalXp % 100;
  const hpPercent = Math.max(0, Math.min(100, Math.round((hp / maxHp) * 100)));

  // Automatically compute current character form purely based on level
  const currentForm = useMemo(() => {
    return (
      MEGAMAN_X_EVOLUTIONS.find((e) => level >= e.minLevel && level <= e.maxLevel) ||
      MEGAMAN_X_EVOLUTIONS[MEGAMAN_X_EVOLUTIONS.length - 1]
    );
  }, [level]);

  // Next evolution milestone
  const nextForm = useMemo(() => {
    return MEGAMAN_X_EVOLUTIONS.find((e) => level < e.minLevel);
  }, [level]);

  // Sprite changes to action/alt pose when celebrating
  const currentSpriteSrc = useMemo(() => {
    if (celebrating) {
      if (level >= 10) return '/sprites/megaman_x_special.png';
      if (currentForm.altSpriteUrl) return currentForm.altSpriteUrl;
      return '/sprites/megaman_x_alt.png';
    }
    return currentForm.spriteUrl;
  }, [celebrating, currentForm, level]);

  const isSpecialWide = currentSpriteSrc.includes('special');

  return (
    <section className="pixel-box megaman-stage-frame">
      {/* Top Banner with Rank and Hardcore Status */}
      <div className="stage-topbar">
        <div className="hero-identity">
          <span className="hero-crown">{currentForm.icon}</span>
          <strong className="hero-name">{characterName || 'MEGAMAN X'}</strong>
          <span className="badge badge-rank">32-BIT MAVERICK HUNTER</span>
        </div>
        <div className="stage-badges">
          <span className="badge badge-level">LV.{level}</span>
          <span className="badge badge-streak">🔥 {streak}d STREAK</span>
        </div>
      </div>

      {/* 32-Bit Capcom Cyber Battle Arena */}
      <div className={`battle-arena ${celebrating ? 'stage-celebrating' : ''}`}>
        {/* Background Cyber Grid & Plasma Particles */}
        <div className="arena-ambient">
          <div className="ambient-mote mote-1" />
          <div className="ambient-mote mote-2" />
          <div className="ambient-mote mote-3" />
        </div>

        {/* Character Stage: Authentic 32-Bit Mega Man X Sprite */}
        <div className="character-stage-group megaman-x-group">
          {/* Floor Shadow */}
          <div className="character-shadow megaman-shadow" />

          {/* Authentic 32-Bit Pixel Sprite */}
          <div className={`x-sprite-container ${celebrating ? 'celebrate-bounce' : 'idle-bounce'}`}>
            <img
              src={currentSpriteSrc}
              alt={currentForm.name}
              className={`megaman-x-pixel-art ${isSpecialWide ? 'wide-special' : ''}`}
              style={{
                filter: celebrating
                  ? `drop-shadow(0 0 14px ${currentForm.elementColor}) drop-shadow(0 4px 8px rgba(0,0,0,0.8))`
                  : `drop-shadow(0 0 5px ${currentForm.elementColor}66) drop-shadow(0 4px 6px rgba(0,0,0,0.8))`
              }}
            />
          </div>
        </div>

        {/* 32-Bit Capcom Energy Gauges */}
        <div className="arena-gauges">
          {/* XP Gauge (Weapon Energy P-Meter) */}
          <div className="gauge-block">
            <div className="gauge-label-row">
              <span className="gauge-name">
                <span className="dot dot-xp" /> W.ENERGY (EXP)
              </span>
              <span className="gauge-val font-mono">{xpInLevel} / 100 XP</span>
            </div>
            <div className="pixel-gauge-frame megaman-gauge-frame">
              <div className="gauge-fill gauge-fill-xp" style={{ width: `${xpInLevel}%` }}>
                <div className="gauge-shine" />
              </div>
            </div>
          </div>

          {/* Hardcore HP Gauge (Life Energy Bar) */}
          <div className="gauge-block">
            <div className="gauge-label-row">
              <span className="gauge-name">
                <span className="dot dot-hp" /> LIFE GAUGE (HP)
              </span>
              <span className="gauge-val font-mono">
                {hp} / {maxHp} ({hpPercent}%)
              </span>
            </div>
            <div className="pixel-gauge-frame megaman-gauge-frame">
              <div className="gauge-fill gauge-fill-hp" style={{ width: `${hpPercent}%` }}>
                <div className="gauge-shine" />
              </div>
            </div>
          </div>

          {/* Current Form Status Display (Auto Level Evolution) */}
          <div className="megaman-weapon-status">
            <div className="current-weapon-chip">
              <span className="weapon-icon-glow">{currentForm.icon}</span>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>ACTIVE FORM (LV.{level})</span>
                <strong style={{ color: currentForm.elementColor, fontSize: '11px' }}>
                  {currentForm.code}: {currentForm.name}
                </strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Level Up Special Skill Banner when celebrating */}
      {celebrating && (
        <div className="megaman-get-weapon-banner">
          <span className="blink-text">★ SPECIAL ATTACK ACTIVATED! ★</span>
          <span>{currentForm.name.toUpperCase()}!</span>
        </div>
      )}

      {/* Next Evolution Teaser */}
      {nextForm ? (
        <div className="next-skill-strip">
          <span>NEXT EVOLUTION AT <strong>LV.{nextForm.minLevel}</strong>:</span>
          <span style={{ color: 'var(--accent-gold)' }}>
            {nextForm.icon} {nextForm.name}
          </span>
        </div>
      ) : (
        <div className="next-skill-strip">
          <span style={{ color: 'var(--accent-gold)' }}>★ MASTER HUNTER: Ultimate Form Maxed Out!</span>
        </div>
      )}
    </section>
  );
}
