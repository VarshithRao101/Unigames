"use client";

import React, { useEffect, useRef } from "react";
import { useUnigamesSDK } from "../sdk";
import { Button } from "@/components/ui/button";
import { RefreshCw, Trophy, Bot } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams } from "next/navigation";

// ─── UNBEATABLE MINIMAX AI WITH ALPHA-BETA PRUNING ───────────────
const WIN_LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // cols
  [0, 4, 8], [2, 4, 6],             // diagonals
];

function checkWinnerSymbol(board: string[]): string | null {
  for (const [a, b, c] of WIN_LINES) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) return board[a];
  }
  return null;
}

function minimax(
  board: string[],
  isMaximizing: boolean,
  aiSymbol: string,
  humanSymbol: string,
  alpha: number,
  beta: number,
  depth: number
): number {
  const winner = checkWinnerSymbol(board);
  if (winner === aiSymbol) return 10 - depth;
  if (winner === humanSymbol) return depth - 10;
  if (board.every(c => c !== "")) return 0;

  if (isMaximizing) {
    let best = -Infinity;
    for (let i = 0; i < 9; i++) {
      if (board[i] !== "") continue;
      board[i] = aiSymbol;
      best = Math.max(best, minimax(board, false, aiSymbol, humanSymbol, alpha, beta, depth + 1));
      board[i] = "";
      alpha = Math.max(alpha, best);
      if (beta <= alpha) break;
    }
    return best;
  } else {
    let best = Infinity;
    for (let i = 0; i < 9; i++) {
      if (board[i] !== "") continue;
      board[i] = humanSymbol;
      best = Math.min(best, minimax(board, true, aiSymbol, humanSymbol, alpha, beta, depth + 1));
      board[i] = "";
      beta = Math.min(beta, best);
      if (beta <= alpha) break;
    }
    return best;
  }
}

function getBestAIMove(board: string[], aiSymbol: string, humanSymbol: string): number {
  let bestVal = -Infinity;
  let bestMove = -1;

  // Strategic priority: center first, then corners, then edges
  const priority = [4, 0, 2, 6, 8, 1, 3, 5, 7];

  for (const i of priority) {
    if (board[i] !== "") continue;
    const tempBoard = [...board];
    tempBoard[i] = aiSymbol;
    const moveVal = minimax(tempBoard, false, aiSymbol, humanSymbol, -Infinity, Infinity, 0);
    if (moveVal > bestVal) {
      bestVal = moveVal;
      bestMove = i;
    }
  }
  return bestMove;
}

// ─── AI TAUNT MESSAGES ────────────────────────────────────────────
const AI_THINKING = ["🧠 Calculating...", "⚡ Processing...", "🔮 Predicting..."];
const AI_WIN_TAUNTS = ["🤖 Too easy!", "💀 Resistance is futile!", "🧠 IQ > 9000!", "🎯 Flawless victory!", "⚡ Checkmate, human!"];
const AI_DRAW_TAUNTS = ["🤝 Impressive! You tied the AI!", "🧠 Respect, human!", "⭐ You're the 0.1%!", "🏆 A worthy challenger!"];

export default function TicTacToeGame() {
  const sdk = useUnigamesSDK();
  const { match, players, isSpectator, localPlayer } = sdk;
  const searchParams = useSearchParams();
  const isAiMode = searchParams?.get("ai") === "true";
  const gameState = match.gameState || {};
  const aiThinkingRef = useRef(false);

  // Destructure or assign defaults for board state
  const board = gameState.board || Array(9).fill("");
  const currentTurnPlayerId = gameState.currentTurnPlayerId || (players[0]?.id || "");
  const scores = gameState.scores || { [players[0]?.id || "p1"]: 0, [players[1]?.id || "p2"]: 0 };
  const roundWinnerId = gameState.roundWinnerId || null;
  const isRoundDraw = gameState.isRoundDraw || false;
  const roundOver = gameState.roundOver || false;
  const roundFirstPlayerId: string = gameState.roundFirstPlayerId || (players[0]?.id || "");
  const aiMessage: string = gameState.aiMessage || "";

  // Track active emotes
  const [activeEmotes, setActiveEmotes] = React.useState<Record<string, { text: string; id: number }>>({});

  useEffect(() => {
    if (!match.history || match.history.length === 0) return;
    const latest = match.history[match.history.length - 1];
    if (latest.action && latest.action.startsWith("send_emote:")) {
      try {
        const jsonStr = latest.action.substring("send_emote:".length);
        const data = JSON.parse(jsonStr);
        if (data.emote) {
          const playerId = latest.playerId;
          setActiveEmotes(prev => ({ ...prev, [playerId]: { text: data.emote, id: Date.now() } }));
          setTimeout(() => {
            setActiveEmotes(prev => {
              if (prev[playerId]?.text === data.emote) {
                const copy = { ...prev };
                delete copy[playerId];
                return copy;
              }
              return prev;
            });
          }, 3000);
        }
      } catch (err) {
        console.error("Failed to parse emote action:", err);
      }
    }
  }, [match.history]);

  // Map players to X and O symbols
  const getSymbol = (playerId: string) => {
    if (players[0]?.id === playerId) return "X";
    if (players[1]?.id === playerId) return "O";
    return "";
  };

  const localSymbol = localPlayer ? getSymbol(localPlayer.id) : "";

  // Detect which player is the AI bot
  const aiPlayer = players.find(p => p.id.startsWith("ai-minimax"));
  const aiSymbol = aiPlayer ? getSymbol(aiPlayer.id) : "";
  const humanSymbol = aiSymbol === "X" ? "O" : "X";
  const isAiTurn = isAiMode && aiPlayer && currentTurnPlayerId === aiPlayer.id && !roundOver;
  const isMyTurn = localPlayer && currentTurnPlayerId === localPlayer.id && !roundOver && !isAiTurn;

  // Initialize board state if empty
  useEffect(() => {
    if (players.length >= 2 && !gameState.board) {
      sdk.updateState({
        board: Array(9).fill(""),
        currentTurnPlayerId: players[0]?.id,
        roundFirstPlayerId: players[0]?.id,
        roundWinnerId: null,
        isRoundDraw: false,
        roundOver: false,
        aiMessage: "",
        scores: {
          [players[0]?.id]: 0,
          [players[1]?.id]: 0
        }
      });
    }
  }, [players, gameState.board]);

  // ── AI AUTO-PLAY (Minimax Engine) ──
  useEffect(() => {
    if (!isAiMode || !aiPlayer || !isAiTurn || roundOver) return;
    if (aiThinkingRef.current) return;
    if (board.every((c: string) => c !== "")) return;

    aiThinkingRef.current = true;

    const thinkMsg = AI_THINKING[Math.floor(Math.random() * AI_THINKING.length)];
    sdk.updateState({ ...gameState, aiMessage: thinkMsg });

    // Delay for dramatic effect (300-700ms)
    const delay = 300 + Math.random() * 400;

    const timer = setTimeout(() => {
      aiThinkingRef.current = false;
      const bestMove = getBestAIMove([...board], aiSymbol, humanSymbol);
      if (bestMove === -1) return;

      const nextBoard = [...board];
      nextBoard[bestMove] = aiSymbol;

      const winnerSym = checkWinnerSymbol(nextBoard);
      let nextRoundWinnerId: string | null = null;
      let nextIsRoundDraw = false;
      let nextRoundOver = false;
      const nextScores = { ...scores };
      let msg = "";

      if (winnerSym) {
        nextRoundWinnerId = winnerSym === "X" ? (players[0]?.id || null) : (players[1]?.id || null);
        nextRoundOver = true;
        if (nextRoundWinnerId) nextScores[nextRoundWinnerId] = (nextScores[nextRoundWinnerId] || 0) + 1;
        msg = AI_WIN_TAUNTS[Math.floor(Math.random() * AI_WIN_TAUNTS.length)];
      } else if (nextBoard.every((c: string) => c !== "")) {
        nextIsRoundDraw = true;
        nextRoundOver = true;
        msg = AI_DRAW_TAUNTS[Math.floor(Math.random() * AI_DRAW_TAUNTS.length)];
      }

      const nextTurnPlayerId = currentTurnPlayerId === players[0]?.id
        ? (players[1]?.id || players[0]?.id)
        : players[0]?.id;

      sdk.submitMove("ai_place_marker", { index: bestMove, symbol: aiSymbol });
      sdk.updateState({
        board: nextBoard,
        currentTurnPlayerId: nextTurnPlayerId,
        roundWinnerId: nextRoundWinnerId,
        isRoundDraw: nextIsRoundDraw,
        roundOver: nextRoundOver,
        scores: nextScores,
        roundFirstPlayerId,
        aiMessage: msg,
      });
    }, delay);

    return () => clearTimeout(timer);
  }, [isAiTurn, board.join(""), roundOver]);

  const checkWinnerFromBoard = (tempBoard: string[]) => {
    for (const [a, b, c] of WIN_LINES) {
      if (tempBoard[a] && tempBoard[a] === tempBoard[b] && tempBoard[a] === tempBoard[c]) return tempBoard[a];
    }
    return null;
  };

  const handleCellClick = (index: number) => {
    if (!isMyTurn || board[index] !== "" || roundOver) return;

    const nextBoard = [...board];
    nextBoard[index] = localSymbol;

    const winnerSymbol = checkWinnerFromBoard(nextBoard);
    let nextRoundWinnerId: string | null = null;
    let nextIsRoundDraw = false;
    let nextRoundOver = false;
    const nextScores = { ...scores };

    if (winnerSymbol) {
      nextRoundWinnerId = winnerSymbol === "X" ? (players[0]?.id || null) : (players[1]?.id || null);
      nextRoundOver = true;
      if (nextRoundWinnerId) nextScores[nextRoundWinnerId] = (nextScores[nextRoundWinnerId] || 0) + 1;
    } else if (nextBoard.every(cell => cell !== "")) {
      nextIsRoundDraw = true;
      nextRoundOver = true;
    }

    const nextTurnPlayerId = currentTurnPlayerId === players[0]?.id
      ? (players[1]?.id || players[0]?.id)
      : players[0]?.id;

    sdk.submitMove("place_marker", { index, symbol: localSymbol });
    sdk.updateState({
      board: nextBoard,
      currentTurnPlayerId: nextTurnPlayerId,
      roundWinnerId: nextRoundWinnerId,
      isRoundDraw: nextIsRoundDraw,
      roundOver: nextRoundOver,
      scores: nextScores,
      roundFirstPlayerId,
      aiMessage: "",
    });
  };

  const handleReplayRound = () => {
    aiThinkingRef.current = false;
    const nextFirstPlayerId = roundFirstPlayerId === players[0]?.id
      ? (players[1]?.id || players[0]?.id)
      : players[0]?.id;

    sdk.updateState({
      board: Array(9).fill(""),
      currentTurnPlayerId: nextFirstPlayerId,
      roundFirstPlayerId: nextFirstPlayerId,
      roundWinnerId: null,
      isRoundDraw: false,
      roundOver: false,
      aiMessage: "",
    });
    sdk.submitMove("replay_round");
  };

  const handleFinishMatch = () => {
    const p1 = players[0]?.id || "";
    const p2 = players[1]?.id || "";
    const s1 = scores[p1] || 0;
    const s2 = scores[p2] || 0;

    let finalWinnerId = "";
    if (s1 > s2) finalWinnerId = p1;
    else if (s2 > s1) finalWinnerId = p2;

    // In AI mode, skip stats recording by declaring a "draw" equivalent with no real winner
    sdk.declareWinner(isAiMode ? "" : finalWinnerId, [p1, p2], { [p1]: s1, [p2]: s2 });
  };

  // Status text
  let statusText = "";
  if (aiMessage && isAiTurn) {
    statusText = aiMessage;
  } else if (roundWinnerId) {
    const winnerName = players.find(p => p.id === roundWinnerId)?.name || "Opponent";
    const isLocalWin = roundWinnerId === localPlayer?.id;
    const isAiWin = roundWinnerId === aiPlayer?.id;
    statusText = isLocalWin
      ? `🏆 You Beat the AI! Incredible!`
      : isAiWin
      ? `🤖 ${aiMessage || "NeuroBot wins!"}`
      : `Round Won by ${winnerName}!`;
  } else if (isRoundDraw) {
    statusText = aiMessage || "🤝 It's a Draw! No Points.";
  } else if (isAiTurn) {
    statusText = aiMessage || "🤖 NeuroBot is thinking...";
  } else {
    const activeName = players.find(p => p.id === currentTurnPlayerId)?.name || "Waiting...";
    statusText = currentTurnPlayerId === localPlayer?.id ? "⚡ Your Turn! Make a Move!" : `⏳ ${activeName}'s Turn...`;
  }

  const isPlayer1Active = currentTurnPlayerId === players[0]?.id && !roundOver;
  const isPlayer2Active = currentTurnPlayerId === players[1]?.id && !roundOver;

  return (
    <div className="flex flex-col items-center justify-center space-y-6 max-w-md mx-auto py-4 select-none w-full">

      {/* AI Mode Banner */}
      {isAiMode && (
        <div className="w-full flex items-center gap-2.5 px-4 py-2.5 rounded-2xl border-3 border-black shadow-[3px_3px_0px_#000]" style={{ background: "#7c3aed20" }}>
          <Bot className="w-4 h-4 shrink-0" style={{ color: "#7c3aed" }} />
          <div className="flex-1">
            <p className="font-black text-[8px] uppercase tracking-widest" style={{ color: "#7c3aed" }}>AI Practice Mode • NeuroBot 🤖 • Minimax Engine</p>
            <p className="text-[7.5px] font-bold text-slate-500 mt-0.5">Results won't be saved to profile or leaderboard</p>
          </div>
          <span className="text-[8px] font-black uppercase px-2 py-0.5 rounded-lg border-2 border-black" style={{ background: "#7c3aed", color: "#fff" }}>PRACTICE</span>
        </div>
      )}

      {/* Scoreboard HUD */}
      <div className="w-full grid grid-cols-3 items-center p-3 bg-slate-900 border-3 border-black rounded-2xl shadow-[4px_4px_0px_#000000] relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:8px_8px] opacity-[0.06] pointer-events-none" />
        <div className="text-left px-2 relative z-10">
          <p className="font-outfit font-extrabold text-[8px] text-slate-500 uppercase tracking-widest">X PLAYER</p>
          <p className="font-outfit font-black text-xs text-brand-orange truncate">{players[0]?.name || "Player 1"}</p>
        </div>
        <div className="text-center bg-slate-955/40 border border-black rounded-lg py-1 px-2.5 shadow-[inset_1px_1px_0px_rgba(0,0,0,0.2)] relative z-10">
          <p className="font-space font-black text-sm text-slate-100 tracking-wider">
            {scores[players[0]?.id || "p1"] || 0} - {scores[players[1]?.id || "p2"] || 0}
          </p>
        </div>
        <div className="text-right px-2 relative z-10">
          <p className="font-outfit font-extrabold text-[8px] text-slate-500 uppercase tracking-widest">O PLAYER</p>
          <p className={`font-outfit font-black text-xs truncate ${isAiMode && aiPlayer?.id === players[1]?.id ? "text-purple-400" : "text-success"}`}>
            {players[1]?.name || "Player 2"}
          </p>
        </div>
      </div>

      {/* Status banner */}
      <div className="w-full text-center h-[54px] flex flex-col items-center justify-center bg-slate-900 border-3 border-black rounded-2xl shadow-[4px_4px_0px_#000000] relative overflow-hidden shrink-0">
        <div className="absolute inset-0 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:8px_8px] opacity-[0.06] pointer-events-none" />
        <AnimatePresence mode="wait">
          <motion.p
            key={statusText}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="font-outfit font-black text-sm uppercase tracking-wider text-slate-55 relative z-10"
          >
            {statusText}
          </motion.p>
        </AnimatePresence>
        {isSpectator && (
          <span className="text-[9px] text-brand-orange font-black uppercase tracking-widest block mt-1.5 animate-pulse relative z-10">
            SPECTATING
          </span>
        )}
        {isAiTurn && !roundOver && (
          <span className="text-[8px] font-black uppercase tracking-widest block mt-0.5 animate-pulse relative z-10" style={{ color: "#7c3aed" }}>
            NeuroBot is computing best move...
          </span>
        )}
      </div>

      {/* Grid Board */}
      <div className="relative p-4 bg-slate-950 rounded-[2.5rem] border-3 border-black shadow-[6px_6px_0px_#000000] w-[300px] h-[300px] flex items-center justify-center shrink-0">
        <div className="grid grid-cols-3 gap-3 w-full h-full">
          {board.map((cell: string, idx: number) => {
            const isClickable = !isSpectator && isMyTurn && cell === "" && !roundOver && !isAiTurn;
            return (
              <button
                key={idx}
                onClick={() => handleCellClick(idx)}
                disabled={!isClickable}
                className={`relative rounded-2xl flex items-center justify-center transition-all border-3 border-black select-none font-black text-slate-955 overflow-hidden w-full h-full ${
                  cell === ""
                    ? isClickable
                      ? "bg-slate-900 hover:bg-slate-850 hover:border-brand-orange cursor-pointer shadow-[2px_2px_0px_#000000] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[3.5px_3.5px_0px_#000000] active:translate-x-px active:translate-y-px active:shadow-[1px_1px_0px_#000000]"
                      : "bg-slate-950/20 border-black/25 shadow-none opacity-40 cursor-not-allowed"
                    : cell === "X"
                    ? "bg-brand-orange shadow-[2px_2px_0px_#000000]"
                    : isAiMode
                    ? "shadow-[2px_2px_0px_#000000]"
                    : "bg-success shadow-[2px_2px_0px_#000000]"
                }`}
                style={cell === "O" && isAiMode ? { background: "#7c3aed" } : {}}
              >
                {cell !== "" && (
                  <div className="absolute inset-0 bg-[radial-gradient(#000000_1.5px,transparent_1.5px)] [background-size:6px_6px] opacity-[0.15] pointer-events-none" />
                )}

                {cell === "X" && (
                  <motion.span
                    initial={{ scale: 0, rotate: -45 }}
                    animate={{ scale: 1, rotate: 12 }}
                    transition={{ type: "spring", stiffness: 280, damping: 14 }}
                    className="font-outfit text-4xl font-black text-slate-955"
                  >
                    X
                  </motion.span>
                )}

                {cell === "O" && (
                  <motion.span
                    initial={{ scale: 0, rotate: 45 }}
                    animate={{ scale: 1, rotate: -6 }}
                    transition={{ type: "spring", stiffness: 280, damping: 14 }}
                    className="font-outfit text-4xl font-black text-white"
                  >
                    O
                  </motion.span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Players HUD */}
      <div className="grid grid-cols-2 gap-4 w-full max-w-[340px] shrink-0">
        {/* Player 1 Card */}
        <div className={`h-[115px] p-3 rounded-2xl text-center flex flex-col justify-between transition-all duration-200 border-3 border-black shadow-[4px_4px_0px_#000000] relative overflow-hidden ${
          isPlayer1Active ? "bg-slate-900 scale-[1.02]" : "bg-slate-900/50 opacity-60"
        }`}>
          {isPlayer1Active && (
            <div className="absolute inset-0 bg-[radial-gradient(var(--brand-orange)_1px,transparent_1px)] [background-size:8px_8px] opacity-[0.06] pointer-events-none" />
          )}
          <div className="flex items-center justify-center gap-2 relative z-10">
            <span className="w-5 h-5 rounded-lg bg-brand-orange border-2 border-black flex items-center justify-center font-outfit font-black text-xs text-slate-955 shadow-[1px_1px_0px_#000] shrink-0">
              X
            </span>
            <span className="text-slate-55 block font-outfit font-black text-xs truncate max-w-[110px]">
              {players[0]?.name || "Challenger A"}
            </span>
          </div>
          <div className="flex items-center justify-center h-[36px] relative z-10">
            <AnimatePresence>
              {activeEmotes[players[0]?.id] && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, y: 5 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="bg-brand-orange text-slate-955 font-black text-xs px-2.5 py-0.5 border-2 border-black rounded-xl shadow-[1.5px_1.5px_0px_#000000] relative"
                >
                  {activeEmotes[players[0]?.id].text}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div className="flex justify-between items-center text-[9px] font-black uppercase text-slate-500 pt-1 border-t border-black/25 relative z-10">
            <span>PLAYER 1</span>
            {isPlayer1Active && <span className="text-brand-orange tracking-widest animate-pulse font-bold">ACTIVE</span>}
          </div>
        </div>

        {/* Player 2 / AI Card */}
        <div className={`h-[115px] p-3 rounded-2xl text-center flex flex-col justify-between transition-all duration-200 border-3 border-black shadow-[4px_4px_0px_#000000] relative overflow-hidden ${
          isPlayer2Active ? "bg-slate-900 scale-[1.02]" : "bg-slate-900/50 opacity-60"
        }`}
          style={isPlayer2Active && isAiMode ? { borderColor: "#7c3aed" } : {}}
        >
          {isPlayer2Active && !isAiMode && (
            <div className="absolute inset-0 bg-[radial-gradient(var(--success)_1px,transparent_1px)] [background-size:8px_8px] opacity-[0.06] pointer-events-none" />
          )}
          {isPlayer2Active && isAiMode && (
            <div className="absolute inset-0 bg-[radial-gradient(#7c3aed_1px,transparent_1px)] [background-size:8px_8px] opacity-[0.06] pointer-events-none" />
          )}
          <div className="flex items-center justify-center gap-2 relative z-10">
            <span
              className="w-5 h-5 rounded-full border-2 border-black flex items-center justify-center font-outfit font-black text-xs text-white shadow-[1px_1px_0px_#000] shrink-0"
              style={{ background: isAiMode ? "#7c3aed" : "var(--color-success)" }}
            >
              O
            </span>
            <span className="text-slate-55 block font-outfit font-black text-xs truncate max-w-[110px]">
              {players[1]?.name || (isAiMode ? "NeuroBot 🤖" : "Challenger B")}
            </span>
          </div>
          <div className="flex items-center justify-center h-[36px] relative z-10">
            <AnimatePresence>
              {isAiTurn && !roundOver ? (
                <motion.div
                  key="ai-thinking"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="font-black text-xs px-2.5 py-0.5 border-2 border-black rounded-xl shadow-[1.5px_1.5px_0px_#000000] animate-pulse"
                  style={{ background: "#7c3aed", color: "#fff" }}
                >
                  🧠 Thinking...
                </motion.div>
              ) : activeEmotes[players[1]?.id] ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, y: 5 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="bg-success text-slate-955 font-black text-xs px-2.5 py-0.5 border-2 border-black rounded-xl shadow-[1.5px_1.5px_0px_#000000] relative"
                >
                  {activeEmotes[players[1]?.id].text}
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
          <div className="flex justify-between items-center text-[9px] font-black uppercase text-slate-500 pt-1 border-t border-black/25 relative z-10">
            <span>{isAiMode ? "NEUROBOT 🤖" : "PLAYER 2"}</span>
            {isPlayer2Active && (
              <span className="tracking-widest animate-pulse font-bold" style={{ color: isAiMode ? "#7c3aed" : "var(--color-success)" }}>
                ACTIVE
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Round over panel */}
      {roundOver && !isSpectator && (
        <div className="flex gap-3 w-full max-w-[340px] relative z-10 shrink-0">
          <Button
            onClick={handleReplayRound}
            className="flex-1 btn-neo h-11 text-[10px] uppercase font-black px-6 shadow-[3px_3px_0px_#000000] bg-slate-900 border-2 border-black text-slate-355 hover:bg-slate-800"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1 animate-spin-slow" /> Play Again
          </Button>
          <Button
            onClick={handleFinishMatch}
            className="flex-1 btn-neo h-11 text-[10px] uppercase font-black px-6 shadow-[3px_3px_0px_#000000] bg-brand-orange text-slate-955 hover:bg-brand-orange/95"
          >
            <Trophy className="w-3.5 h-3.5 mr-1" /> {isAiMode ? "Exit Practice" : "Finish Match"}
          </Button>
        </div>
      )}

      {/* AI Mode: practice disclaimer at bottom */}
      {isAiMode && (
        <p className="text-[8px] font-bold text-slate-500 text-center uppercase tracking-widest">
          🚫 Practice Mode • No XP • No Stats • Just for Fun
        </p>
      )}
    </div>
  );
}
