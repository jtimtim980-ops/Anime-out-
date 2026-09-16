export type CharacterId = 'shonen_saiyan' | 'shadow_shinobi' | 'jojo_stand' | 'magical_chibi' | 'cyber_ronin';

export interface CharacterConfig {
  id: CharacterId;
  name: string;
  title: string;
  subTitle: string;
  accentColor: string;
  hairColor: string;
  auraColor: string;
  description: string;
  signatureAnimeOut: string;
  avatarIcon: string;
}

export type AnimeOutType =
  | 'super_saiyan'
  | 'omae_wa'
  | 'jojo_menacing'
  | 'rocket_blast'
  | 'kawaii_sparkle'
  | 'melodramatic_rain'
  | 'domain_expansion'
  | 'matrix_dodge';

export interface AnimeOutEvent {
  id: string;
  type: AnimeOutType;
  title: string;
  japaneseKanji: string;
  quoteEn: string;
  quoteHinglish: string;
  auraColor: string;
  secondaryColor: string;
  durationMs: number;
  powerTier: number;
  effectDescription: string;
}

export interface Player {
  x: number;
  y: number;
  vx: number;
  vy: number;
  speed: number;
  radius: number;
  facing: 1 | -1;
  auraPulse: number;
  characterId: CharacterId;
  hype: number; // 0 to 100
  animeOutActive: boolean;
  activeAnimeOut: AnimeOutEvent | null;
  animeOutTimer: number; // remaining frames
  bulletsTanked: number;
  kills: number;
  score: number;
  invincibleGlow: number;
  swordCooldown: number;
}

export interface Bullet {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  type: 'pistol' | 'laser' | 'missile' | 'energy_ball' | 'shuriken' | 'boss_beam';
  isFriendly?: boolean;
  trail: { x: number; y: number }[];
  damage: number;
  homing?: boolean;
}

export interface Enemy {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  hp: number;
  maxHp: number;
  type: 'drone' | 'hitman' | 'turret' | 'ninja' | 'mecha_boss';
  shootCooldown: number;
  maxCooldown: number;
  color: string;
  facing: 1 | -1;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
  type: 'spark' | 'aura' | 'kanji' | 'petal' | 'heart' | 'lightning' | 'shockwave';
  text?: string;
}

export interface FloatingText {
  id: number;
  x: number;
  y: number;
  text: string;
  color: string;
  scale: number;
  life: number;
  maxLife: number;
  fontBold?: boolean;
}

export interface SlashEffect {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
  life: number;
  maxLife: number;
  width: number;
}
