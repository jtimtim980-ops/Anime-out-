/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { GameCanvas } from './components/GameCanvas';
import { AnimeCutsceneOverlay } from './components/AnimeCutsceneOverlay';
import { ControlsAndHUD } from './components/ControlsAndHUD';
import { HeroSelectorModal } from './components/HeroSelectorModal';
import { TropesGalleryModal } from './components/TropesGalleryModal';
import { CHARACTERS } from './data/animeOuts';
import { CharacterConfig, AnimeOutEvent } from './types';
import { sound } from './utils/sound';

export default function App() {
  const [character, setCharacter] = useState<CharacterConfig>(CHARACTERS[0]);
  const [activeAnimeOut, setActiveAnimeOut] = useState<AnimeOutEvent | null>(null);
  const [stats, setStats] = useState({
    bulletsTanked: 0,
    kills: 0,
    hype: 40,
    score: 0,
  });

  const [bulletFrenzyActive, setBulletFrenzyActive] = useState(false);
  const [manualAnimeOutRequested, setManualAnimeOutRequested] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [heroSelectOpen, setHeroSelectOpen] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const animeOutTimeoutRef = useRef<number | null>(null);

  // Handle Anime Out trigger
  const handleAnimeOutTriggered = useCallback((event: AnimeOutEvent) => {
    setActiveAnimeOut(event);
    if (animeOutTimeoutRef.current) {
      window.clearTimeout(animeOutTimeoutRef.current);
    }
    animeOutTimeoutRef.current = window.setTimeout(() => {
      setActiveAnimeOut(null);
    }, event.durationMs);
  }, []);

  const handleStatsUpdate = useCallback(
    (newStats: { bulletsTanked: number; kills: number; hype: number; score: number }) => {
      setStats(newStats);
    },
    []
  );

  const toggleMute = useCallback(() => {
    setIsMuted(prev => {
      const next = !prev;
      sound.setMuted(next);
      return next;
    });
  }, []);

  const toggleBulletFrenzy = useCallback(() => {
    setBulletFrenzyActive(prev => !prev);
  }, []);

  const triggerManualAnimeOut = useCallback(() => {
    setManualAnimeOutRequested(true);
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (animeOutTimeoutRef.current) {
        window.clearTimeout(animeOutTimeoutRef.current);
      }
    };
  }, []);

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-zinc-950 font-sans select-none">
      {/* 60FPS Game Canvas */}
      <GameCanvas
        character={character}
        onAnimeOutTriggered={handleAnimeOutTriggered}
        onStatsUpdate={handleStatsUpdate}
        bulletFrenzyActive={bulletFrenzyActive}
        manualAnimeOutRequested={manualAnimeOutRequested}
        onManualAnimeOutHandled={() => setManualAnimeOutRequested(false)}
        isPaused={heroSelectOpen || galleryOpen}
      />

      {/* Dramatic Manga Anime Out Cutscene Overlay */}
      <AnimeCutsceneOverlay
        event={activeAnimeOut}
        character={character}
        onDismiss={() => setActiveAnimeOut(null)}
      />

      {/* Top HUD & Action Controls */}
      <ControlsAndHUD
        character={character}
        stats={stats}
        bulletFrenzyActive={bulletFrenzyActive}
        onToggleBulletFrenzy={toggleBulletFrenzy}
        onTriggerAnimeOut={triggerManualAnimeOut}
        isMuted={isMuted}
        onToggleMute={toggleMute}
        onOpenHeroSelect={() => setHeroSelectOpen(true)}
        onOpenGallery={() => setGalleryOpen(true)}
      />

      {/* Character Switcher Modal */}
      <HeroSelectorModal
        isOpen={heroSelectOpen}
        onClose={() => setHeroSelectOpen(false)}
        selectedCharacter={character}
        onSelectCharacter={char => setCharacter(char)}
      />

      {/* Anime Tropes & Quotes Gallery Modal */}
      <TropesGalleryModal
        isOpen={galleryOpen}
        onClose={() => setGalleryOpen(false)}
        onPreviewOut={event => {
          handleAnimeOutTriggered(event);
          setGalleryOpen(false);
        }}
      />
    </main>
  );
}
