"use client";

import React, { useEffect } from "react";
import { useUnigamesSDK } from "../sdk";
import { Button } from "@/components/ui/button";
import { RefreshCw, Play, Trophy, Users } from "lucide-react";
import { motion } from "framer-motion";

export default function TicTacToeGame() {
  const sdk = useUnigamesSDK();
  const { match, players, isSpectator, localPlayer } = sdk;
  const gameState = match.gameState || {};
  
  // Destructure or assign defaults for board state
  const board = gameState.board || Array(9).fill("");
  const currentTurnPlayerId = gameState.currentTurnPlayerId || (players[0]?.id || "");
  const winnerId = gameState.winnerId || null;
  const isDraw = gameState.isDraw || false;

  // Map players to X and O symbols
  const getSymbol = (playerId: string) => {
    if (players[0]?.id === playerId) return "X";
    if (players[1]?.id === playerId) return "O";
    return "";
  };

  const localSymbol = localPlayer ? getSymbol(localPlayer.id) : "";
  const isMyTurn = localPlayer && currentTurnPlayerId === localPlayer.id && !winnerId && !isDraw;

  // Initialize board state if empty
  useEffect(() => {
    if (players.length >= 2 && !gameState.board) {
      sdk.updateState({
        board: Array(9).fill(""),
        currentTurnPlayerId: players[0]?.id,
        winnerId: null,
        isDraw: false
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
    if (!isMyTurn || board[index] !== "" || winnerId || isDraw) return;

    const nextBoard = [...board];
    nextBoard[index] = localSymbol;

    const winnerSymbol = checkWinner(nextBoard);
    let nextWinnerId = null;
    let nextIsDraw = false;

    if (winnerSymbol) {
      nextWinnerId = winnerSymbol === "X" ? players[0]?.id : players[1]?.id;
    } else if (nextBoard.every(cell => cell !== "")) {
      nextIsDraw = true;
    }

    const nextTurnPlayerId = currentTurnPlayerId === players[0]?.id 
      ? (players[1]?.id || players[0]?.id)
      : players[0]?.id;

    // Log the turn to match history
    sdk.submitMove("place_marker", { index, symbol: localSymbol });

    // Sync game state back to SDK container context
    sdk.updateState({
      board: nextBoard,
      currentTurnPlayerId: nextTurnPlayerId,
      winnerId: nextWinnerId,
      isDraw: nextIsDraw
    });

    // If game has concluded, declare result
    if (nextWinnerId) {
      sdk.declareWinner(nextWinnerId, [nextWinnerId, players.find(p => p.id !== nextWinnerId)?.id || ""], {
        [nextWinnerId]: 150,
        [players.find(p => p.id !== nextWinnerId)?.id || ""]: 40
      });
    } else if (nextIsDraw) {
      sdk.declareWinner("", players.map(p => p.id), {
        [players[0]?.id]: 75,
        [players[1]?.id || ""]: 75
      });
    }
  };

  const handleRestart = () => {
    sdk.updateState({
      board: Array(9).fill(""),
      currentTurnPlayerId: players[0]?.id,
      winnerId: null,
      isDraw: false
    });
    sdk.submitMove("restart_match");
  };

  // Resolve status text
  let statusText = "";
  if (winnerId) {
    const winnerName = players.find(p => p.id === winnerId)?.name || "Opponent";
    statusText = `🎉 Concluded: ${winnerName} Wins!`;
  } else if (isDraw) {
    statusText = "🤝 Match Drawn!";
  } else {
    const activeName = players.find(p => p.id === currentTurnPlayerId)?.name || "Waiting...";
    statusText = currentTurnPlayerId === localPlayer?.id ? "🟢 Your Turn!" : `Waiting for ${activeName}...`;
  }

  const isPlayer1Active = currentTurnPlayerId === players[0]?.id && !winnerId && !isDraw;
  const isPlayer2Active = currentTurnPlayerId === players[1]?.id && !winnerId && !isDraw;

  return (
    <div className="flex flex-col items-center justify-center space-y-6 max-w-md mx-auto py-4 select-none w-full">
      
      {/* Status banner */}
      <div className="w-full text-center p-4 bg-slate-900 border-3 border-black rounded-2xl shadow-[4px_4px_0px_#000000] relative overflow-hidden">
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

      {/* Grid Board */}
      <div className="relative p-4 bg-slate-950 rounded-[2.5rem] border-3 border-black shadow-[6px_6px_0px_#000000] w-full max-w-[340px] aspect-square flex items-center justify-center">
        {/* Board grid lines and backing */}
        <div className="grid grid-cols-3 gap-3 w-full h-full">
          {board.map((cell: string, idx: number) => {
            const isClickable = !isSpectator && isMyTurn && cell === "" && !winnerId && !isDraw;
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

      {/* Players HUD */}
      <div className="grid grid-cols-2 gap-4 w-full">
        {/* Player 1 Card */}
        <div className={`p-3.5 rounded-2xl text-center space-y-1.5 transition-all duration-200 border-3 border-black shadow-[4px_4px_0px_#000000] relative overflow-hidden ${
          isPlayer1Active 
            ? "bg-slate-900 scale-[1.02]" 
            : "bg-slate-900/50 opacity-60"
        }`}>
          {/* Halftone Overlay for Active Player */}
          {isPlayer1Active && (
            <div className="absolute inset-0 bg-[radial-gradient(var(--brand-orange)_1px,transparent_1px)] [background-size:8px_8px] opacity-[0.06] pointer-events-none" />
          )}
          <div className="flex items-center justify-center gap-2 relative z-10">
            <span className="w-5 h-5 rounded-lg bg-brand-orange border-2 border-black flex items-center justify-center font-outfit font-black text-xs text-slate-955 shadow-[1px_1px_0px_#000]">
              X
            </span>
            <span className="text-slate-55 block font-outfit font-black text-xs truncate max-w-[110px]">
              {players[0]?.name || "Challenger A"}
            </span>
          </div>
          <div className="flex justify-between items-center text-[9px] font-black uppercase text-slate-500 pt-1 border-t border-black/25 relative z-10">
            <span>PLAYER 1</span>
            {isPlayer1Active && <span className="text-brand-orange tracking-widest animate-pulse font-bold">ACTIVE</span>}
          </div>
        </div>

        {/* Player 2 Card */}
        <div className={`p-3.5 rounded-2xl text-center space-y-1.5 transition-all duration-200 border-3 border-black shadow-[4px_4px_0px_#000000] relative overflow-hidden ${
          isPlayer2Active 
            ? "bg-slate-900 scale-[1.02]" 
            : "bg-slate-900/50 opacity-60"
        }`}>
          {/* Halftone Overlay for Active Player */}
          {isPlayer2Active && (
            <div className="absolute inset-0 bg-[radial-gradient(var(--success)_1px,transparent_1px)] [background-size:8px_8px] opacity-[0.06] pointer-events-none" />
          )}
          <div className="flex items-center justify-center gap-2 relative z-10">
            <span className="w-5 h-5 rounded-full bg-success border-2 border-black flex items-center justify-center font-outfit font-black text-xs text-slate-955 shadow-[1px_1px_0px_#000]">
              O
            </span>
            <span className="text-slate-55 block font-outfit font-black text-xs truncate max-w-[110px]">
              {players[1]?.name || "Challenger B"}
            </span>
          </div>
          <div className="flex justify-between items-center text-[9px] font-black uppercase text-slate-500 pt-1 border-t border-black/25 relative z-10">
            <span>PLAYER 2</span>
            {isPlayer2Active && <span className="text-success tracking-widest animate-pulse font-bold">ACTIVE</span>}
          </div>
        </div>
      </div>

      {/* Restart / Reset for Dev tests */}
      {localPlayer?.isHost && (winnerId || isDraw) && (
        <Button
          onClick={handleRestart}
          className="btn-neo h-10 text-[10px] uppercase font-black px-6 shadow-[3px_3px_0px_#000000] mt-2 relative z-10"
        >
          <RefreshCw className="w-3.5 h-3.5 mr-1" /> Reset Board
        </Button>
      )}
    </div>
  );
}
