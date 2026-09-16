import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  CharacterConfig,
  AnimeOutEvent,
  Bullet,
  Enemy,
  Particle,
  FloatingText,
  SlashEffect,
} from '../types';
import { ANIME_OUT_EVENTS } from '../data/animeOuts';
import { sound } from '../utils/sound';

interface GameCanvasProps {
  character: CharacterConfig;
  onAnimeOutTriggered: (event: AnimeOutEvent) => void;
  onStatsUpdate: (stats: { bulletsTanked: number; kills: number; hype: number; score: number }) => void;
  bulletFrenzyActive: boolean;
  manualAnimeOutRequested: boolean;
  onManualAnimeOutHandled: () => void;
  isPaused: boolean;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  character,
  onAnimeOutTriggered,
  onStatsUpdate,
  bulletFrenzyActive,
  manualAnimeOutRequested,
  onManualAnimeOutHandled,
  isPaused,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Game state stored in refs for buttery-smooth 60fps animation loop
  const playerRef = useRef({
    x: 400,
    y: 300,
    vx: 0,
    vy: 0,
    speed: 6.5,
    radius: 24,
    facing: 1 as 1 | -1,
    hype: 40,
    bulletsTanked: 0,
    kills: 0,
    score: 0,
    auraPulse: 0,
    isSuperPowered: false,
    superPowerTime: 0,
    activeEffect: '' as string,
    timeStopActive: false,
    timeStopTimer: 0,
  });

  const enemiesRef = useRef<Enemy[]>([]);
  const bulletsRef = useRef<Bullet[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const floatingTextsRef = useRef<FloatingText[]>([]);
  const slashesRef = useRef<SlashEffect[]>([]);

  const keysPressed = useRef<{ [key: string]: boolean }>({});
  const mousePos = useRef({ x: 400, y: 300, isDown: false });
  const touchActive = useRef(false);
  const screenShake = useRef(0);
  const nextBulletId = useRef(1);
  const nextEnemyId = useRef(1);
  const nextTextId = useRef(1);
  const frameCount = useRef(0);
  const lastAnimeOutTime = useRef(0);

  // Function to spawn floating comic text
  const addFloatingText = useCallback(
    (x: number, y: number, text: string, color: string = '#fef08a', scale: number = 1) => {
      floatingTextsRef.current.push({
        id: nextTextId.current++,
        x: x + (Math.random() - 0.5) * 30,
        y: y + (Math.random() - 0.5) * 20,
        text,
        color,
        scale,
        life: 45,
        maxLife: 45,
        fontBold: true,
      });
    },
    []
  );

  // Function to spawn visual explosion / aura particles
  const spawnParticles = useCallback(
    (
      x: number,
      y: number,
      color: string,
      count: number = 10,
      type: 'spark' | 'aura' | 'kanji' | 'petal' | 'heart' | 'lightning' = 'spark'
    ) => {
      const kanjiSamples = ['何', '破', '強', '無駄', '神', '斬', '光'];
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 5 + 2;
        particlesRef.current.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 30 + Math.random() * 20,
          maxLife: 50,
          color,
          size: Math.random() * 6 + 3,
          type,
          text: type === 'kanji' ? kanjiSamples[Math.floor(Math.random() * kanjiSamples.length)] : undefined,
        });
      }
    },
    []
  );

  // Trigger Anime Out Awakening
  const triggerAnimeOut = useCallback(
    (forcedType?: string) => {
      const now = Date.now();
      // Add a slight cooldown between massive cutscenes to avoid overwhelming the screen
      if (now - lastAnimeOutTime.current < 1500) {
        // Still give mini-burst effect and sound
        sound.playBulletHitBounce();
        screenShake.current = 10;
        return;
      }
      lastAnimeOutTime.current = now;

      // Select matching Anime Out event or pick a dramatic one
      let chosenEvent = ANIME_OUT_EVENTS.find(e => e.type === forcedType);
      if (!chosenEvent) {
        // Pick one that matches character or random fun one
        const charMatches = ANIME_OUT_EVENTS.filter(e => {
          if (character.id === 'shonen_saiyan') return e.type === 'super_saiyan' || e.type === 'rocket_blast';
          if (character.id === 'shadow_shinobi') return e.type === 'omae_wa';
          if (character.id === 'jojo_stand') return e.type === 'jojo_menacing';
          if (character.id === 'magical_chibi') return e.type === 'kawaii_sparkle';
          if (character.id === 'cyber_ronin') return e.type === 'domain_expansion';
          return true;
        });
        chosenEvent = charMatches.length > 0
          ? charMatches[Math.floor(Math.random() * charMatches.length)]
          : ANIME_OUT_EVENTS[Math.floor(Math.random() * ANIME_OUT_EVENTS.length)];
      }

      // Notify parent component to display the dramatic Manga Cut-In banner
      onAnimeOutTriggered(chosenEvent);

      // Play dramatic sound according to type
      if (chosenEvent.type === 'jojo_menacing') {
        sound.playZaWarudo();
      } else if (chosenEvent.type === 'super_saiyan') {
        sound.playSuperSaiyanAura();
        sound.playAnimeDramaticBoom();
      } else if (chosenEvent.type === 'kawaii_sparkle') {
        sound.playSparkle();
      } else if (chosenEvent.type === 'omae_wa') {
        sound.playSlash();
        sound.playNaniSynth();
      } else {
        sound.playAnimeDramaticBoom();
      }

      screenShake.current = 24;
      const p = playerRef.current;
      p.isSuperPowered = true;
      p.superPowerTime = 180; // 3 seconds at 60fps
      p.activeEffect = chosenEvent.type;

      // Spawn dramatic floating Kanji and particles around player
      spawnParticles(p.x, p.y, chosenEvent.auraColor, 35, 'aura');
      spawnParticles(p.x, p.y, chosenEvent.secondaryColor, 15, 'kanji');

      addFloatingText(p.x, p.y - 45, chosenEvent.title, chosenEvent.secondaryColor, 1.4);
      addFloatingText(p.x, p.y - 75, '0 DAMAGE TANKED! ANIME OUT!', '#4ade80', 1.2);

      // Apply the gameplay counter effect!
      if (chosenEvent.type === 'super_saiyan') {
        // Mega shockwave clears bullets and blasts enemies
        bulletsRef.current = bulletsRef.current.map(b => ({
          ...b,
          vx: b.vx * -1.5,
          vy: b.vy * -1.5,
          isFriendly: true,
          color: '#fbbf24',
        }));
        enemiesRef.current.forEach(enemy => {
          const dx = enemy.x - p.x;
          const dy = enemy.y - p.y;
          const dist = Math.hypot(dx, dy) || 1;
          enemy.vx += (dx / dist) * 15;
          enemy.vy += (dy / dist) * 15;
          enemy.hp -= 40;
        });
      } else if (chosenEvent.type === 'omae_wa') {
        // Multi-blade slash lines across all enemies
        for (let i = 0; i < 4; i++) {
          slashesRef.current.push({
            x1: Math.random() * 800,
            y1: Math.random() * 600,
            x2: Math.random() * 800,
            y2: Math.random() * 600,
            color: '#06b6d4',
            life: 25,
            maxLife: 25,
            width: 4,
          });
        }
        enemiesRef.current.forEach(enemy => {
          enemy.hp -= 60;
          spawnParticles(enemy.x, enemy.y, '#06b6d4', 15, 'spark');
        });
        bulletsRef.current = [];
      } else if (chosenEvent.type === 'jojo_menacing') {
        // Time Stop
        p.timeStopActive = true;
        p.timeStopTimer = 180;
        addFloatingText(p.x, p.y - 100, 'ZA WARUDO! TIME STOPPED!', '#a855f7', 1.5);
      } else if (chosenEvent.type === 'kawaii_sparkle') {
        // Turn all bullets into candy/hearts
        bulletsRef.current.forEach(b => {
          b.isFriendly = true;
          b.color = '#f472b6';
          b.vx *= 0.3;
          b.vy *= 0.3;
        });
        spawnParticles(p.x, p.y, '#ec4899', 30, 'heart');
      } else if (chosenEvent.type === 'domain_expansion') {
        // Invert all enemy bullets into friendly high-speed homing shots
        bulletsRef.current = bulletsRef.current.map(b => ({
          ...b,
          isFriendly: true,
          color: '#34d399',
          vx: -b.vx * 2,
          vy: -b.vy * 2,
          homing: true,
        }));
        addFloatingText(p.x, p.y - 90, 'DOMAIN EXPANSION: REVERSAL!', '#34d399', 1.4);
      } else if (chosenEvent.type === 'rocket_blast') {
        // Giant meteor explosion
        sound.playExplosion();
        screenShake.current = 30;
        enemiesRef.current.forEach(enemy => {
          enemy.hp -= 80;
          spawnParticles(enemy.x, enemy.y, '#f97316', 20, 'spark');
        });
        bulletsRef.current = [];
      } else {
        // Melodrama beam blast
        slashesRef.current.push({
          x1: p.x,
          y1: p.y,
          x2: p.x + p.facing * 900,
          y2: p.y,
          color: '#818cf8',
          life: 30,
          maxLife: 30,
          width: 25,
        });
        enemiesRef.current.forEach(enemy => {
          if ((p.facing === 1 && enemy.x > p.x) || (p.facing === -1 && enemy.x < p.x)) {
            enemy.hp -= 90;
          }
        });
      }
    },
    [character, onAnimeOutTriggered, addFloatingText, spawnParticles]
  );

  // Handle manual Anime Out request from UI button / Spacebar
  useEffect(() => {
    if (manualAnimeOutRequested) {
      triggerAnimeOut();
      onManualAnimeOutHandled();
    }
  }, [manualAnimeOutRequested, triggerAnimeOut, onManualAnimeOutHandled]);

  // Spawn an enemy
  const spawnEnemy = useCallback((type: Enemy['type'] = 'drone') => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const side = Math.floor(Math.random() * 4);
    let x = 0;
    let y = 0;
    if (side === 0) {
      x = Math.random() * canvas.width;
      y = -40;
    } else if (side === 1) {
      x = canvas.width + 40;
      y = Math.random() * canvas.height;
    } else if (side === 2) {
      x = Math.random() * canvas.width;
      y = canvas.height + 40;
    } else {
      x = -40;
      y = Math.random() * canvas.height;
    }

    const hp = type === 'mecha_boss' ? 250 : type === 'turret' ? 60 : 35;
    const color =
      type === 'mecha_boss'
        ? '#ef4444'
        : type === 'hitman'
        ? '#e11d48'
        : type === 'ninja'
        ? '#8b5cf6'
        : '#f97316';

    enemiesRef.current.push({
      id: nextEnemyId.current++,
      x,
      y,
      vx: 0,
      vy: 0,
      radius: type === 'mecha_boss' ? 38 : type === 'turret' ? 22 : 18,
      hp,
      maxHp: hp,
      type,
      shootCooldown: Math.floor(Math.random() * 50) + 20,
      maxCooldown: type === 'mecha_boss' ? 25 : type === 'turret' ? 40 : 55,
      color,
      facing: 1,
    });
  }, []);

  // Keyboard and Mouse Event Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current[e.key.toLowerCase()] = true;
      if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        triggerAnimeOut();
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current[e.key.toLowerCase()] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [triggerAnimeOut]);

  // Main Canvas Animation and Physics Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    // Handle responsive sizing
    const updateCanvasSize = () => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    };
    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);

    // Initial enemies
    for (let i = 0; i < 4; i++) {
      spawnEnemy('drone');
    }
    spawnEnemy('turret');

    const render = () => {
      frameCount.current++;
      const p = playerRef.current;

      // Handle time stop decay
      if (p.timeStopActive) {
        p.timeStopTimer--;
        if (p.timeStopTimer <= 0) {
          p.timeStopActive = false;
        }
      }

      // Handle super power aura decay
      if (p.isSuperPowered) {
        p.superPowerTime--;
        p.auraPulse = (p.auraPulse + 0.3) % (Math.PI * 2);
        if (p.superPowerTime <= 0) {
          p.isSuperPowered = false;
          p.activeEffect = '';
        }
      } else {
        p.auraPulse = (p.auraPulse + 0.08) % (Math.PI * 2);
      }

      // Player Movement Logic
      let moveX = 0;
      let moveY = 0;
      if (keysPressed.current['w'] || keysPressed.current['arrowup']) moveY -= 1;
      if (keysPressed.current['s'] || keysPressed.current['arrowdown']) moveY += 1;
      if (keysPressed.current['a'] || keysPressed.current['arrowleft']) moveX -= 1;
      if (keysPressed.current['d'] || keysPressed.current['arrowright']) moveX += 1;

      // Touch / Mouse Follow if dragging
      if (touchActive.current || mousePos.current.isDown) {
        const dx = mousePos.current.x - p.x;
        const dy = mousePos.current.y - p.y;
        const dist = Math.hypot(dx, dy);
        if (dist > 15) {
          moveX = dx / dist;
          moveY = dy / dist;
        }
      }

      const moveMag = Math.hypot(moveX, moveY);
      const currentSpeed = p.isSuperPowered ? p.speed * 1.4 : p.speed;
      if (moveMag > 0) {
        p.vx = (moveX / moveMag) * currentSpeed;
        p.vy = (moveY / moveMag) * currentSpeed;
        if (moveX !== 0) p.facing = moveX > 0 ? 1 : -1;
      } else {
        p.vx *= 0.8;
        p.vy *= 0.8;
      }

      p.x += p.vx;
      p.y += p.vy;

      // Keep player on canvas
      p.x = Math.max(p.radius, Math.min(canvas.width - p.radius, p.x));
      p.y = Math.max(p.radius, Math.min(canvas.height - p.radius, p.y));

      // Periodically spawn enemies
      const enemySpawnInterval = bulletFrenzyActive ? 50 : 120;
      if (frameCount.current % enemySpawnInterval === 0 && enemiesRef.current.length < 15) {
        const rand = Math.random();
        if (rand > 0.85) spawnEnemy('mecha_boss');
        else if (rand > 0.6) spawnEnemy('turret');
        else if (rand > 0.3) spawnEnemy('hitman');
        else spawnEnemy('drone');
      }

      // Update Enemies
      enemiesRef.current.forEach(enemy => {
        if (p.timeStopActive) return; // Frozen in Za Warudo time stop!

        const dx = p.x - enemy.x;
        const dy = p.y - enemy.y;
        const dist = Math.hypot(dx, dy);

        // Movement towards player or hovering
        if (enemy.type === 'drone' || enemy.type === 'hitman') {
          if (dist > 180) {
            enemy.vx = (dx / dist) * 1.8;
            enemy.vy = (dy / dist) * 1.8;
          } else if (dist < 100) {
            enemy.vx = -(dx / dist) * 1.2;
            enemy.vy = -(dy / dist) * 1.2;
          } else {
            enemy.vx *= 0.9;
            enemy.vy *= 0.9;
          }
        }

        enemy.x += enemy.vx;
        enemy.y += enemy.vy;
        enemy.facing = dx > 0 ? 1 : -1;

        // Enemy Shooting Logic
        enemy.shootCooldown--;
        const shootRate = bulletFrenzyActive ? Math.floor(enemy.maxCooldown * 0.4) : enemy.maxCooldown;
        if (enemy.shootCooldown <= 0) {
          enemy.shootCooldown = shootRate + Math.floor(Math.random() * 15);
          sound.playShoot();

          if (enemy.type === 'mecha_boss') {
            // Boss shoots 3-way or ring of bullets
            for (let angleOffset = -0.3; angleOffset <= 0.3; angleOffset += 0.3) {
              const baseAngle = Math.atan2(dy, dx) + angleOffset;
              bulletsRef.current.push({
                id: nextBulletId.current++,
                x: enemy.x,
                y: enemy.y,
                vx: Math.cos(baseAngle) * 5.5,
                vy: Math.sin(baseAngle) * 5.5,
                radius: 7,
                color: '#ef4444',
                type: 'boss_beam',
                damage: 20,
                trail: [],
              });
            }
          } else {
            // Standard enemy bullet aimed at player
            const angle = Math.atan2(dy, dx);
            const speed = enemy.type === 'hitman' ? 6 : 4.5;
            bulletsRef.current.push({
              id: nextBulletId.current++,
              x: enemy.x,
              y: enemy.y,
              vx: Math.cos(angle) * speed,
              vy: Math.sin(angle) * speed,
              radius: 5,
              color: enemy.color,
              type: 'pistol',
              damage: 10,
              trail: [],
            });
          }
        }
      });

      // Update Bullets
      for (let i = bulletsRef.current.length - 1; i >= 0; i--) {
        const b = bulletsRef.current[i];

        if (!p.timeStopActive || b.isFriendly) {
          // Homing logic for friendly reflected bullets
          if (b.isFriendly && b.homing && enemiesRef.current.length > 0) {
            const target = enemiesRef.current[0];
            const tdx = target.x - b.x;
            const tdy = target.y - b.y;
            const tdist = Math.hypot(tdx, tdy);
            if (tdist > 0) {
              b.vx += (tdx / tdist) * 0.5;
              b.vy += (tdy / tdist) * 0.5;
              const spd = Math.hypot(b.vx, b.vy);
              if (spd > 9) {
                b.vx = (b.vx / spd) * 9;
                b.vy = (b.vy / spd) * 9;
              }
            }
          }

          b.trail.push({ x: b.x, y: b.y });
          if (b.trail.length > 4) b.trail.shift();

          b.x += b.vx;
          b.y += b.vy;
        }

        // Check collision with Player
        if (!b.isFriendly) {
          const pDist = Math.hypot(b.x - p.x, b.y - p.y);
          if (pDist < p.radius + b.radius) {
            // ========================================================
            // CRITICAL GAME RULE: CHARACTER DOES NOT DIE! ("marta nahi!")
            // INSTEAD: ANIME OUT TRIGGERS!
            // ========================================================
            p.bulletsTanked++;
            p.hype = Math.min(100, p.hype + 18);
            p.score += 150;

            sound.playBulletHitBounce();
            spawnParticles(b.x, b.y, '#f59e0b', 8, 'spark');

            // Floating anime quotes / bounce indicators
            const bounceComments = [
              'BOUNCE!',
              'NO DAMAGE!',
              'NANI?!',
              'USELESS MUDA!',
              'BULLET ABSORPTION!',
              'HYPE +9000!',
              'GOLI BEKAR!',
            ];
            const text = bounceComments[Math.floor(Math.random() * bounceComments.length)];
            addFloatingText(b.x, b.y - 15, text, '#fde047', 1.15);

            // Remove the bullet that hit us
            bulletsRef.current.splice(i, 1);

            // Trigger Anime Out!
            // If hype is high or every 3 bullets, trigger full Anime Out awakening
            if (p.hype >= 65 || p.bulletsTanked % 3 === 0) {
              triggerAnimeOut();
            } else {
              screenShake.current = 8;
            }
            continue;
          }
        }

        // Check collision with Enemies for friendly / reflected bullets
        if (b.isFriendly) {
          for (let j = enemiesRef.current.length - 1; j >= 0; j--) {
            const e = enemiesRef.current[j];
            const eDist = Math.hypot(b.x - e.x, b.y - e.y);
            if (eDist < e.radius + b.radius) {
              e.hp -= 25;
              spawnParticles(b.x, b.y, '#34d399', 8, 'spark');
              bulletsRef.current.splice(i, 1);
              if (e.hp <= 0) {
                p.kills++;
                p.score += 500;
                sound.playExplosion();
                spawnParticles(e.x, e.y, e.color, 25, 'spark');
                addFloatingText(e.x, e.y, '+500 DEFEATED!', '#fbbf24', 1.3);
                enemiesRef.current.splice(j, 1);
              }
              break;
            }
          }
        }

        // Remove off-screen bullets
        if (
          b.x < -100 ||
          b.x > canvas.width + 100 ||
          b.y < -100 ||
          b.y > canvas.height + 100
        ) {
          bulletsRef.current.splice(i, 1);
        }
      }

      // Clean up dead enemies
      for (let j = enemiesRef.current.length - 1; j >= 0; j--) {
        const e = enemiesRef.current[j];
        if (e.hp <= 0) {
          p.kills++;
          p.score += 500;
          sound.playExplosion();
          spawnParticles(e.x, e.y, e.color, 25, 'spark');
          enemiesRef.current.splice(j, 1);
        }
      }

      // Update Particles
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const pt = particlesRef.current[i];
        pt.x += pt.vx;
        pt.y += pt.vy;
        pt.life--;
        if (pt.life <= 0) {
          particlesRef.current.splice(i, 1);
        }
      }

      // Update Floating Texts
      for (let i = floatingTextsRef.current.length - 1; i >= 0; i--) {
        const ft = floatingTextsRef.current[i];
        ft.y -= 1.2;
        ft.life--;
        if (ft.life <= 0) {
          floatingTextsRef.current.splice(i, 1);
        }
      }

      // Update Slashes
      for (let i = slashesRef.current.length - 1; i >= 0; i--) {
        const sl = slashesRef.current[i];
        sl.life--;
        if (sl.life <= 0) {
          slashesRef.current.splice(i, 1);
        }
      }

      // Update Stats for Parent UI
      if (frameCount.current % 15 === 0) {
        onStatsUpdate({
          bulletsTanked: p.bulletsTanked,
          kills: p.kills,
          hype: p.hype,
          score: p.score,
        });
      }

      // ========================================================
      // RENDERING SECTION
      // ========================================================
      ctx.save();

      // Screen Shake
      if (screenShake.current > 0) {
        const shakeX = (Math.random() - 0.5) * screenShake.current;
        const shakeY = (Math.random() - 0.5) * screenShake.current;
        ctx.translate(shakeX, shakeY);
        screenShake.current *= 0.88;
        if (screenShake.current < 0.5) screenShake.current = 0;
      }

      // Clear Screen with stylish cyber arena grid
      ctx.fillStyle = '#090d16';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Grid background
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.lineWidth = 1;
      const gridSize = 40;
      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Time Stop Visual Inversion Wash
      if (p.timeStopActive) {
        ctx.fillStyle = 'rgba(168, 85, 247, 0.15)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Menacing Kanji "ゴゴゴゴ" floating around screen
        ctx.fillStyle = 'rgba(216, 180, 254, 0.25)';
        ctx.font = 'bold 36px sans-serif';
        ctx.fillText('ゴゴゴゴ', 50, 100);
        ctx.fillText('ゴゴゴゴ', canvas.width - 150, 180);
        ctx.fillText('ゴゴゴゴ', canvas.width / 2 - 50, canvas.height - 80);
      }

      // Draw Enemies
      enemiesRef.current.forEach(enemy => {
        ctx.save();
        ctx.translate(enemy.x, enemy.y);

        // Enemy Aura
        ctx.beginPath();
        ctx.arc(0, 0, enemy.radius + 4, 0, Math.PI * 2);
        ctx.fillStyle = `${enemy.color}22`;
        ctx.fill();

        // Enemy Body
        ctx.beginPath();
        ctx.arc(0, 0, enemy.radius, 0, Math.PI * 2);
        ctx.fillStyle = enemy.color;
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Enemy Eyes / Core
        ctx.beginPath();
        ctx.arc(enemy.facing * 6, -3, enemy.radius * 0.3, 0, Math.PI * 2);
        ctx.fillStyle = '#111827';
        ctx.fill();

        // Eye Pupil
        ctx.beginPath();
        ctx.arc(enemy.facing * 8, -3, 3, 0, Math.PI * 2);
        ctx.fillStyle = '#ef4444';
        ctx.fill();

        // Gun barrel
        ctx.fillStyle = '#64748b';
        ctx.fillRect(enemy.facing > 0 ? enemy.radius - 2 : -enemy.radius - 10, -4, 12, 8);

        // Health Bar
        const barW = enemy.radius * 2.2;
        const barH = 4;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(-barW / 2, -enemy.radius - 12, barW, barH);
        ctx.fillStyle = '#22c55e';
        const hpPercent = Math.max(0, enemy.hp / enemy.maxHp);
        ctx.fillRect(-barW / 2, -enemy.radius - 12, barW * hpPercent, barH);

        // Type label
        ctx.fillStyle = '#94a3b8';
        ctx.font = '10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(enemy.type.toUpperCase(), 0, enemy.radius + 14);

        ctx.restore();
      });

      // Draw Bullets
      bulletsRef.current.forEach(b => {
        // Bullet Trail
        if (b.trail.length > 1) {
          ctx.beginPath();
          ctx.moveTo(b.trail[0].x, b.trail[0].y);
          for (let t = 1; t < b.trail.length; t++) {
            ctx.lineTo(b.trail[t].x, b.trail[t].y);
          }
          ctx.strokeStyle = `${b.color}55`;
          ctx.lineWidth = b.radius * 1.5;
          ctx.stroke();
        }

        // Bullet Glow
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius * 1.6, 0, Math.PI * 2);
        ctx.fillStyle = `${b.color}44`;
        ctx.fill();

        // Bullet Core
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
        ctx.fillStyle = b.isFriendly ? '#ffffff' : b.color;
        ctx.fill();
        ctx.strokeStyle = b.isFriendly ? '#22c55e' : '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      });

      // Draw Slashes
      slashesRef.current.forEach(sl => {
        const alpha = sl.life / sl.maxLife;
        ctx.save();
        ctx.strokeStyle = sl.color;
        ctx.lineWidth = sl.width * alpha;
        ctx.lineCap = 'round';
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.moveTo(sl.x1, sl.y1);
        ctx.lineTo(sl.x2, sl.y2);
        ctx.stroke();
        ctx.restore();
      });

      // Draw Particles
      particlesRef.current.forEach(pt => {
        const alpha = pt.life / pt.maxLife;
        ctx.save();
        ctx.globalAlpha = alpha;
        if (pt.type === 'kanji' && pt.text) {
          ctx.fillStyle = pt.color;
          ctx.font = `bold ${pt.size * 2.8}px sans-serif`;
          ctx.fillText(pt.text, pt.x, pt.y);
        } else if (pt.type === 'heart') {
          ctx.fillStyle = pt.color;
          ctx.font = `${pt.size * 2}px sans-serif`;
          ctx.fillText('💖', pt.x, pt.y);
        } else {
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, pt.size * alpha, 0, Math.PI * 2);
          ctx.fillStyle = pt.color;
          ctx.fill();
        }
        ctx.restore();
      });

      // ========================================================
      // DRAW THE UNSTOPPABLE ANIME PROTAGONIST HERO
      // ========================================================
      ctx.save();
      ctx.translate(p.x, p.y);

      // Super Power Flame Aura / Godly Glow
      const auraScale = p.isSuperPowered ? 1.8 + Math.sin(p.auraPulse) * 0.3 : 1.2 + Math.sin(p.auraPulse) * 0.1;
      const grad = ctx.createRadialGradient(0, 0, p.radius * 0.6, 0, 0, p.radius * auraScale);
      grad.addColorStop(0, character.auraColor);
      grad.addColorStop(0.6, `${character.accentColor}33`);
      grad.addColorStop(1, 'rgba(0,0,0,0)');

      ctx.beginPath();
      ctx.arc(0, 0, p.radius * auraScale, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();

      // Fluttering Cape / Ninja Scarf behind player
      const capeWave = Math.sin(frameCount.current * 0.15) * 8;
      ctx.beginPath();
      ctx.moveTo(-p.facing * 12, -4);
      ctx.quadraticCurveTo(-p.facing * 28, capeWave, -p.facing * 34, capeWave + 12);
      ctx.lineTo(-p.facing * 10, 8);
      ctx.closePath();
      ctx.fillStyle = character.accentColor;
      ctx.fill();

      // Hero Body
      ctx.beginPath();
      ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = '#0f172a';
      ctx.fill();
      ctx.strokeStyle = character.accentColor;
      ctx.lineWidth = p.isSuperPowered ? 4 : 2.5;
      ctx.stroke();

      // Anime Spiky Hair
      ctx.fillStyle = character.hairColor;
      ctx.beginPath();
      ctx.moveTo(-16, -14);
      ctx.lineTo(-24, -30);
      ctx.lineTo(-8, -22);
      ctx.lineTo(0, -36);
      ctx.lineTo(8, -22);
      ctx.lineTo(24, -30);
      ctx.lineTo(16, -14);
      ctx.closePath();
      ctx.fill();

      // Hero Headband / Accent Strip
      ctx.fillStyle = character.accentColor;
      ctx.fillRect(-18, -10, 36, 6);

      // Hero Anime Eyes
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(p.facing * 7, -2, 5, 0, Math.PI * 2);
      ctx.fill();
      // Pupil glowing
      ctx.fillStyle = p.isSuperPowered ? '#f59e0b' : '#38bdf8';
      ctx.beginPath();
      ctx.arc(p.facing * 8, -2, 2.5, 0, Math.PI * 2);
      ctx.fill();

      // Katana / Weapon on back
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-p.facing * 18, 14);
      ctx.lineTo(p.facing * 22, -26);
      ctx.stroke();

      // "BULLET-PROOF" Hero Shield Indicator Ring
      ctx.beginPath();
      ctx.arc(0, 0, p.radius + 6, 0, Math.PI * 2);
      ctx.strokeStyle = p.isSuperPowered ? '#fbbf24' : 'rgba(255,255,255,0.2)';
      ctx.setLineDash([6, 6]);
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.restore();

      // Draw Floating Texts
      floatingTextsRef.current.forEach(ft => {
        ctx.save();
        ctx.font = ft.fontBold ? `bold ${16 * ft.scale}px sans-serif` : `${14 * ft.scale}px sans-serif`;
        ctx.fillStyle = ft.color;
        ctx.textAlign = 'center';
        ctx.shadowColor = '#000000';
        ctx.shadowBlur = 4;
        ctx.fillText(ft.text, ft.x, ft.y);
        ctx.restore();
      });

      ctx.restore();

      if (!isPaused) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', updateCanvasSize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [character, bulletFrenzyActive, isPaused, spawnEnemy, triggerAnimeOut, addFloatingText, spawnParticles, onStatsUpdate]);

  // Pointer & Touch Handlers
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    mousePos.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      isDown: true,
    };
    touchActive.current = true;
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    mousePos.current.x = e.clientX - rect.left;
    mousePos.current.y = e.clientY - rect.top;
  };

  const handlePointerUp = () => {
    mousePos.current.isDown = false;
    touchActive.current = false;
  };

  return (
    <div className="relative w-full h-full overflow-hidden select-none bg-slate-950">
      <canvas
        ref={canvasRef}
        id="game-canvas"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="w-full h-full block cursor-crosshair touch-none"
      />
    </div>
  );
};
