import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AnimeOutEvent, CharacterConfig } from '../types';
import { Zap, Sparkles, Flame, ShieldAlert } from 'lucide-react';

interface AnimeCutsceneOverlayProps {
  event: AnimeOutEvent | null;
  character: CharacterConfig;
  onDismiss?: () => void;
}

export const AnimeCutsceneOverlay: React.FC<AnimeCutsceneOverlayProps> = ({
  event,
  character,
  onDismiss,
}) => {
  if (!event) return null;

  return (
    <AnimatePresence>
      <div
        id="anime-cutscene-container"
        className="pointer-events-none absolute inset-0 z-40 overflow-hidden flex items-center justify-center select-none"
      >
        {/* Dynamic Speed Lines Background */}
        <motion.div
          initial={{ opacity: 0, scale: 1.15 }}
          animate={{ opacity: 0.85, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black/85"
        >
          {/* Radial anime burst lines */}
          <div
            className="absolute inset-0 opacity-40 mix-blend-screen pointer-events-none"
            style={{
              background: `repeating-conic-gradient(from 0deg at 50% 50%, ${event.auraColor} 0deg 3deg, transparent 3deg 12deg)`,
            }}
          />
        </motion.div>

        {/* Dramatic Screen Flash */}
        <motion.div
          initial={{ opacity: 0.9 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="absolute inset-0 bg-white pointer-events-none"
        />

        {/* Top/Bottom Cinematic Widescreen Letterbox Bars */}
        <motion.div
          initial={{ y: -80 }}
          animate={{ y: 0 }}
          exit={{ y: -80 }}
          transition={{ duration: 0.25 }}
          className="absolute top-0 left-0 right-0 h-14 bg-black/90 border-b border-amber-500/30 flex items-center justify-between px-6 z-10"
        >
          <div className="flex items-center gap-2">
            <span className="inline-block w-3 h-3 rounded-full bg-red-500 animate-ping" />
            <span className="text-xs font-black tracking-widest text-red-400 uppercase">
              CRITICAL EVENT // BULLET TANKED
            </span>
          </div>
          <div className="text-amber-400 font-bold text-sm tracking-wider flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-amber-400 animate-pulse" />
            <span>DAMAGE: 0 HP (ZERO EFFECT!)</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ y: 80 }}
          animate={{ y: 0 }}
          exit={{ y: 80 }}
          transition={{ duration: 0.25 }}
          className="absolute bottom-0 left-0 right-0 h-14 bg-black/90 border-t border-amber-500/30 flex items-center justify-between px-6 z-10"
        >
          <div className="text-zinc-400 text-xs font-mono">
            STATUS: <span className="text-emerald-400 font-bold">AWAKENED HERO MODE</span>
          </div>
          <div className="text-xs text-amber-300 font-mono tracking-wide">
            ANIME REACTION LEVEL {event.powerTier} MAX
          </div>
        </motion.div>

        {/* Main Dramatic Diagonal Manga Slice Card */}
        <motion.div
          initial={{ x: '-120%', skewX: -12 }}
          animate={{ x: '0%', skewX: -12 }}
          exit={{ x: '120%', skewX: -12 }}
          transition={{ type: 'spring', damping: 20, stiffness: 220 }}
          className="relative w-full max-w-4xl mx-4 bg-zinc-950/95 border-y-4 shadow-2xl p-6 sm:p-8 backdrop-blur-md overflow-hidden"
          style={{ borderColor: event.auraColor }}
        >
          {/* Unskew the inner contents for readability */}
          <div className="skew-x-12 relative z-10">
            {/* Massive Kanji Stamp in Background */}
            <div
              className="absolute -top-10 -right-6 text-7xl sm:text-9xl font-black opacity-20 pointer-events-none select-none tracking-tighter"
              style={{ color: event.secondaryColor }}
            >
              {event.japaneseKanji}
            </div>

            {/* Header Badge */}
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <span
                className="px-3 py-1 rounded text-xs font-black tracking-widest uppercase text-black flex items-center gap-1 shadow-lg"
                style={{ backgroundColor: event.auraColor }}
              >
                <Flame className="w-3.5 h-3.5 fill-black" />
                ANIME OUT ACTIVATED!
              </span>

              <span className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
                <span>{character.avatarIcon}</span>
                <span>{event.title}</span>
              </span>
            </div>

            {/* Manga Eye Slash / Quote Section */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center mt-2">
              {/* Eye Banner / Hero Art Box */}
              <div
                className="md:col-span-4 rounded-xl border-2 p-3 flex flex-col items-center justify-center text-center relative overflow-hidden bg-black/60 shadow-inner"
                style={{ borderColor: event.auraColor }}
              >
                {/* Glowing Aura Ring */}
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center text-4xl shadow-xl relative my-1 animate-bounce"
                  style={{
                    backgroundColor: `${event.auraColor}33`,
                    boxShadow: `0 0 35px ${event.auraColor}`,
                  }}
                >
                  {character.avatarIcon}
                </div>
                <div className="text-white font-extrabold text-sm tracking-wide mt-1">
                  {character.name}
                </div>
                <div className="text-xs text-amber-300/80 font-mono">
                  {character.signatureAnimeOut}
                </div>
              </div>

              {/* Dramatic Dialogue Box */}
              <div className="md:col-span-8 flex flex-col gap-2">
                {/* English Anime Trope Dialogue */}
                <div className="bg-white/10 border-l-4 border-amber-400 p-3 rounded-r-lg backdrop-blur-sm shadow-md">
                  <div className="text-xs uppercase tracking-wider text-amber-300 font-bold flex items-center gap-1.5 mb-1">
                    <Zap className="w-3.5 h-3.5" />
                    <span>Protagonist Reaction:</span>
                  </div>
                  <p className="text-white font-bold text-base sm:text-lg leading-snug italic">
                    "{event.quoteEn}"
                  </p>
                </div>

                {/* Funny Hinglish Subtitle */}
                <div className="bg-zinc-900/80 border-l-4 border-cyan-400 p-3 rounded-r-lg">
                  <div className="text-xs uppercase tracking-wider text-cyan-300 font-bold flex items-center gap-1.5 mb-0.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Desi Anime Subtitle:</span>
                  </div>
                  <p className="text-zinc-200 text-sm sm:text-base font-medium">
                    "{event.quoteHinglish}"
                  </p>
                </div>

                {/* Effect Banner */}
                <div className="text-xs text-zinc-300 flex items-center gap-2 mt-1">
                  <span className="font-semibold text-amber-400">COUNTER EFFECT:</span>
                  <span>{event.effectDescription}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Glowing bottom progress bar of the cutscene duration */}
          <motion.div
            initial={{ scaleX: 1 }}
            animate={{ scaleX: 0 }}
            transition={{ duration: event.durationMs / 1000, ease: 'linear' }}
            className="absolute bottom-0 left-0 right-0 h-1 origin-left"
            style={{ backgroundColor: event.auraColor }}
          />
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
