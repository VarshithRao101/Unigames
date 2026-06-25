"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import { useUnigamesSDK } from "../sdk";
import { Button } from "@/components/ui/button";
import { RefreshCw, Trophy, Bot, Volume2, VolumeX, RotateCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams } from "next/navigation";

// ── Retro Web Audio API Synth ──
class SoundSynth {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  constructor() {
    // Lazy initialized on first interaction
  }

  private init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
  }

  public play(type: "roll" | "move" | "cut" | "win" | "turn" | "invalid") {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      
      // Resume if suspended by browser security
      if (this.ctx.state === "suspended") {
        this.ctx.resume();
      }

      const now = this.ctx.currentTime;

      if (type === "roll") {
        // Roll: click tumbling noise
        for (let i = 0; i < 6; i++) {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = "sawtooth";
          osc.frequency.setValueAtTime(150 + i * 80, now + i * 0.05);
          gain.gain.setValueAtTime(0.12, now + i * 0.05);
          gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.05 + 0.04);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now + i * 0.05);
          osc.stop(now + i * 0.05 + 0.04);
        }
      } else if (type === "move") {
        // Move: ascending retro chirp
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(680, now + 0.12);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.12);
      } else if (type === "cut") {
        // Cut/Capture: noise slide down crash
        const osc = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.linearRampToValueAtTime(80, now + 0.45);
        osc2.type = "triangle";
        osc2.frequency.setValueAtTime(300, now);
        osc2.frequency.linearRampToValueAtTime(40, now + 0.45);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.45);
        osc.connect(gain);
        osc2.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc2.start(now);
        osc.stop(now + 0.45);
        osc2.stop(now + 0.45);
      } else if (type === "win") {
        // Win Fanfare: major chords
        const notes = [261.63, 329.63, 392.00, 523.25]; // C, E, G, C5
        notes.forEach((freq, idx) => {
          const osc = this.ctx!.createOscillator();
          const gain = this.ctx!.createGain();
          osc.type = "triangle";
          osc.frequency.setValueAtTime(freq, now + idx * 0.1);
          gain.gain.setValueAtTime(0.15, now + idx * 0.1);
          gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.1 + 0.25);
          osc.connect(gain);
          gain.connect(this.ctx!.destination);
          osc.start(now + idx * 0.1);
          osc.stop(now + idx * 0.1 + 0.25);
        });
      } else if (type === "turn") {
        // Subtle tone
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(440, now);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.08);
      } else if (type === "invalid") {
        // Low growl buzz
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(100, now);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.2);
      }
    } catch (e) {
      console.warn("Sound play failure:", e);
    }
  }
}

const synth = new SoundSynth();

// ── Ludo Board Grid Navigation Tracks ──
export const TRACK = [
  [1, 6], [2, 6], [3, 6], [4, 6], [5, 6],
  [6, 5], [6, 4], [6, 3], [6, 2], [6, 1], [6, 0],
  [7, 0], [8, 0],
  [8, 1], [8, 2], [8, 3], [8, 4], [8, 5],
  [9, 6], [10, 6], [11, 6], [12, 6], [13, 6], [14, 6],
  [14, 7], [14, 8],
  [13, 8], [12, 8], [11, 8], [10, 8], [9, 8],
  [8, 9], [8, 10], [8, 11], [8, 12], [8, 13], [8, 14],
  [7, 14], [6, 14],
  [6, 13], [6, 12], [6, 11], [6, 10], [6, 9],
  [5, 8], [4, 8], [3, 8], [2, 8], [1, 8], [0, 8],
  [0, 7], [0, 6]
];

export const COLOR_OFFSETS = {
  RED: 0,
  GREEN: 13,
  YELLOW: 26,
  BLUE: 39
};

export const HOME_LANES = {
  RED: [[1, 7], [2, 7], [3, 7], [4, 7], [5, 7]],
  GREEN: [[7, 1], [7, 2], [7, 3], [7, 4], [7, 5]],
  YELLOW: [[13, 7], [12, 7], [11, 7], [10, 7], [9, 7]],
  BLUE: [[7, 13], [7, 12], [7, 11], [7, 10], [7, 9]]
};

export const HOME_PARKS = {
  RED: [[1.5, 1.5], [3.5, 1.5], [1.5, 3.5], [3.5, 3.5]],
  GREEN: [[10.5, 1.5], [12.5, 1.5], [10.5, 3.5], [12.5, 3.5]],
  YELLOW: [[10.5, 10.5], [12.5, 10.5], [10.5, 12.5], [12.5, 12.5]],
  BLUE: [[1.5, 10.5], [3.5, 10.5], [1.5, 12.5], [3.5, 12.5]]
};

export const SAFE_ZONES = [0, 8, 13, 21, 26, 34, 39, 47];

export const LUDO_COLORS = ["RED", "GREEN", "YELLOW", "BLUE"] as const;
export type LudoColor = typeof LUDO_COLORS[number];

export interface LudoToken {
  id: string; // "0" | "1" | "2" | "3"
  color: LudoColor;
  position: number; // -1 = HOME, 0-51 = BOARD, 52-56 = SAFE LANE, 57 = FINISHED
  state: "HOME" | "BOARD" | "SAFE" | "FINISHED";
}

export interface LudoPlayerProfile {
  id: string;
  name: string;
  avatar: string;
  isAI: boolean;
  color: LudoColor;
}

// Map logical coordinates to board size percentage
export function getPieceBoardPosition(color: LudoColor, position: number, index: number): [number, number] {
  if (position === -1) return HOME_PARKS[color][index] as [number, number];
  if (position === 57) return [7.5, 7.5];
  if (position >= 52) return HOME_LANES[color][position - 52] as [number, number];
  
  const absoluteIndex = (position + COLOR_OFFSETS[color]) % 52;
  const coords = TRACK[absoluteIndex];
  return [coords[0] + 0.5, coords[1] + 0.5];
}

export function getAbsolutePosition(color: LudoColor, position: number): number {
  if (position < 0 || position > 51) return -1;
  return (position + COLOR_OFFSETS[color]) % 52;
}

export function getValidMoves(tokens: LudoToken[], color: LudoColor, diceValue: number): LudoToken[] {
  return tokens.filter(token => {
    if (token.color !== color) return false;
    if (token.state === "FINISHED") return false;
    if (token.state === "HOME") return diceValue === 6;
    return token.position + diceValue <= 57;
  });
}

// ── Draw Ludo Board Function ──
function drawBoard(ctx: CanvasRenderingContext2D, size: number) {
  const C = size / 15;
  ctx.clearRect(0, 0, size, size);

  // Background
  ctx.fillStyle = "#f4f5f0";
  ctx.fillRect(0, 0, size, size);

  const colors = {
    RED: "#ff4d4d",
    GREEN: "#2ebb5c",
    YELLOW: "#ffb900",
    BLUE: "#3b82f6"
  };

  const drawHome = (col: number, row: number, color: string) => {
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.25;
    ctx.fillRect(col * C, row * C, C * 6, C * 6);
    ctx.globalAlpha = 1;

    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 4.5;
    ctx.strokeRect(col * C, row * C, C * 6, C * 6);

    ctx.fillStyle = "#ffffff";
    roundRect(ctx, (col + 1) * C, (row + 1) * C, C * 4, C * 4, 12);
    ctx.fill();
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 3.5;
    ctx.stroke();

    const positions = [[1.5, 1.5], [3.5, 1.5], [1.5, 3.5], [3.5, 3.5]];
    positions.forEach(([x, y]) => {
      ctx.beginPath();
      ctx.arc((col + x + 0.5) * C, (row + y + 0.5) * C, C * 0.45, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.2;
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 3;
      ctx.stroke();
    });
  };

  drawHome(0, 0, colors.RED);
  drawHome(9, 0, colors.GREEN);
  drawHome(9, 9, colors.YELLOW);
  drawHome(0, 9, colors.BLUE);

  // Draw 15x15 tiles grid
  ctx.lineWidth = 2.5;
  for (let r = 0; r < 15; r++) {
    for (let c = 0; c < 15; c++) {
      const isHome = (c < 6 && r < 6) || (c > 8 && r < 6) || (c > 8 && r > 8) || (c < 6 && r > 8);
      if (!isHome) {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(c * C, r * C, C, C);
        ctx.strokeStyle = "#000000";
        ctx.strokeRect(c * C, r * C, C, C);
      }
    }
  }

  // Draw start squares stars
  const startSquares: [number, number, string][] = [
    [1, 6, colors.RED],
    [8, 1, colors.GREEN],
    [13, 8, colors.YELLOW],
    [6, 13, colors.BLUE],
  ];
  startSquares.forEach(([c, r, color]) => {
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.45;
    ctx.fillRect(c * C, r * C, C, C);
    ctx.globalAlpha = 1;
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 3.5;
    ctx.strokeRect(c * C, r * C, C, C);

    const cx = (c + 0.5) * C;
    const cy = (r + 0.5) * C;
    drawStar(ctx, cx, cy, C * 0.16, C * 0.36, 5);
    ctx.fillStyle = "#ffb900";
    ctx.fill();
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 2;
    ctx.stroke();
  });

  // Safe squares stars
  const safeSquares: [number, number][] = [
    [2, 8], [6, 2], [12, 6], [8, 12]
  ];
  safeSquares.forEach(([c, r]) => {
    const cx = (c + 0.5) * C;
    const cy = (r + 0.5) * C;
    drawStar(ctx, cx, cy, C * 0.16, C * 0.36, 5);
    ctx.fillStyle = "#ffb900";
    ctx.fill();
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 2;
    ctx.stroke();
  });

  // Draw Colored home lanes
  const drawLane = (cells: number[][], color: string) => {
    cells.forEach(([c, r]) => {
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.4;
      ctx.fillRect(c * C, r * C, C, C);
      ctx.globalAlpha = 1;
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 2.5;
      ctx.strokeRect(c * C, r * C, C, C);
    });
  };
  drawLane([[1, 7], [2, 7], [3, 7], [4, 7], [5, 7]], colors.RED);
  drawLane([[7, 1], [7, 2], [7, 3], [7, 4], [7, 5]], colors.GREEN);
  drawLane([[13, 7], [12, 7], [11, 7], [10, 7], [9, 7]], colors.YELLOW);
  drawLane([[7, 13], [7, 12], [7, 11], [7, 10], [7, 9]], colors.BLUE);

  // Draw center finishing triangles
  const drawTriangle = (p1: [number, number], p2: [number, number], p3: [number, number], color: string) => {
    ctx.beginPath();
    ctx.moveTo(p1[0] * C, p1[1] * C);
    ctx.lineTo(p2[0] * C, p2[1] * C);
    ctx.lineTo(p3[0] * C, p3[1] * C);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 4;
    ctx.stroke();
  };
  drawTriangle([6, 6], [9, 6], [7.5, 7.5], colors.GREEN);
  drawTriangle([9, 6], [9, 9], [7.5, 7.5], colors.YELLOW);
  drawTriangle([9, 9], [6, 9], [7.5, 7.5], colors.BLUE);
  drawTriangle([6, 9], [6, 6], [7.5, 7.5], colors.RED);

  // Center logo frame
  ctx.beginPath();
  ctx.arc(7.5 * C, 7.5 * C, C * 0.5, 0, Math.PI * 2);
  ctx.fillStyle = "#ffffff";
  ctx.fill();
  ctx.strokeStyle = "#000000";
  ctx.lineWidth = 3.5;
  ctx.stroke();

  ctx.fillStyle = "#000000";
  ctx.font = `black ${C * 0.32}px Outfit, Inter, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("HOME", 7.5 * C, 7.5 * C);
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function drawStar(ctx: CanvasRenderingContext2D, cx: number, cy: number, innerR: number, outerR: number, points: number) {
  ctx.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const angle = (Math.PI / points) * i - Math.PI / 2;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
}

export default function LudoGame() {
  const sdk = useUnigamesSDK();
  const { match, players, isSpectator, localPlayer } = sdk;
  const searchParams = useSearchParams();
  const isAiMode = searchParams?.get("ai") === "true";
  const gameState = match.gameState || {};

  const [soundEnabled, setSoundEnabled] = useState(true);

  // Game configuration & variables
  const ludoPlayers: LudoPlayerProfile[] = useMemo(() => {
    if (gameState.ludoPlayers) return gameState.ludoPlayers;
    
    // Initialize players lists with colors
    const colors: LudoColor[] = ["RED", "YELLOW", "GREEN", "BLUE"];
    if (players.length === 2) {
      return [
        { id: players[0].id, name: players[0].name, avatar: players[0].avatar || "P1", isAI: players[0].isAI, color: "RED" },
        { id: players[1].id, name: players[1].name, avatar: players[1].avatar || "P2", isAI: players[1].isAI, color: "YELLOW" }
      ];
    } else if (players.length === 3) {
      return [
        { id: players[0].id, name: players[0].name, avatar: players[0].avatar || "P1", isAI: players[0].isAI, color: "RED" },
        { id: players[1].id, name: players[1].name, avatar: players[1].avatar || "P2", isAI: players[1].isAI, color: "GREEN" },
        { id: players[2].id, name: players[2].name, avatar: players[2].avatar || "P3", isAI: players[2].isAI, color: "YELLOW" }
      ];
    } else {
      // 4 Players standard
      return players.map((p, idx) => ({
        id: p.id,
        name: p.name,
        avatar: p.avatar || `P${idx+1}`,
        isAI: p.isAI,
        color: colors[idx]
      }));
    }
  }, [players, gameState.ludoPlayers]);

  const activeTurnColor: LudoColor = gameState.currentTurnColor || "RED";
  const activeTurnPlayer = ludoPlayers.find(p => p.color === activeTurnColor);
  const isMyTurn = activeTurnPlayer && localPlayer && activeTurnPlayer.id === localPlayer.id;

  const diceValue = gameState.diceValue || null;
  const tokens: LudoToken[] = useMemo(() => {
    if (gameState.tokens) return gameState.tokens;
    // Setup initial 4 tokens for each active color
    const initialTokens: LudoToken[] = [];
    ludoPlayers.forEach(p => {
      for (let i = 0; i < 4; i++) {
        initialTokens.push({
          id: `${i}`,
          color: p.color,
          position: -1,
          state: "HOME"
        });
      }
    });
    return initialTokens;
  }, [ludoPlayers, gameState.tokens]);

  const consecutiveSixes = gameState.consecutiveSixes || 0;
  const pendingBonusTurn = gameState.pendingBonusTurn || false;
  const roundWinnerId = gameState.roundWinnerId || null;
  const roundOver = gameState.roundOver || false;
  const placements: string[] = gameState.placements || [];
  const turnExpiresAt = gameState.turnExpiresAt || 0;

  // Dice visual rolling states
  const [isRollingAnimation, setIsRollingAnimation] = useState(false);
  const [rollingDiceNum, setRollingDiceNum] = useState<number | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const botThinkingRef = useRef<boolean>(false);

  // Sync sound setting
  useEffect(() => {
    synth.enabled = soundEnabled;
  }, [soundEnabled]);

  // Sync turn switch trigger sound
  useEffect(() => {
    if (activeTurnColor && !roundOver) {
      synth.play("turn");
    }
  }, [activeTurnColor, roundOver]);

  // Repaint canvas board
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const container = canvas.parentElement;
    if (!container) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const paint = () => {
      const size = container.clientWidth;
      if (size <= 0) return;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.round(size * dpr);
      canvas.height = Math.round(size * dpr);
      canvas.style.width = "100%";
      canvas.style.height = "100%";
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
      drawBoard(ctx, size);
    };

    paint();
    const observer = new ResizeObserver(paint);
    observer.observe(container);

    return () => observer.disconnect();
  }, []);

  // Pass Turn Logic helper
  const passTurnColor = (current: LudoColor, activeList: LudoPlayerProfile[], currentTokens: LudoToken[]): LudoColor => {
    const order: LudoColor[] = ["RED", "GREEN", "YELLOW", "BLUE"];
    let currIdx = order.indexOf(current);
    
    // Loop around to find next color that has not finished all tokens
    for (let i = 0; i < 4; i++) {
      currIdx = (currIdx + 1) % 4;
      const nextColor = order[currIdx];
      const hasPlayer = activeList.some(p => p.color === nextColor);
      if (!hasPlayer) continue;

      const playerTokens = currentTokens.filter(t => t.color === nextColor);
      const allFinished = playerTokens.every(t => t.state === "FINISHED");
      if (!allFinished) {
        return nextColor;
      }
    }
    return current;
  };

  // Bot Turn Automation Controller (coordinated by Host)
  const isHost = localPlayer?.isHost || false;
  useEffect(() => {
    if (!isHost || roundOver) return;

    // Check if current active player color is a Bot
    const isBotActive = activeTurnPlayer && activeTurnPlayer.isAI;
    if (isBotActive && !botThinkingRef.current) {
      botThinkingRef.current = true;

      // 1. Simulate Bot Dice Roll after 1 second
      setTimeout(() => {
        if (!botThinkingRef.current) return;
        const rolledValue = Math.floor(Math.random() * 6) + 1;
        synth.play("roll");

        // Handle Consecutive Sixes check
        let nextConsecutiveSixes = consecutiveSixes;
        let nextPendingBonusTurn = pendingBonusTurn;
        let nextTurnColor = activeTurnColor;
        let skipMove = false;

        if (rolledValue === 6) {
          nextConsecutiveSixes += 1;
          if (nextConsecutiveSixes === 3) {
            // Consecutive Sixes limit reached -> pass turn
            nextConsecutiveSixes = 0;
            nextPendingBonusTurn = false;
            nextTurnColor = passTurnColor(activeTurnColor, ludoPlayers, tokens);
            skipMove = true;
          } else {
            nextPendingBonusTurn = true;
          }
        } else {
          nextConsecutiveSixes = 0;
        }

        const validMoves = getValidMoves(tokens, activeTurnColor, rolledValue);

        if (skipMove || validMoves.length === 0) {
          // No moves possible -> pass or reset bonus
          botThinkingRef.current = false;
          sdk.updateState({
            diceValue: rolledValue,
            consecutiveSixes: nextConsecutiveSixes,
            pendingBonusTurn: false,
            currentTurnColor: nextPendingBonusTurn ? activeTurnColor : nextTurnColor,
            turnExpiresAt: Date.now() + 30000
          });
          return;
        }

        // 2. Select best move after another 1.2s delay representing thinking time
        setTimeout(() => {
          if (!botThinkingRef.current) return;
          botThinkingRef.current = false;

          const chosenToken = selectStrategicBotMove(validMoves, tokens, activeTurnColor, rolledValue);
          executeMove(chosenToken, rolledValue, nextConsecutiveSixes, nextPendingBonusTurn);
        }, 1200);

      }, 1000);
    }
  }, [isHost, activeTurnColor, diceValue, tokens, roundOver]);

  // Strategic AI Move selector
  const selectStrategicBotMove = (
    validTokens: LudoToken[],
    allTokens: LudoToken[],
    botColor: LudoColor,
    rolledValue: number
  ): LudoToken => {
    // Score each move option to pick the optimal one
    let bestScore = -9999;
    let selected = validTokens[0];

    validTokens.forEach(token => {
      let score = 0;
      const targetPos = token.position === -1 ? 0 : token.position + rolledValue;

      // 1. Capture Opponent Check (Max Priority)
      if (token.state !== "HOME" && targetPos <= 51) {
        const targetAbs = getAbsolutePosition(botColor, targetPos);
        if (!SAFE_ZONES.includes(targetAbs)) {
          const cuttableOpponent = allTokens.some(opp => {
            if (opp.color === botColor || opp.state !== "BOARD" || opp.position > 51) return false;
            const oppAbs = getAbsolutePosition(opp.color, opp.position);
            return oppAbs === targetAbs;
          });
          if (cuttableOpponent) score += 1000;
        }
      }

      // 2. Finished check (High priority)
      if (targetPos === 57) {
        score += 800;
      }

      // 3. Release from HOME check (High priority)
      if (token.state === "HOME" && rolledValue === 6) {
        score += 500;
      }

      // 4. Entering Safe Zone check
      if (token.state === "BOARD" && targetPos > 51) {
        score += 150;
      }

      // 5. Landing on safe zone star
      const nextAbs = getAbsolutePosition(botColor, targetPos);
      if (SAFE_ZONES.includes(nextAbs)) {
        score += 100;
      }

      // 6. Escape danger check: check if an opponent token was 1-6 cells behind us
      if (token.state === "BOARD") {
        const currentAbs = getAbsolutePosition(botColor, token.position);
        const inDanger = allTokens.some(opp => {
          if (opp.color === botColor || opp.state !== "BOARD" || opp.position > 51) return false;
          const oppAbs = getAbsolutePosition(opp.color, opp.position);
          const dist = (currentAbs - oppAbs + 52) % 52;
          return dist >= 1 && dist <= 6;
        });
        if (inDanger) {
          score += 80; // incentive to escape danger
        }
      }

      // 7. Progress Weight
      score += token.position; // prefer advancing forward tokens

      if (score > bestScore) {
        bestScore = score;
        selected = token;
      }
    });

    return selected;
  };

  // Roll Dice trigger for local player
  const handleRollDice = () => {
    if (!isMyTurn || diceValue !== null || roundOver || isRollingAnimation) return;

    setIsRollingAnimation(true);
    synth.play("roll");

    // Cycle numbers fast for rolling visual effect
    let count = 0;
    const interval = setInterval(() => {
      setRollingDiceNum(Math.floor(Math.random() * 6) + 1);
      count++;
      if (count > 8) {
        clearInterval(interval);
        
        const rolled = Math.floor(Math.random() * 6) + 1;
        setRollingDiceNum(rolled);
        setIsRollingAnimation(false);

        let nextConsecutiveSixes = consecutiveSixes;
        let nextPendingBonusTurn = pendingBonusTurn;
        let nextTurnColor = activeTurnColor;
        let skipMove = false;

        if (rolled === 6) {
          nextConsecutiveSixes += 1;
          if (nextConsecutiveSixes === 3) {
            // Consecutive Six check
            nextConsecutiveSixes = 0;
            nextPendingBonusTurn = false;
            nextTurnColor = passTurnColor(activeTurnColor, ludoPlayers, tokens);
            skipMove = true;
          } else {
            nextPendingBonusTurn = true;
          }
        } else {
          nextConsecutiveSixes = 0;
        }

        const validMoves = getValidMoves(tokens, activeTurnColor, rolled);

        if (skipMove || validMoves.length === 0) {
          sdk.updateState({
            diceValue: rolled,
            consecutiveSixes: nextConsecutiveSixes,
            pendingBonusTurn: false,
            currentTurnColor: nextPendingBonusTurn ? activeTurnColor : nextTurnColor,
            turnExpiresAt: Date.now() + 30000
          });
        } else {
          // Tokens can be moved
          sdk.updateState({
            diceValue: rolled,
            consecutiveSixes: nextConsecutiveSixes,
            pendingBonusTurn: nextPendingBonusTurn,
            turnExpiresAt: Date.now() + 30000
          });
        }
      }
    }, 60);
  };

  // Execute token movement
  const handleTokenClick = (token: LudoToken) => {
    if (!isMyTurn || diceValue === null || roundOver) return;

    const validMoves = getValidMoves(tokens, activeTurnColor, diceValue);
    if (!validMoves.some(t => t.id === token.id)) {
      synth.play("invalid");
      return;
    }

    executeMove(token, diceValue, consecutiveSixes, pendingBonusTurn);
  };

  const executeMove = (
    token: LudoToken,
    rolled: number,
    nextConsecutiveSixes: number,
    nextPendingBonusTurn: boolean
  ) => {
    let soundToPlay: "move" | "cut" | "win" = "move";
    let givesBonusRoll = nextPendingBonusTurn;

    // Create next tokens positions clone
    const nextTokens = tokens.map((t): LudoToken => {
      if (t.id === token.id && t.color === token.color) {
        let nextPos = t.position;
        let nextState = t.state;

        if (t.state === "HOME") {
          nextPos = 0;
          nextState = "BOARD";
        } else {
          nextPos += rolled;
        }

        if (nextPos >= 52 && nextPos < 57) {
          nextState = "SAFE";
        } else if (nextPos === 57) {
          nextState = "FINISHED";
          givesBonusRoll = true;
          soundToPlay = "win";
        }

        return { ...t, position: nextPos, state: nextState };
      }
      return t;
    });

    // Check collision cuts
    const movedToken = nextTokens.find(t => t.id === token.id && t.color === token.color)!;
    if (movedToken.state === "BOARD" && movedToken.position <= 51) {
      const movedAbs = getAbsolutePosition(movedToken.color, movedToken.position);
      
      if (!SAFE_ZONES.includes(movedAbs)) {
        // Iterate opponents to cut
        nextTokens.forEach(opp => {
          if (opp.color === movedToken.color || opp.state !== "BOARD" || opp.position > 51) return;
          
          const oppAbs = getAbsolutePosition(opp.color, opp.position);
          if (oppAbs === movedAbs) {
            // Check Blockade: if opponent has 2+ same-colored tokens on this space, it forms a blockade
            const oppCountOnSpace = nextTokens.filter(t => 
              t.color === opp.color && 
              t.state === "BOARD" && 
              t.position <= 51 && 
              getAbsolutePosition(t.color, t.position) === movedAbs
            ).length;

            if (oppCountOnSpace === 1) {
              // Capture opponent token
              opp.state = "HOME";
              opp.position = -1;
              givesBonusRoll = true;
              soundToPlay = "cut";
            }
          }
        });
      }
    }

    synth.play(soundToPlay);

    // Calculate game placements & round over checks
    let nextPlacements = [...placements];
    const playerTokens = nextTokens.filter(t => t.color === movedToken.color);
    const finishedAll = playerTokens.every(t => t.state === "FINISHED");
    
    if (finishedAll && !nextPlacements.includes(movedToken.color)) {
      nextPlacements.push(movedToken.color);
    }

    const playingPlayersCount = ludoPlayers.length;
    const finishedPlayersCount = nextPlacements.length;
    let nextRoundOver = false;
    let nextWinnerId = roundWinnerId;

    if (finishedPlayersCount >= playingPlayersCount - 1 || finishedPlayersCount === 1 && playingPlayersCount === 2) {
      // 1st place finished in 2-player or rest in 3/4-player
      nextRoundOver = true;
      const winnerColor = nextPlacements[0];
      const winningProfile = ludoPlayers.find(p => p.color === winnerColor);
      nextWinnerId = winningProfile ? winningProfile.id : null;
    }

    let nextTurnColor = activeTurnColor;
    if (finishedAll) {
      // If active player just finished their last piece, pass turn
      givesBonusRoll = false;
    }

    if (!givesBonusRoll) {
      nextTurnColor = passTurnColor(activeTurnColor, ludoPlayers, nextTokens);
    }

    sdk.updateState({
      tokens: nextTokens,
      diceValue: null,
      consecutiveSixes: givesBonusRoll ? nextConsecutiveSixes : 0,
      pendingBonusTurn: false,
      currentTurnColor: nextTurnColor,
      placements: nextPlacements,
      roundWinnerId: nextWinnerId,
      roundOver: nextRoundOver,
      turnExpiresAt: Date.now() + 30000
    });
  };

  // Turn reset helper
  const handleReplayRound = () => {
    botThinkingRef.current = false;
    
    const initialTokens: LudoToken[] = [];
    ludoPlayers.forEach(p => {
      for (let i = 0; i < 4; i++) {
        initialTokens.push({
          id: `${i}`,
          color: p.color,
          position: -1,
          state: "HOME"
        });
      }
    });

    sdk.updateState({
      tokens: initialTokens,
      diceValue: null,
      consecutiveSixes: 0,
      pendingBonusTurn: false,
      currentTurnColor: "RED",
      placements: [],
      roundWinnerId: null,
      roundOver: false,
      turnExpiresAt: Date.now() + 30000
    });
  };

  const handleFinishMatch = () => {
    botThinkingRef.current = false;
    
    const xpPayout: Record<string, number> = {};
    const rankingsList = placements.map(color => {
      const p = ludoPlayers.find(pl => pl.color === color);
      return p ? p.id : "";
    }).filter(Boolean);

    // Assign final scores based on placements
    ludoPlayers.forEach(p => {
      const rankIdx = placements.indexOf(p.color);
      if (rankIdx === 0) xpPayout[p.id] = 100; // 1st
      else if (rankIdx === 1) xpPayout[p.id] = 50; // 2nd
      else xpPayout[p.id] = 20; // 3rd/4th
    });

    sdk.declareWinner(roundWinnerId || "", rankingsList, xpPayout);
  };

  // Group tokens currently occupying the same absolute tile
  const tokenGroups = useMemo(() => {
    const groups: Record<string, LudoToken[]> = {};
    tokens.forEach(t => {
      if (t.state === "FINISHED") return;
      const key = `${t.color}-${t.state === "HOME" ? `home-${t.id}` : t.position}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(t);
    });
    return groups;
  }, [tokens]);

  const activeValidTokens = useMemo(() => {
    if (diceValue === null || roundOver || !isMyTurn) return [];
    return getValidMoves(tokens, activeTurnColor, diceValue);
  }, [tokens, activeTurnColor, diceValue, roundOver, isMyTurn]);

  // Color mapping variables
  const colorClasses = {
    RED: "bg-red-550 border-red-800 text-red-100",
    GREEN: "bg-green-550 border-green-800 text-green-100",
    YELLOW: "bg-amber-550 border-amber-800 text-amber-900",
    BLUE: "bg-blue-550 border-blue-800 text-blue-100"
  };

  const colorThemes: Record<LudoColor, string> = {
    RED: "#ff4d4d",
    GREEN: "#2ebb5c",
    YELLOW: "#ffb900",
    BLUE: "#3b82f6"
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-6 max-w-xl mx-auto py-4 select-none w-full relative">

      {/* Header Panel */}
      {isAiMode && (
        <div className="w-full flex items-center gap-2.5 px-4 py-2.5 rounded-2xl border-3 border-black bg-slate-900/60 shadow-[3px_3px_0px_#000000]">
          <Bot className="w-4 h-4 text-brand-orange shrink-0" />
          <div className="flex-1">
            <p className="font-black text-[8px] uppercase tracking-widest text-brand-orange">AI Practice Mode — NeuroBot</p>
            <p className="text-[7.5px] font-bold text-slate-500 mt-0.5">Results are not saved to profile or leaderboards</p>
          </div>
          <span className="text-[8px] font-black uppercase px-2 py-0.5 rounded-lg border-2 border-black bg-brand-orange text-slate-950">PRACTICE</span>
        </div>
      )}

      {/* Main Container */}
      <div className="w-full grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
        
        {/* Left: Interactive Board */}
        <div className="md:col-span-8 flex flex-col items-center">
          <div className="w-full aspect-square border-4 border-black bg-slate-900 rounded-3xl overflow-hidden shadow-[6px_6px_0px_#000000] relative">
            
            {/* HTML5 Canvas Grid Board */}
            <div className="absolute inset-0 z-0">
              <canvas ref={canvasRef} className="block w-full h-full" />
            </div>

            {/* Pieces / Tokens Layer */}
            <div className="absolute inset-0 z-10 pointer-events-none">
              {Object.entries(tokenGroups).map(([groupKey, groupTokens]) => {
                const sample = groupTokens[0];
                const [cx, cy] = getPieceBoardPosition(sample.color, sample.position, parseInt(sample.id));

                const leftPct = `${(cx / 15) * 100}%`;
                const topPct = `${(cy / 15) * 100}%`;
                const isGroupValid = groupTokens.some(t => activeValidTokens.some(av => av.id === t.id && av.color === t.color));

                return (
                  <div
                    key={groupKey}
                    className="absolute -translate-x-1/2 -translate-y-1/2 flex items-center justify-center"
                    style={{
                      left: leftPct,
                      top: topPct,
                      width: "6.66%",
                      height: "6.66%"
                    }}
                  >
                    <div className="relative w-full h-full flex items-center justify-center">
                      {groupTokens.map((t, index) => {
                        const offsetRatio = groupTokens.length > 1 ? 0.22 : 0;
                        const ox = ((index % 2) - 0.5) * offsetRatio * 100;
                        const oy = (Math.floor(index / 2) - 0.5) * offsetRatio * 100;

                        const isValidMove = activeValidTokens.some(av => av.id === t.id && av.color === t.color);

                        return (
                          <motion.button
                            key={t.id}
                            disabled={!isValidMove}
                            onClick={() => handleTokenClick(t)}
                            className="absolute pointer-events-auto cursor-pointer rounded-full border-2 border-black flex items-center justify-center p-0 select-none shadow-[1px_1px_0px_#000000]"
                            style={{
                              width: groupTokens.length > 1 ? "68%" : "82%",
                              height: groupTokens.length > 1 ? "68%" : "82%",
                              backgroundColor: colorThemes[t.color],
                              left: `calc(50% + ${ox}%)`,
                              top: `calc(50% + ${oy}%)`,
                              transform: "translate(-50%, -50%)",
                              zIndex: 10 + index
                            }}
                            animate={isValidMove ? { scale: [1, 1.25, 1], filter: "brightness(1.15)" } : { scale: 1 }}
                            transition={isValidMove ? { repeat: Infinity, duration: 1.2 } : {}}
                          >
                            {/* Piece highlights shine */}
                            <span className="absolute top-0.5 left-0.5 w-1.5 h-1.5 bg-white/40 rounded-full" />
                            <span className="text-[7.5px] font-black text-black pointer-events-none select-none">
                              {parseInt(t.id) + 1}
                            </span>
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
            
          </div>
        </div>

        {/* Right: Roll Controls & HUD */}
        <div className="md:col-span-4 flex flex-col justify-between space-y-4">
          
          {/* Active Status Display */}
          <div className="p-4 bg-slate-900 border-3 border-black rounded-2xl shadow-[4px_4px_0px_#000000] flex flex-col items-center text-center space-y-3 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:8px_8px] opacity-[0.05] pointer-events-none" />
            
            <span className={`text-[7px] font-black uppercase tracking-widest px-2.5 py-0.5 border border-black rounded shadow-[1px_1px_0px_#000] ${colorClasses[activeTurnColor]}`}>
              {activeTurnColor} TURN
            </span>

            <p className="font-outfit font-black text-sm text-slate-100 mt-1">
              {roundOver 
                ? "Match Finished!" 
                : isMyTurn 
                  ? "YOUR TURN! ROLL!" 
                  : `${activeTurnPlayer?.name || "Opponent"}'s Turn`
              }
            </p>

            {/* Sound Toggler */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="absolute top-2.5 right-2.5 p-1 rounded border border-black bg-slate-800 text-slate-400 hover:text-slate-200 cursor-pointer shadow-[1px_1px_0px_#000]"
            >
              {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Dynamic 3D Dice Display Box */}
          <div className="flex-1 flex flex-col items-center justify-center p-6 bg-slate-900 border-3 border-black rounded-2xl shadow-[4px_4px_0px_#000000] relative">
            <div className="absolute inset-0 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:8px_8px] opacity-[0.05] pointer-events-none" />
            
            {/* HTML/CSS 3D Dice */}
            <div className="dice-container" onClick={handleRollDice}>
              <div 
                className={`dice-cube ${isRollingAnimation ? "rolling" : ""}`}
                style={{
                  transform: getDiceRotation(rollingDiceNum || diceValue || 1)
                }}
              >
                {/* Face 1 */}
                <div className="dice-face face-1 flex items-center justify-center">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-950 shadow-inner" />
                </div>
                {/* Face 2 */}
                <div className="dice-face face-2 flex flex-col justify-between p-2">
                  <div className="flex justify-between w-full">
                    <span className="w-2 h-2 rounded-full bg-slate-950" />
                    <span className="w-2 h-2" />
                  </div>
                  <div className="flex justify-between w-full">
                    <span className="w-2 h-2" />
                    <span className="w-2 h-2 rounded-full bg-slate-950" />
                  </div>
                </div>
                {/* Face 3 */}
                <div className="dice-face face-3 flex flex-col justify-between p-2">
                  <div className="flex justify-between w-full">
                    <span className="w-2 h-2 rounded-full bg-slate-950" />
                    <span className="w-2 h-2" />
                  </div>
                  <div className="flex justify-center w-full">
                    <span className="w-2 h-2 rounded-full bg-slate-950" />
                  </div>
                  <div className="flex justify-between w-full">
                    <span className="w-2 h-2" />
                    <span className="w-2 h-2 rounded-full bg-slate-950" />
                  </div>
                </div>
                {/* Face 4 */}
                <div className="dice-face face-4 flex flex-col justify-between p-2">
                  <div className="flex justify-between w-full">
                    <span className="w-2 h-2 rounded-full bg-slate-950" />
                    <span className="w-2 h-2 rounded-full bg-slate-950" />
                  </div>
                  <div className="flex justify-between w-full">
                    <span className="w-2 h-2 rounded-full bg-slate-950" />
                    <span className="w-2 h-2 rounded-full bg-slate-950" />
                  </div>
                </div>
                {/* Face 5 */}
                <div className="dice-face face-5 flex flex-col justify-between p-2">
                  <div className="flex justify-between w-full">
                    <span className="w-2 h-2 rounded-full bg-slate-950" />
                    <span className="w-2 h-2 rounded-full bg-slate-950" />
                  </div>
                  <div className="flex justify-center w-full">
                    <span className="w-2 h-2 rounded-full bg-slate-950" />
                  </div>
                  <div className="flex justify-between w-full">
                    <span className="w-2 h-2 rounded-full bg-slate-950" />
                    <span className="w-2 h-2 rounded-full bg-slate-950" />
                  </div>
                </div>
                {/* Face 6 */}
                <div className="dice-face face-6 flex flex-col justify-between p-2">
                  <div className="flex justify-between w-full">
                    <span className="w-2 h-2 rounded-full bg-slate-950" />
                    <span className="w-2 h-2 rounded-full bg-slate-950" />
                  </div>
                  <div className="flex justify-between w-full">
                    <span className="w-2 h-2 rounded-full bg-slate-950" />
                    <span className="w-2 h-2 rounded-full bg-slate-950" />
                  </div>
                  <div className="flex justify-between w-full">
                    <span className="w-2 h-2 rounded-full bg-slate-950" />
                    <span className="w-2 h-2 rounded-full bg-slate-950" />
                  </div>
                </div>
              </div>
            </div>

            {/* Standard Roll button */}
            <button
              onClick={handleRollDice}
              disabled={!isMyTurn || diceValue !== null || roundOver || isRollingAnimation}
              className="mt-6 w-full btn-neo rounded-xl h-10 text-[9px] uppercase font-black tracking-widest shadow-[3px_3px_0px_#000] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none select-none cursor-pointer"
            >
              {isRollingAnimation ? "Rolling..." : diceValue !== null ? `Rolled: ${diceValue}` : "Roll Dice"}
            </button>
          </div>

        </div>

      </div>

      {/* Placements & Winners Dialog */}
      <AnimatePresence>
        {roundOver && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full p-6 bg-slate-900 border-4 border-black rounded-3xl shadow-[6px_6px_0px_#000000] text-center space-y-4 relative overflow-hidden"
          >
            <Trophy className="w-12 h-12 text-brand-orange mx-auto animate-bounce" />
            <h3 className="font-outfit font-black text-xl text-white uppercase tracking-tight">Round Over!</h3>
            
            <div className="space-y-2 max-w-xs mx-auto">
              {placements.map((color, index) => {
                const pl = ludoPlayers.find(p => p.color === color);
                return (
                  <div key={color} className="flex items-center justify-between p-2 bg-slate-800 border-2 border-black rounded-xl text-xs font-black shadow-[2px_2px_0px_#000]">
                    <span className="text-slate-400">#{index + 1} Place</span>
                    <span style={{ color: colorThemes[color as LudoColor] }}>{pl?.name || color}</span>
                  </div>
                );
              })}
            </div>

            <div className="flex gap-3 justify-center pt-2">
              {isHost && (
                <Button onClick={handleReplayRound} className="h-9.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-xl border-2 border-black font-black uppercase text-[9px] tracking-wider transition-all">
                  <RotateCcw className="w-3.5 h-3.5 mr-1" /> Replay Round
                </Button>
              )}
              <Button onClick={handleFinishMatch} className="btn-neo h-9.5 px-4 rounded-xl font-black uppercase text-[9px] tracking-wider transition-all">
                Finish Match
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scoped CSS Styles for 3D Dice Cube */}
      <style jsx global>{`
        .dice-container {
          width: 70px;
          height: 70px;
          perspective: 350px;
          cursor: pointer;
        }
        .dice-cube {
          width: 100%;
          height: 100%;
          position: relative;
          transform-style: preserve-3d;
          transition: transform 0.6s cubic-bezier(0.2, 0.8, 0.3, 1.15);
        }
        .dice-face {
          position: absolute;
          width: 70px;
          height: 70px;
          background: #ffffff;
          border: 3.5px solid #000000;
          border-radius: 14px;
          box-shadow: inset -2px -2px 0px rgba(0,0,0,0.15);
          box-sizing: border-box;
        }
        .face-1 { transform: rotateY(0deg) translateZ(35px); }
        .face-2 { transform: rotateY(180deg) translateZ(35px); }
        .face-3 { transform: rotateY(90deg) translateZ(35px); }
        .face-4 { transform: rotateY(-90deg) translateZ(35px); }
        .face-5 { transform: rotateX(90deg) translateZ(35px); }
        .face-6 { transform: rotateX(-90deg) translateZ(35px); }

        @keyframes roll-spin {
          0% { transform: rotateX(0deg) rotateY(0deg) rotateZ(0deg); }
          100% { transform: rotateX(720deg) rotateY(1440deg) rotateZ(360deg); }
        }
        .rolling {
          animation: roll-spin 0.5s infinite linear;
        }
      `}</style>

    </div>
  );
}

// Map dice face values to exact 3D rotations
function getDiceRotation(face: number): string {
  switch (face) {
    case 1: return "rotateX(0deg) rotateY(0deg)";
    case 2: return "rotateX(180deg) rotateY(0deg)";
    case 3: return "rotateX(0deg) rotateY(-90deg)";
    case 4: return "rotateX(0deg) rotateY(90deg)";
    case 5: return "rotateX(-90deg) rotateY(0deg)";
    case 6: return "rotateX(90deg) rotateY(0deg)";
    default: return "rotateX(0deg) rotateY(0deg)";
  }
}
