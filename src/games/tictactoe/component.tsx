"use client";

import React, { useEffect } from "react";
import { useUnigamesSDK } from "../sdk";
import { Button } from "@/components/ui/button";
import { RefreshCw, Trophy } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function TicTacToeGame() {
  const sdk = useUnigamesSDK();
  const { match, players, isSpectator, localPlayer } = sdk;
  const gameState = match.gameState || {};
  
  // Destructure or assign defaults for board state
  const board = gameState.board || Array(9).fill("");
  const currentTurnPlayerId = gameState.currentTurnPlayerId || (players[0]?.id || "");
  const scores = gameState.scores || { [players[0]?.id || "p1"]: 0, [players[1]?.id || "p2"]: 0 };
  const roundWinnerId = gameState.roundWinnerId || null;
  const isRoundDraw = gameState.isRoundDraw || false;
  const roundOver = gameState.roundOver || false;
  // Track who went first this round so we alternate on replay
  const roundFirstPlayerId: string = gameState.roundFirstPlayerId || (players[0]?.id || "");

  // Track active emotes to display under user names
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
          setActiveEmotes(prev => ({
            ...prev,
            [playerId]: { text: data.emote, id: Date.now() }
          }));
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
  const isMyTurn = localPlayer && currentTurnPlayerId === localPlayer.id && !roundOver;

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
        scores: {
          [players[0]?.id]: 0,
          [players[1]?.id]: 0
        }
      });
    }
  }, [players, gameState.board]);

  const checkWinner = (tempBoard: string[]) => {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6]
    ];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (tempBoard[a] && tempBoard[a] === tempBoard[b] && tempBoard[a] === tempBoard[c]) {
        return tempBoard[a]; // Returns "X" or "O"
      }
    }
    return null;
  };

  const handleCellClick = (index: number) => {
    if (!isMyTurn || board[index] !== "" || roundOver) return;

    const nextBoard = [...board];
    nextBoard[index] = localSymbol;

    const winnerSymbol = checkWinner(nextBoard);
    // STRICT: only award a point on a real win, never on draw
    let nextRoundWinnerId: string | null = null;
    let nextIsRoundDraw = false;
    let nextRoundOver = false;
    const nextScores = { ...scores };

    if (winnerSymbol) {
      // Map symbol back to the correct player id
      nextRoundWinnerId = winnerSymbol === "X" ? (players[0]?.id || null) : (players[1]?.id || null);
      nextRoundOver = true;
      // +1 point ONLY for the actual winner
      if (nextRoundWinnerId) {
        nextScores[nextRoundWinnerId] = (nextScores[nextRoundWinnerId] || 0) + 1;
      }
    } else if (nextBoard.every(cell => cell !== "")) {
      // DRAW — board full, no winner → no points awarded
      nextIsRoundDraw = true;
      nextRoundOver = true;
      // Do NOT touch nextScores — draw awards 0 points to anyone
    }

    // Alternate turns (only relevant when game is still going)
    const nextTurnPlayerId = currentTurnPlayerId === players[0]?.id
      ? (players[1]?.id || players[0]?.id)
      : players[0]?.id;

    // Log the turn to match history
    sdk.submitMove("place_marker", { index, symbol: localSymbol });

    // Sync game state back to SDK container context
    sdk.updateState({
      board: nextBoard,
      currentTurnPlayerId: nextTurnPlayerId,
      roundWinnerId: nextRoundWinnerId,
      isRoundDraw: nextIsRoundDraw,
      roundOver: nextRoundOver,
      scores: nextScores,
      roundFirstPlayerId
    });
  };

  const handleReplayRound = () => {
    // Alternate: whoever went first LAST round, the OTHER player goes first this round
    const nextFirstPlayerId = roundFirstPlayerId === players[0]?.id
      ? (players[1]?.id || players[0]?.id)
      : players[0]?.id;

    sdk.updateState({
      board: Array(9).fill(""),
      currentTurnPlayerId: nextFirstPlayerId,
      roundFirstPlayerId: nextFirstPlayerId,
      roundWinnerId: null,
      isRoundDraw: false,
      roundOver: false
    });
    sdk.submitMove("replay_round");
  };

  const handleFinishMatch = () => {
    const p1 = players[0]?.id || "";
    const p2 = players[1]?.id || "";
    const s1 = scores[p1] || 0;
    const s2 = scores[p2] || 0;

    let finalWinnerId = "";
    if (s1 > s2) {
      finalWinnerId = p1;
    } else if (s2 > s1) {
      finalWinnerId = p2;
    }

    // Call sdk.declareWinner to finalize match and redirect to scorecards
    sdk.declareWinner(finalWinnerId, [p1, p2], {
      [p1]: s1,
      [p2]: s2
    });
  };

  // Resolve status text
  let statusText = "";
  if (roundWinnerId) {
    const winnerName = players.find(p => p.id === roundWinnerId)?.name || "Opponent";
    const isLocalWin = roundWinnerId === localPlayer?.id;
    statusText = isLocalWin ? `🏆 You Win This Round!` : `Round Won by ${winnerName}!`;
  } else if (isRoundDraw) {
    statusText = "🤝 It's a Draw! No Points.";
  } else {
    const activeName = players.find(p => p.id === currentTurnPlayerId)?.name || "Waiting...";
    statusText = currentTurnPlayerId === localPlayer?.id ? "⚡ Your Turn! Make a Move!" : `⏳ ${activeName}'s Turn...`;
  }

  const isPlayer1Active = currentTurnPlayerId === players[0]?.id && !roundOver;
  const isPlayer2Active = currentTurnPlayerId === players[1]?.id && !roundOver;

  return (
    <div className="flex flex-col items-center justify-center space-y-6 max-w-md mx-auto py-4 select-none w-full">
      
      {/* Scoreboard HUD */}
      <div className="w-full grid grid-cols-3 items-center p-3 bg-slate-900 border-3 border-black rounded-2xl shadow-[4px_4px_0px_#000000] relative overflow-hidden">
        {/* Halftone Overlay */}
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
          <p className="font-outfit font-black text-xs text-success truncate">{players[1]?.name || "Player 2"}</p>
        </div>
      </div>
      
      {/* Status banner (enforced size stability) */}
      <div className="w-full text-center h-[54px] flex flex-col items-center justify-center bg-slate-900 border-3 border-black rounded-2xl shadow-[4px_4px_0px_#000000] relative overflow-hidden shrink-0">
        {/* Halftone Overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:8px_8px] opacity-[0.06] pointer-events-none" />
        <p className="font-outfit font-black text-sm uppercase tracking-wider text-slate-55 relative z-10">
          {statusText}
        </p>
        {isSpectator && (
          <span className="text-[9px] text-brand-orange font-black uppercase tracking-widest block mt-1.5 animate-pulse relative z-10">
            SPECTATING
          </span>
        )}
      </div>

      {/* Grid Board (Fixed square constraints across devices) */}
      <div className="relative p-4 bg-slate-950 rounded-[2.5rem] border-3 border-black shadow-[6px_6px_0px_#000000] w-[300px] h-[300px] flex items-center justify-center shrink-0">
        {/* Board grid lines and backing */}
        <div className="grid grid-cols-3 gap-3 w-full h-full">
          {board.map((cell: string, idx: number) => {
            const isClickable = !isSpectator && isMyTurn && cell === "" && !roundOver;
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
                    : "bg-success shadow-[2px_2px_0px_#000000]"
                }`}
              >
                {/* 2D comic overlay on background */}
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
                    className="font-outfit text-4xl font-black text-slate-955"
                  >
                    O
                  </motion.span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Players HUD (Fixed card heights containing dialogues below names) */}
      <div className="grid grid-cols-2 gap-4 w-full max-w-[340px] shrink-0">
        {/* Player 1 Card */}
        <div className={`h-[115px] p-3 rounded-2xl text-center flex flex-col justify-between transition-all duration-200 border-3 border-black shadow-[4px_4px_0px_#000000] relative overflow-hidden ${
          isPlayer1Active 
            ? "bg-slate-900 scale-[1.02]" 
            : "bg-slate-900/50 opacity-60"
        }`}>
          {/* Halftone Overlay for Active Player */}
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

          {/* Emote/Signal space - Under the Name */}
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
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-black" />
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-[2px] border-transparent border-b-brand-orange" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex justify-between items-center text-[9px] font-black uppercase text-slate-500 pt-1 border-t border-black/25 relative z-10">
            <span>PLAYER 1</span>
            {isPlayer1Active && <span className="text-brand-orange tracking-widest animate-pulse font-bold">ACTIVE</span>}
          </div>
        </div>

        {/* Player 2 Card */}
        <div className={`h-[115px] p-3 rounded-2xl text-center flex flex-col justify-between transition-all duration-200 border-3 border-black shadow-[4px_4px_0px_#000000] relative overflow-hidden ${
          isPlayer2Active 
            ? "bg-slate-900 scale-[1.02]" 
            : "bg-slate-900/50 opacity-60"
        }`}>
          {/* Halftone Overlay for Active Player */}
          {isPlayer2Active && (
            <div className="absolute inset-0 bg-[radial-gradient(var(--success)_1px,transparent_1px)] [background-size:8px_8px] opacity-[0.06] pointer-events-none" />
          )}
          <div className="flex items-center justify-center gap-2 relative z-10">
            <span className="w-5 h-5 rounded-full bg-success border-2 border-black flex items-center justify-center font-outfit font-black text-xs text-slate-955 shadow-[1px_1px_0px_#000] shrink-0">
              O
            </span>
            <span className="text-slate-55 block font-outfit font-black text-xs truncate max-w-[110px]">
              {players[1]?.name || "Challenger B"}
            </span>
          </div>

          {/* Emote/Signal space - Under the Name */}
          <div className="flex items-center justify-center h-[36px] relative z-10">
            <AnimatePresence>
              {activeEmotes[players[1]?.id] && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, y: 5 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="bg-success text-slate-955 font-black text-xs px-2.5 py-0.5 border-2 border-black rounded-xl shadow-[1.5px_1.5px_0px_#000000] relative"
                >
                  {activeEmotes[players[1]?.id].text}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-black" />
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-[2px] border-transparent border-b-success" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex justify-between items-center text-[9px] font-black uppercase text-slate-500 pt-1 border-t border-black/25 relative z-10">
            <span>PLAYER 2</span>
            {isPlayer2Active && <span className="text-success tracking-widest animate-pulse font-bold">ACTIVE</span>}
          </div>
        </div>
      </div>

      {/* Dev Reset fallback or Round over panel */}
      {roundOver && !isSpectator && (
        <div className="flex gap-3 w-full max-w-[340px] relative z-10 shrink-0">
          <Button
            onClick={handleReplayRound}
            className="flex-1 btn-neo h-11 text-[10px] uppercase font-black px-6 shadow-[3px_3px_0px_#000000] bg-slate-900 border-2 border-black text-slate-355 hover:bg-slate-800"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1 animate-spin-slow" /> Replay Round
          </Button>
          <Button
            onClick={handleFinishMatch}
            className="flex-1 btn-neo h-11 text-[10px] uppercase font-black px-6 shadow-[3px_3px_0px_#000000] bg-brand-orange text-slate-955 hover:bg-brand-orange/95"
          >
            <Trophy className="w-3.5 h-3.5 mr-1" /> Finish Match
          </Button>
        </div>
      )}
    </div>
  );
}
