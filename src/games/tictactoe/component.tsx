"use client";

import React, { useEffect } from "react";
import { useUnigamesSDK } from "../sdk";
import { Button } from "@/components/ui/button";
import { HelpCircle, RefreshCw, Trophy, Zap, AlertCircle } from "lucide-react";

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
    statusText = `🎉 Match Concluded: ${winnerName} Wins!`;
  } else if (isDraw) {
    statusText = "🤝 Match Drawn!";
  } else {
    const activeName = players.find(p => p.id === currentTurnPlayerId)?.name || "Waiting...";
    statusText = currentTurnPlayerId === localPlayer?.id ? "🟢 Your Turn!" : `Waiting for ${activeName}'s Move...`;
  }

  return (
    <div className="flex flex-col items-center justify-center space-y-6 max-w-md mx-auto py-8">
      {/* Turn indicator / status banner */}
      <div className="w-full text-center p-4 bg-slate-800 border-[3px] border-black rounded-2xl shadow-[3px_3px_0px_#000000]">
        <p className="font-outfit font-black text-sm text-slate-555 uppercase tracking-wide">
          {statusText}
        </p>
        {isSpectator && (
          <span className="text-[10px] text-brand-orange font-bold uppercase tracking-wider block mt-1">
            Spectator View
          </span>
        )}
      </div>

      {/* 3x3 Grid Board */}
      <div className="grid grid-cols-3 gap-3.5 w-72 h-72 bg-slate-900 p-4 rounded-3xl border-[3.5px] border-black shadow-[4px_4px_0px_#000000] relative">
        {board.map((cell: string, idx: number) => (
          <button
            key={idx}
            onClick={() => handleCellClick(idx)}
            disabled={isSpectator || !isMyTurn || cell !== "" || !!winnerId || isDraw}
            className={`rounded-2xl flex items-center justify-center text-3xl font-outfit font-black transition-all cursor-pointer select-none border-[3px] border-black shadow-[2px_2px_0px_#000000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_#000000] disabled:transform-none disabled:shadow-[2px_2px_0px_#000000] disabled:cursor-not-allowed ${
              cell === "" 
                ? "bg-slate-900 hover:bg-slate-800 text-transparent" 
                : cell === "X" 
                ? "bg-brand-orange text-black font-black" 
                : "bg-success text-black font-black"
            }`}
          >
            {cell}
          </button>
        ))}
      </div>

      {/* Players hud */}
      <div className="grid grid-cols-2 gap-4 w-full text-xs font-semibold">
        <div className="bg-slate-800 border-[3px] border-black p-3.5 rounded-2xl text-center space-y-1.5 shadow-[3px_3px_0px_#000000]">
          <div className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 rounded-full bg-brand-orange border-2 border-black flex items-center justify-center font-black text-[9px] text-black">X</span>
            <span className="text-slate-50 block font-outfit font-black truncate max-w-[120px]">{players[0]?.name || "Challenger A"}</span>
          </div>
          <span className="text-[9px] text-slate-500 font-extrabold block">Player 1</span>
        </div>

        <div className="bg-slate-800 border-[3px] border-black p-3.5 rounded-2xl text-center space-y-1.5 shadow-[3px_3px_0px_#000000]">
          <div className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 rounded-full bg-success border-2 border-black flex items-center justify-center font-black text-[9px] text-black">O</span>
            <span className="text-slate-50 block font-outfit font-black truncate max-w-[120px]">{players[1]?.name || "Challenger B"}</span>
          </div>
          <span className="text-[9px] text-slate-500 font-extrabold block">Player 2</span>
        </div>
      </div>

      {/* Restart / Reset for Dev tests */}
      {localPlayer?.isHost && (winnerId || isDraw) && (
        <Button
          onClick={handleRestart}
          className="btn-gaming h-10 text-[10px] uppercase font-black px-6 shadow-[3px_3px_0px_#000000]"
        >
          Reset Board
        </Button>
      )}
    </div>
  );
}
