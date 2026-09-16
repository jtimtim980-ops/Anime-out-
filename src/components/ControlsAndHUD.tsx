import React from 'react';
import {
  ShieldAlert,
  Flame,
  Volume2,
  VolumeX,
  Sparkles,
  Zap,
  Users,
  BookOpen,
} from 'lucide-react';
import { CharacterConfig } from '../types';

interface ControlsAndHUDProps {
  character: CharacterConfig;
  stats: {
    bulletsTanked: number;
    kills: number;
    hype: number;
    score: number;
  };
  bulletFrenzyActive: boolean;
  onToggleBulletFrenzy: () => void;
  onTriggerAnimeOut: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenHeroSelect: () => void;
  onOpenGallery: () => void;
}

export const ControlsAndHUD: React.FC<ControlsAndHUDProps> = ({
  character,
  stats,
  bulletFrenzyActive,
  onToggleBulletFrenzy,
  onTriggerAnimeOut,
  isMuted,
  onToggleMute,
  onOpenHeroSelect,
  onOpenGallery,
}) => {
  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-3 sm:p-5 z-20">
      {/* Top Header & HUD Stats */}
      <div className="flex items-start justify-between gap-3 w-full">
        {/* Left: Active Hero Badge & Bullets Tanked Counter */}
        <div className="pointer-events-auto flex flex-col gap-2">
          {/* Hero Profile Chip */}
          <button
            onClick={onOpenHeroSelect}
            className="flex items-center gap-2.5 bg-zinc-900/90 border border-zinc-700/80 hover:border-amber-500/80 px-3.5 py-2 rounded-xl backdrop-blur-md shadow-xl transition group text-left"
            title="Click to Switch Character"
          >
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center text-xl shadow-md"
              style={{ backgroundColor: `${character.accentColor}33`, borderColor: character.accentColor }}
            >
              {character.avatarIcon}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-white font-black text-sm tracking-wide group-hover:text-amber-300 transition">
                  {character.name}
                </span>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 font-mono px-1.5 py-0.5 rounded border border-amber-500/30">
                  CHANGE
                </span>
              </div>
              <div className="text-xs text-zinc-400 font-medium">
                {character.signatureAnimeOut}
              </div>
            </div>
          </button>

          {/* BULLET-PROOF HERO COUNTER */}
          <div className="bg-zinc-950/90 border-2 border-emerald-500/60 px-3.5 py-2 rounded-xl backdrop-blur-md shadow-2xl flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-black tracking-widest text-emerald-400 uppercase">
                BULLETS TANKED (NO DEATH!)
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-white font-mono">
                  {stats.bulletsTanked}
                </span>
                <span className="text-xs text-emerald-300 font-semibold">
                  0 HP LOST
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Center: HYPE METER (Power Gauge) */}
        <div className="pointer-events-auto hidden md:flex flex-col items-center max-w-xs w-full bg-zinc-900/85 border border-zinc-800 px-4 py-2.5 rounded-2xl backdrop-blur-md shadow-xl">
          <div className="flex items-center justify-between w-full mb-1 text-xs">
            <span className="text-amber-400 font-black tracking-wider flex items-center gap-1">
              <Flame className="w-4 h-4 fill-amber-400" />
              ANIME HYPE GAUGE
            </span>
            <span className="font-mono text-white font-bold">{Math.round(stats.hype)}%</span>
          </div>

          {/* Progress bar */}
          <div className="w-full h-3 bg-zinc-800 rounded-full overflow-hidden border border-zinc-700/60 relative">
            <div
              className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 rounded-full transition-all duration-200"
              style={{ width: `${Math.min(100, stats.hype)}%` }}
            />
          </div>
          <div className="text-[10px] text-zinc-400 mt-1">
            {stats.hype >= 60 ? '🔥 ANIME OUT READY! PRESS SPACEBAR' : 'Tank bullets to charge anime awakenings!'}
          </div>
        </div>

        {/* Right: Score, Sound & Controls */}
        <div className="pointer-events-auto flex items-center gap-2">
          {/* Score box */}
          <div className="bg-zinc-900/90 border border-zinc-700/80 px-3.5 py-2 rounded-xl backdrop-blur-md shadow-xl text-right">
            <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
              SCORE
            </div>
            <div className="text-xl font-black text-amber-400 font-mono">
              {stats.score}
            </div>
          </div>

          {/* Gallery / Memes button */}
          <button
            onClick={onOpenGallery}
            className="p-2.5 bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-700 rounded-xl text-zinc-200 transition shadow-lg flex items-center gap-1.5"
            title="Anime Out Tropes Gallery"
          >
            <BookOpen className="w-4 h-4 text-cyan-400" />
            <span className="hidden sm:inline text-xs font-bold">Tropes</span>
          </button>

          {/* Mute button */}
          <button
            onClick={onToggleMute}
            className="p-2.5 bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-700 rounded-xl text-zinc-200 transition shadow-lg"
            title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>
        </div>
      </div>

      {/* Bottom Controls Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 w-full">
        {/* Helper hints */}
        <div className="pointer-events-auto bg-black/70 backdrop-blur-md px-3.5 py-2 rounded-xl border border-zinc-800 text-xs text-zinc-300 flex items-center gap-3">
          <div className="flex items-center gap-1 text-zinc-400">
            <span className="px-1.5 py-0.5 bg-zinc-800 rounded font-mono text-[11px] text-zinc-200 font-bold">WASD / Touch</span>
            <span>Move</span>
          </div>
          <span className="text-zinc-600">|</span>
          <div className="flex items-center gap-1 text-amber-300">
            <span className="px-1.5 py-0.5 bg-zinc-800 rounded font-mono text-[11px] text-amber-400 font-bold">SPACE</span>
            <span>Trigger Anime Out</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pointer-events-auto flex items-center gap-2.5">
          {/* Bullet Storm / Frenzy Toggle */}
          <button
            onClick={onToggleBulletFrenzy}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm tracking-wide transition shadow-xl border ${
              bulletFrenzyActive
                ? 'bg-red-600 border-red-400 text-white animate-pulse'
                : 'bg-zinc-900/90 border-zinc-700 text-zinc-300 hover:text-white hover:border-red-500/60'
            }`}
            title="Increase bullet storm to trigger nonstop Anime Outs!"
          >
            <Zap className={`w-4 h-4 ${bulletFrenzyActive ? 'text-yellow-300' : 'text-red-400'}`} />
            <span>{bulletFrenzyActive ? 'BULLET STORM ACTIVE!' : 'BULLET STORM MODE'}</span>
          </button>

          {/* BIG ANIME OUT TRIGGER BUTTON */}
          <button
            onClick={onTriggerAnimeOut}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-xs sm:text-sm tracking-wide bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black border-2 border-amber-300 shadow-2xl hover:scale-105 active:scale-95 transition"
          >
            <Sparkles className="w-4 h-4 fill-black" />
            <span>ACTIVATE ANIME OUT!</span>
          </button>
        </div>
      </div>
    </div>
  );
};
