import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CharacterConfig } from '../types';
import { CHARACTERS } from '../data/animeOuts';
import { X, Check, Flame } from 'lucide-react';

interface HeroSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCharacter: CharacterConfig;
  onSelectCharacter: (char: CharacterConfig) => void;
}

export const HeroSelectorModal: React.FC<HeroSelectorModalProps> = ({
  isOpen,
  onClose,
  selectedCharacter,
  onSelectCharacter,
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.92 }}
          className="relative w-full max-w-2xl bg-zinc-950 border-2 border-amber-500/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-zinc-800 bg-zinc-900/50">
            <div>
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                <Flame className="w-5 h-5 text-amber-500" />
                SELECT YOUR ANIME PROTAGONIST
              </h2>
              <p className="text-xs text-zinc-400">
                Every hero has 100% bullet immunity and their own iconic Anime Out awakening!
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Character Grid */}
          <div className="p-5 overflow-y-auto space-y-3">
            {CHARACTERS.map(char => {
              const isSelected = selectedCharacter.id === char.id;
              return (
                <div
                  key={char.id}
                  onClick={() => {
                    onSelectCharacter(char);
                    onClose();
                  }}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition flex items-center justify-between gap-4 ${
                    isSelected
                      ? 'bg-amber-500/10 border-amber-500 shadow-lg'
                      : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-600 hover:bg-zinc-900'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl shadow-inner border"
                      style={{
                        backgroundColor: `${char.accentColor}22`,
                        borderColor: char.accentColor,
                      }}
                    >
                      {char.avatarIcon}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-extrabold text-white">
                          {char.name}
                        </span>
                        <span
                          className="text-[10px] font-bold px-2 py-0.5 rounded uppercase"
                          style={{
                            backgroundColor: `${char.accentColor}33`,
                            color: char.accentColor,
                          }}
                        >
                          {char.title}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-300 font-medium mt-0.5">
                        {char.description}
                      </p>
                      <div className="text-[11px] text-amber-400 font-mono mt-1 flex items-center gap-1">
                        <span>Signature Anime Out:</span>
                        <span className="font-bold underline">{char.signatureAnimeOut}</span>
                      </div>
                    </div>
                  </div>

                  {isSelected && (
                    <div className="p-2 rounded-full bg-amber-500 text-black shadow-md">
                      <Check className="w-5 h-5 stroke-[3]" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-zinc-800 bg-zinc-900/40 flex justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-sm transition shadow-md"
            >
              Done
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
