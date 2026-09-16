import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ANIME_OUT_EVENTS } from '../data/animeOuts';
import { X, Sparkles, Volume2, ShieldCheck } from 'lucide-react';
import { sound } from '../utils/sound';
import { AnimeOutEvent } from '../types';

interface TropesGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPreviewOut: (event: AnimeOutEvent) => void;
}

export const TropesGalleryModal: React.FC<TropesGalleryModalProps> = ({
  isOpen,
  onClose,
  onPreviewOut,
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.94 }}
          className="relative w-full max-w-3xl bg-zinc-950 border-2 border-cyan-500/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-zinc-800 bg-zinc-900/50">
            <div>
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-cyan-400" />
                ICONIC "ANIME OUT" MOMENTS & TROPES
              </h2>
              <p className="text-xs text-zinc-400">
                In this game, getting shot doesn't kill you—it unlocks these legendary anime reactions!
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* List of Tropes */}
          <div className="p-5 overflow-y-auto space-y-4">
            {ANIME_OUT_EVENTS.map(event => (
              <div
                key={event.id}
                className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-900/90 transition flex flex-col gap-3 relative overflow-hidden"
              >
                {/* Accent line */}
                <div
                  className="absolute top-0 left-0 bottom-0 w-1.5"
                  style={{ backgroundColor: event.auraColor }}
                />

                <div className="flex items-start justify-between gap-3 pl-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-base font-extrabold text-white">
                        {event.title}
                      </span>
                      <span
                        className="text-xs font-mono font-bold px-2 py-0.5 rounded"
                        style={{ backgroundColor: `${event.auraColor}33`, color: event.auraColor }}
                      >
                        {event.japaneseKanji}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 font-mono mt-0.5">
                      {event.effectDescription}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      if (event.type === 'jojo_menacing') sound.playZaWarudo();
                      else if (event.type === 'super_saiyan') sound.playSuperSaiyanAura();
                      else if (event.type === 'kawaii_sparkle') sound.playSparkle();
                      else sound.playAnimeDramaticBoom();
                      onPreviewOut(event);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-cyan-300 text-xs font-bold border border-zinc-700 transition shadow"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Trigger Out!</span>
                  </button>
                </div>

                {/* Dialogues */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pl-2">
                  <div className="p-2.5 rounded bg-black/40 border border-zinc-800/80 text-xs">
                    <span className="text-[10px] text-amber-400 font-bold uppercase block mb-1">
                      Anime English Line:
                    </span>
                    <span className="text-zinc-200 italic font-medium">"{event.quoteEn}"</span>
                  </div>

                  <div className="p-2.5 rounded bg-black/40 border border-zinc-800/80 text-xs">
                    <span className="text-[10px] text-cyan-400 font-bold uppercase block mb-1">
                      Desi Hinglish Line:
                    </span>
                    <span className="text-zinc-200 font-medium">"{event.quoteHinglish}"</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer note */}
          <div className="p-4 border-t border-zinc-800 bg-zinc-900/40 flex items-center justify-between">
            <div className="text-xs text-emerald-400 flex items-center gap-1.5 font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>Reminder: Bullets do 0 damage to this protagonist!</span>
            </div>
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-sm transition shadow-md"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
