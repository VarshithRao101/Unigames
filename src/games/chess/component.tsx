"use client";

import React, { useEffect, useRef, useState } from "react";
import { useUnigamesSDK } from "../sdk";
import { Button } from "@/components/ui/button";
import { RefreshCw, Trophy, Bot } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams } from "next/navigation";
import { Chess, Square, Color, PieceSymbol } from "chess.js";

// ── PIECE-SQUARE TABLES (PST) FOR POSITION-BASED EVALUATION ──
const pawnPst = [
  [0,  0,  0,  0,  0,  0,  0,  0],
  [50, 50, 50, 50, 50, 50, 50, 50],
  [10, 10, 20, 30, 30, 20, 10, 10],
  [5,  5, 10, 25, 25, 10,  5,  5],
  [0,  0,  0, 20, 20,  0,  0,  0],
  [5, -5,-10,  0,  0,-10, -5,  5],
  [5, 10, 10,-20,-20, 10, 10,  5],
  [0,  0,  0,  0,  0,  0,  0,  0]
];

const knightPst = [
  [-50,-40,-30,-30,-30,-30,-40,-50],
  [-40,-20,  0,  0,  0,  0,-20,-40],
  [-30,  0, 10, 15, 15, 10,  0,-30],
  [-30,  5, 15, 20, 20, 15,  5,-30],
  [-30,  0, 15, 20, 20, 15,  0,-30],
  [-30,  5, 10, 15, 15, 10,  5,-30],
  [-40,-20,  0,  5,  5,  0,-20,-40],
  [-50,-40,-30,-30,-30,-30,-40,-50]
];

const bishopPst = [
  [-20,-10,-10,-10,-10,-10,-10,-20],
  [-10,  0,  0,  0,  0,  0,  0,-10],
  [-10,  0,  5, 10, 10,  5,  0,-10],
  [-10,  5,  5, 10, 10,  5,  5,-10],
  [-10,  0, 10, 10, 10, 10,  0,-10],
  [-10, 10, 10, 10, 10, 10, 10,-10],
  [-10,  5,  0,  0,  0,  0,  5,-10],
  [-20,-10,-10,-10,-10,-10,-10,-20]
];

const rookPst = [
  [0,  0,  0,  0,  0,  0,  0,  0],
  [5, 10, 10, 10, 10, 10, 10,  5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [0,  0,  0,  5,  5,  0,  0,  0]
];

const queenPst = [
  [-20,-10,-10, -5, -5,-10,-10,-20],
  [-10,  0,  0,  0,  0,  0,  0,-10],
  [-10,  0,  5,  5,  5,  5,  0,-10],
  [ -5,  0,  5,  5,  5,  5,  0, -5],
  [  0,  0,  5,  5,  5,  5,  0,  0],
  [-10,  5,  5,  5,  5,  5,  5,-10],
  [-10,  0,  5,  0,  0,  5,  0,-10],
  [-20,-10,-10, -5, -5,-10,-10,-20]
];

const kingPst = [
  [-30,-40,-40,-50,-50,-40,-40,-30],
  [-30,-40,-40,-50,-50,-40,-40,-30],
  [-30,-40,-40,-50,-50,-40,-40,-30],
  [-30,-40,-40,-50,-50,-40,-40,-30],
  [-20,-30,-30,-40,-40,-30,-30,-20],
  [-10,-20,-20,-20,-20,-20,-20,-10],
  [20, 20,  0,  0,  0,  0, 20, 20],
  [20, 30, 10,  0,  0, 10, 30, 20]
];

function getPiecePstValue(type: PieceSymbol, color: Color, r: number, c: number): number {
  const row = color === "w" ? r : 7 - r;
  const col = c;
  switch (type) {
    case "p": return pawnPst[row][col];
    case "n": return knightPst[row][col];
    case "b": return bishopPst[row][col];
    case "r": return rookPst[row][col];
    case "q": return queenPst[row][col];
    case "k": return kingPst[row][col];
    default: return 0;
  }
}

function evaluateBoard(board: ({ type: PieceSymbol; color: Color } | null)[][]): number {
  let score = 0;
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (piece) {
        let val = 0;
        switch (piece.type) {
          case "p": val = 100; break;
          case "n": val = 320; break;
          case "b": val = 330; break;
          case "r": val = 500; break;
          case "q": val = 900; break;
          case "k": val = 20000; break;
        }
        const pstVal = getPiecePstValue(piece.type, piece.color, r, c);
        const totalVal = val + pstVal;
        score += (piece.color === "w" ? totalVal : -totalVal);
      }
    }
  }
  return score;
}

function minimaxChess(
  chess: Chess,
  depth: number,
  alpha: number,
  beta: number,
  isMaximizing: boolean
): { score: number; move: any } {
  if (depth === 0 || chess.isGameOver()) {
    return { score: evaluateBoard(chess.board()), move: null };
  }

  const moves = chess.moves({ verbose: true });
  moves.sort(() => Math.random() - 0.5);

  let bestMove: any = null;

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const move of moves) {
      chess.move({ from: move.from, to: move.to, promotion: move.promotion || "q" });
      const evaluation = minimaxChess(chess, depth - 1, alpha, beta, false).score;
      chess.undo();
      if (evaluation > maxEval) {
        maxEval = evaluation;
        bestMove = move;
      }
      alpha = Math.max(alpha, evaluation);
      if (beta <= alpha) break;
    }
    return { score: maxEval, move: bestMove };
  } else {
    let minEval = Infinity;
    for (const move of moves) {
      chess.move({ from: move.from, to: move.to, promotion: move.promotion || "q" });
      const evaluation = minimaxChess(chess, depth - 1, alpha, beta, true).score;
      chess.undo();
      if (evaluation < minEval) {
        minEval = evaluation;
        bestMove = move;
      }
      beta = Math.min(beta, evaluation);
      if (beta <= alpha) break;
    }
    return { score: minEval, move: bestMove };
  }
}

const AI_THINKING = ["Analyzing position...", "Evaluating moves...", "Calculating lines..."];
const AI_WIN_TAUNTS = ["Checkmate! Better luck next time.", "NeuroBot reigns supreme!", "Deep blue, eat your heart out!"];
const AI_DRAW_TAUNTS = ["A hard-fought stalemate!", "A balanced duel. Good game!", "Draw by agreement or rule."];

export default function ChessGame() {
  const sdk = useUnigamesSDK();
  const { match, players, isSpectator, localPlayer } = sdk;
  const searchParams = useSearchParams();
  const isAiMode = searchParams?.get("ai") === "true";
  const gameState = match.gameState || {};
  const aiThinkingRef = useRef(false);

  const fen = gameState.fen || "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
  const roundFirstPlayerId = gameState.roundFirstPlayerId || (players[1]?.id || "");
  const whitePlayerId = roundFirstPlayerId;
  const blackPlayerId = players.find(p => p.id !== whitePlayerId)?.id || (players[0]?.id || "");
  const currentTurnPlayerId = gameState.currentTurnPlayerId || whitePlayerId;
  const scores = gameState.scores || { [players[0]?.id || "p1"]: 0, [players[1]?.id || "p2"]: 0 };
  const roundWinnerId = gameState.roundWinnerId || null;
  const isRoundDraw = gameState.isRoundDraw || false;
  const roundOver = gameState.roundOver || false;
  const aiMessage = gameState.aiMessage || "";
  const lastMove = gameState.lastMove || null;

  const [activeEmotes, setActiveEmotes] = useState<Record<string, { text: string; id: number }>>({});
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [promotionMove, setPromotionMove] = useState<{ from: Square; to: Square } | null>(null);

  // Instantiated local chess representation
  const [chess] = useState(() => new Chess());
  const [board, setBoard] = useState(() => chess.board());

  // Emote Listener from match history
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

  // Sync internal board representation on state updates
  useEffect(() => {
    if (gameState.fen) {
      try {
        chess.load(gameState.fen);
        setBoard(chess.board());
      } catch (e) {
        console.error("Failed to sync fen state:", e);
      }
    }
  }, [gameState.fen, chess]);

  // Initialize room state: White starts (players[1] is White, players[0] is Black)
  useEffect(() => {
    if (players.length >= 2 && !gameState.fen) {
      sdk.updateState({
        fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
        currentTurnPlayerId: players[1]?.id, // White goes first
        roundFirstPlayerId: players[1]?.id, // White player ID
        roundWinnerId: null,
        isRoundDraw: false,
        roundOver: false,
        lastMove: null,
        aiMessage: "",
        scores: {
          [players[0]?.id]: 0,
          [players[1]?.id]: 0
        }
      });
    }
  }, [players, gameState.fen]);

  const localPlayerColor: Color = localPlayer?.id === whitePlayerId ? "w" : localPlayer?.id === blackPlayerId ? "b" : "w";
  
  // Flipped for black perspective
  const isFlipped = localPlayerColor === "b";

  const aiPlayer = players.find(p => p.id.startsWith("ai-minimax"));
  const aiPlayerColor: Color = aiPlayer?.id === whitePlayerId ? "w" : "b";

  const isAiTurn = isAiMode && aiPlayer && currentTurnPlayerId === aiPlayer.id && !roundOver;
  const isMyTurn = localPlayer && currentTurnPlayerId === localPlayer.id && !roundOver && !isAiTurn;

  // ── AI ENGINE CONTROLLER ──
  useEffect(() => {
    if (!isAiMode || !aiPlayer || !isAiTurn || roundOver) return;
    if (aiThinkingRef.current) return;

    aiThinkingRef.current = true;
    const thinkMsg = AI_THINKING[Math.floor(Math.random() * AI_THINKING.length)];
    sdk.updateState({ ...gameState, aiMessage: thinkMsg });

    const delay = 600 + Math.random() * 600;
    const timer = setTimeout(() => {
      aiThinkingRef.current = false;
      
      const moves = chess.moves({ verbose: true });
      if (moves.length === 0) return;

      const isAiWhite = aiPlayerColor === "w";
      // Search depth 2 is perfectly fast and optimized for browser chess engine
      const { move: bestMove } = minimaxChess(chess, 2, -Infinity, Infinity, isAiWhite);
      
      if (!bestMove) return;

      const moveObj: any = {
        from: bestMove.from,
        to: bestMove.to,
      };
      if (bestMove.flags.includes("p")) {
        moveObj.promotion = "q";
      }

      try {
        chess.move(moveObj);
        const nextFen = chess.fen();
        const nextTurnPlayerId = chess.turn() === "w" ? whitePlayerId : blackPlayerId;

        let nextRoundWinnerId = null;
        let nextIsRoundDraw = false;
        let nextRoundOver = false;
        const nextScores = { ...scores };
        let msg = "";

        if (chess.isGameOver()) {
          nextRoundOver = true;
          if (chess.isCheckmate()) {
            nextRoundWinnerId = aiPlayer.id;
            nextScores[nextRoundWinnerId] = (nextScores[nextRoundWinnerId] || 0) + 1;
            msg = AI_WIN_TAUNTS[Math.floor(Math.random() * AI_WIN_TAUNTS.length)];
          } else {
            nextIsRoundDraw = true;
            msg = AI_DRAW_TAUNTS[Math.floor(Math.random() * AI_DRAW_TAUNTS.length)];
          }
        }

        sdk.submitMove("ai_make_chess_move", { move: moveObj, fen: nextFen });
        sdk.updateState({
          fen: nextFen,
          currentTurnPlayerId: nextTurnPlayerId,
          roundWinnerId: nextRoundWinnerId,
          isRoundDraw: nextIsRoundDraw,
          roundOver: nextRoundOver,
          scores: nextScores,
          roundFirstPlayerId,
          lastMove: moveObj,
          aiMessage: msg,
        });
      } catch (err) {
        console.error("AI failed to execute move:", err);
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [isAiTurn, fen, roundOver]);

  // Valid move calculations for selection square
  const activeValidTargetSquares = selectedSquare
    ? chess.moves({ square: selectedSquare, verbose: true }).map(m => m.to)
    : [];

  const handleSquareClick = (squareName: Square) => {
    if (!isMyTurn || roundOver) return;

    const squareObj = chess.get(squareName);

    if (selectedSquare) {
      if (squareName === selectedSquare) {
        setSelectedSquare(null);
        return;
      }

      // Check if clicking another friendly piece to change selection
      if (squareObj && squareObj.color === localPlayerColor) {
        setSelectedSquare(squareName);
        return;
      }

      const validMoves = chess.moves({ square: selectedSquare, verbose: true });
      const matchedMove = validMoves.find(m => m.to === squareName);

      if (matchedMove) {
        // Handle Promotion
        if (matchedMove.flags.includes("p")) {
          setPromotionMove({ from: selectedSquare, to: squareName });
        } else {
          executeMove({ from: selectedSquare, to: squareName });
        }
      } else {
        setSelectedSquare(null);
      }
    } else {
      // Pick a piece
      if (squareObj && squareObj.color === localPlayerColor) {
        setSelectedSquare(squareName);
      }
    }
  };

  const executeMove = (moveObj: { from: Square; to: Square; promotion?: string }) => {
    try {
      const result = chess.move(moveObj);
      if (result) {
        const nextFen = chess.fen();
        const nextTurnPlayerId = chess.turn() === "w" ? whitePlayerId : blackPlayerId;

        let nextRoundWinnerId = null;
        let nextIsRoundDraw = false;
        let nextRoundOver = false;
        const nextScores = { ...scores };

        if (chess.isGameOver()) {
          nextRoundOver = true;
          if (chess.isCheckmate()) {
            nextRoundWinnerId = localPlayer?.id || null;
            if (nextRoundWinnerId) {
              nextScores[nextRoundWinnerId] = (nextScores[nextRoundWinnerId] || 0) + 1;
            }
          } else {
            nextIsRoundDraw = true;
          }
        }

        sdk.submitMove("make_chess_move", { move: moveObj, fen: nextFen });
        sdk.updateState({
          fen: nextFen,
          currentTurnPlayerId: nextTurnPlayerId,
          roundWinnerId: nextRoundWinnerId,
          isRoundDraw: nextIsRoundDraw,
          roundOver: nextRoundOver,
          scores: nextScores,
          roundFirstPlayerId,
          lastMove: moveObj,
          aiMessage: "",
        });

        setSelectedSquare(null);
      }
    } catch (err) {
      console.error("Invalid move attempted:", err);
      setSelectedSquare(null);
    }
  };

  const handleReplayRound = () => {
    aiThinkingRef.current = false;
    // Swap starting roles on replay
    const nextFirstPlayerId = roundFirstPlayerId === players[0]?.id
      ? (players[1]?.id || players[0]?.id)
      : players[0]?.id;

    sdk.updateState({
      fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
      currentTurnPlayerId: nextFirstPlayerId,
      roundFirstPlayerId: nextFirstPlayerId,
      roundWinnerId: null,
      isRoundDraw: false,
      roundOver: false,
      lastMove: null,
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

    sdk.declareWinner(isAiMode ? "" : finalWinnerId, [p1, p2], { [p1]: s1, [p2]: s2 });
  };

  // Status banner wording
  let statusText = "";
  if (aiMessage && isAiTurn) {
    statusText = aiMessage;
  } else if (roundWinnerId) {
    const winnerName = players.find(p => p.id === roundWinnerId)?.name || "Opponent";
    const isLocalWin = roundWinnerId === localPlayer?.id;
    const isAiWin = roundWinnerId === aiPlayer?.id;
    statusText = isLocalWin
      ? "You won! Incredible match!"
      : isAiWin
      ? (aiMessage || "NeuroBot wins by checkmate!")
      : `Round won by ${winnerName}!`;
  } else if (isRoundDraw) {
    statusText = aiMessage || "Draw! Game Over.";
  } else if (isAiTurn) {
    statusText = aiMessage || "NeuroBot is analyzing board...";
  } else {
    const activeName = players.find(p => p.id === currentTurnPlayerId)?.name || "Waiting...";
    const colorLabel = currentTurnPlayerId === whitePlayerId ? "White" : "Black";
    statusText = currentTurnPlayerId === localPlayer?.id 
      ? `Your Turn (${colorLabel})! Make a Move!` 
      : `${activeName}'s Turn (${colorLabel})...`;
  }

  const isWhiteActive = currentTurnPlayerId === whitePlayerId && !roundOver;
  const isBlackActive = currentTurnPlayerId === blackPlayerId && !roundOver;

  // Board layout order
  const rowIndices = isFlipped ? [7, 6, 5, 4, 3, 2, 1, 0] : [0, 1, 2, 3, 4, 5, 6, 7];
  const colIndices = isFlipped ? [7, 6, 5, 4, 3, 2, 1, 0] : [0, 1, 2, 3, 4, 5, 6, 7];

  return (
    <div className="flex flex-col items-center justify-center space-y-6 max-w-md mx-auto py-4 select-none w-full relative">

      {/* AI Practice Mode Banner */}
      {isAiMode && (
        <div className="w-full flex items-center gap-2.5 px-4 py-2.5 rounded-2xl border-3 border-black shadow-[3px_3px_0px_#000]" style={{ background: "#7c3aed20" }}>
          <Bot className="w-4 h-4 shrink-0" style={{ color: "#7c3aed" }} />
          <div className="flex-1">
            <p className="font-black text-[8px] uppercase tracking-widest" style={{ color: "#7c3aed" }}>AI Practice Mode — NeuroBot</p>
            <p className="text-[7.5px] font-bold text-slate-500 mt-0.5">Results are not saved to profile or leaderboard</p>
          </div>
          <span className="text-[8px] font-black uppercase px-2 py-0.5 rounded-lg border-2 border-black" style={{ background: "#7c3aed", color: "#fff" }}>PRACTICE</span>
        </div>
      )}

      {/* Scoreboard HUD */}
      <div className="w-full grid grid-cols-3 items-center p-3 bg-slate-900 border-3 border-black rounded-2xl shadow-[4px_4px_0px_#000000] relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:8px_8px] opacity-[0.06] pointer-events-none" />
        
        {/* White Side */}
        <div className="text-left px-2 relative z-10">
          <p className="font-outfit font-extrabold text-[8px] text-slate-500 uppercase tracking-widest">WHITE PLAYER</p>
          <p className="font-outfit font-black text-xs text-brand-orange truncate">
            {players.find(p => p.id === whitePlayerId)?.name || "White Challenger"}
          </p>
        </div>

        {/* Scores */}
        <div className="text-center bg-slate-955/40 border border-black rounded-lg py-1 px-2.5 shadow-[inset_1px_1px_0px_rgba(0,0,0,0.2)] relative z-10">
          <p className="font-space font-black text-sm text-slate-100 tracking-wider">
            {scores[whitePlayerId] || 0} - {scores[blackPlayerId] || 0}
          </p>
        </div>

        {/* Black Side */}
        <div className="text-right px-2 relative z-10">
          <p className="font-outfit font-extrabold text-[8px] text-slate-500 uppercase tracking-widest">BLACK PLAYER</p>
          <p className={`font-outfit font-black text-xs truncate ${isAiMode ? "" : "text-success"}`}
            style={isAiMode ? { color: "#7c3aed" } : {}}>
            {players.find(p => p.id === blackPlayerId)?.name || "Black Challenger"}
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
            className="font-outfit font-black text-xs uppercase tracking-wider text-slate-50 relative z-10 px-4"
          >
            {statusText}
          </motion.p>
        </AnimatePresence>
        {isSpectator && (
          <span className="text-[9px] text-brand-orange font-black uppercase tracking-widest block mt-1 animate-pulse relative z-10">
            SPECTATING
          </span>
        )}
      </div>

      {/* 2D Neo-Brutalist Board (Perfect Responsive Scaling) */}
      <div className="relative p-2 bg-slate-950 rounded-[1.5rem] border-3 border-black shadow-[6px_6px_0px_#000000] w-full max-w-[340px] aspect-square md:max-w-[380px] flex items-center justify-center shrink-0">
        <div className="flex flex-col w-full h-full border-2 border-black overflow-hidden rounded-lg">
          {rowIndices.map((i, rowViewIdx) => (
            <div key={i} className="flex flex-1 w-full">
              {colIndices.map((j, colViewIdx) => {
                const squareName = (String.fromCharCode(97 + j) + (8 - i)) as Square;
                const square = board[i][j];
                const isDark = (i + j) % 2 !== 0;

                const isSelected = selectedSquare === squareName;
                const isSuggestion = activeValidTargetSquares.includes(squareName);
                
                // Last move & Check triggers
                const isLastMoveSrc = lastMove && lastMove.from === squareName;
                const isLastMoveDst = lastMove && lastMove.to === squareName;
                const isKingInCheck = chess.inCheck() && square && square.type === "k" && square.color === chess.turn();

                const showFileLabel = rowViewIdx === 7;
                const showRankLabel = colViewIdx === 0;

                return (
                  <button
                    key={j}
                    onClick={() => handleSquareClick(squareName)}
                    disabled={isSpectator || (!isMyTurn && !selectedSquare)}
                    className={`relative flex-1 w-full h-full flex items-center justify-center cursor-pointer transition-all border-none focus:outline-none select-none overflow-hidden ${
                      isDark ? "bg-[#585c51]" : "bg-[#eff1eb]"
                    } ${
                      isSelected ? "ring-4 ring-brand-orange ring-inset z-10" : ""
                    } ${
                      isLastMoveSrc || isLastMoveDst ? "bg-amber-400/20" : ""
                    } ${
                      isKingInCheck ? "bg-red-600/35" : ""
                    }`}
                  >
                    {/* Centered pieces */}
                    {square && (
                      <img
                        src={`/images/chess/${square.color}${square.type}.png`}
                        alt={`${square.color}${square.type}`}
                        className="w-4/5 h-4/5 object-contain select-none z-10 pointer-events-none drop-shadow-[1.5px_1.5px_1px_rgba(0,0,0,0.45)]"
                      />
                    )}

                    {/* Move suggestions */}
                    {isSuggestion && (
                      <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                        {square ? (
                          <div className="w-[85%] h-[85%] border-3 border-black/25 rounded-full animate-pulse" />
                        ) : (
                          <div className="w-3.5 h-3.5 bg-black/25 rounded-full" />
                        )}
                      </div>
                    )}

                    {/* Square Coordinates */}
                    {showFileLabel && (
                      <span
                        className={`absolute bottom-0.5 right-1 text-[7px] font-black pointer-events-none select-none ${
                          isDark ? "text-[#eff1eb]/70" : "text-[#585c51]/70"
                        }`}
                      >
                        {String.fromCharCode(97 + j)}
                      </span>
                    )}

                    {showRankLabel && (
                      <span
                        className={`absolute top-0.5 left-1 text-[7px] font-black pointer-events-none select-none ${
                          isDark ? "text-[#eff1eb]/70" : "text-[#585c51]/70"
                        }`}
                      >
                        {8 - i}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Dynamic Pawn Promotion Modal */}
        <AnimatePresence>
          {promotionMove && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm rounded-[1.5rem] flex items-center justify-center z-50 p-4"
            >
              <div className="bg-slate-900 border-3 border-black p-4 rounded-2xl shadow-[4px_4px_0px_#000] text-center w-full max-w-[280px]">
                <p className="font-outfit font-black text-xs uppercase tracking-wider text-slate-100 mb-3.5">
                  Select Promotion
                </p>
                <div className="grid grid-cols-2 gap-2.5">
                  {[
                    { id: "q", label: "Queen" },
                    { id: "r", label: "Rook" },
                    { id: "b", label: "Bishop" },
                    { id: "n", label: "Knight" },
                  ].map(piece => (
                    <button
                      key={piece.id}
                      onClick={() => {
                        executeMove({
                          from: promotionMove.from,
                          to: promotionMove.to,
                          promotion: piece.id,
                        });
                        setPromotionMove(null);
                      }}
                      className="h-14 bg-slate-800 border-2 border-black hover:border-brand-orange hover:bg-brand-orange/10 rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all active:translate-y-px"
                    >
                      <img
                        src={`/images/chess/${localPlayerColor}${piece.id}.png`}
                        alt={piece.label}
                        className="w-7 h-7 object-contain"
                      />
                      <span className="text-[7.5px] font-black uppercase text-slate-400 mt-1">{piece.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Players Cards HUD */}
      <div className="grid grid-cols-2 gap-4 w-full max-w-[340px] shrink-0">
        {/* White Player Card */}
        <div className={`h-[115px] p-3 rounded-2xl text-center flex flex-col justify-between transition-all duration-200 border-3 border-black shadow-[4px_4px_0px_#000000] relative overflow-hidden ${
          isWhiteActive ? "bg-slate-900 scale-[1.02]" : "bg-slate-900/50 opacity-60"
        }`}>
          {isWhiteActive && (
            <div className="absolute inset-0 bg-[radial-gradient(var(--brand-orange)_1px,transparent_1px)] [background-size:8px_8px] opacity-[0.06] pointer-events-none" />
          )}
          <div className="flex items-center justify-center gap-2 relative z-10">
            <span className="w-5 h-5 rounded-lg bg-[#eff1eb] border-2 border-black flex items-center justify-center font-outfit font-black text-[9px] text-[#585c51] shadow-[1px_1px_0px_#000] shrink-0">
              W
            </span>
            <span className="text-slate-55 block font-outfit font-black text-xs truncate max-w-[110px]">
              {players.find(p => p.id === whitePlayerId)?.name || "White Challenger"}
            </span>
          </div>

          <div className="flex items-center justify-center h-[36px] relative z-10">
            <AnimatePresence>
              {activeEmotes[whitePlayerId] && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, y: 5 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="bg-brand-orange text-slate-955 font-black text-xs px-2.5 py-0.5 border-2 border-black rounded-xl shadow-[1.5px_1.5px_0px_#000000] relative"
                >
                  {activeEmotes[whitePlayerId].text}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex justify-between items-center text-[9px] font-black uppercase text-slate-500 pt-1 border-t border-black/25 relative z-10">
            <span>WHITE PIECES</span>
            {isWhiteActive && <span className="text-brand-orange tracking-widest animate-pulse font-bold">ACTIVE</span>}
          </div>
        </div>

        {/* Black Player / AI Card */}
        <div
          className={`h-[115px] p-3 rounded-2xl text-center flex flex-col justify-between transition-all duration-200 border-3 border-black shadow-[4px_4px_0px_#000000] relative overflow-hidden ${
            isBlackActive ? "bg-slate-900 scale-[1.02]" : "bg-slate-900/50 opacity-60"
          }`}
          style={isBlackActive && isAiMode ? { borderColor: "#7c3aed" } : {}}
        >
          {isBlackActive && (
            <div
              className="absolute inset-0 [background-size:8px_8px] opacity-[0.06] pointer-events-none"
              style={{ backgroundImage: `radial-gradient(${isAiMode ? "#7c3aed" : "var(--color-success)"} 1px, transparent 1px)` }}
            />
          )}
          <div className="flex items-center justify-center gap-2 relative z-10">
            <span
              className="w-5 h-5 rounded-lg border-2 border-black flex items-center justify-center font-outfit font-black text-[9px] text-[#eff1eb] shadow-[1px_1px_0px_#000] shrink-0"
              style={{ background: isAiMode ? "#7c3aed" : "#585c51" }}
            >
              B
            </span>
            <span className="text-slate-55 block font-outfit font-black text-xs truncate max-w-[110px]">
              {players.find(p => p.id === blackPlayerId)?.name || (isAiMode ? "NeuroBot" : "Black Challenger")}
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
                  Thinking...
                </motion.div>
              ) : activeEmotes[blackPlayerId] ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, y: 5 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="bg-success text-slate-955 font-black text-xs px-2.5 py-0.5 border-2 border-black rounded-xl shadow-[1.5px_1.5px_0px_#000000] relative"
                >
                  {activeEmotes[blackPlayerId].text}
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>

          <div className="flex justify-between items-center text-[9px] font-black uppercase text-slate-500 pt-1 border-t border-black/25 relative z-10">
            <span>{isAiMode ? "NEUROBOT [AI]" : "BLACK PIECES"}</span>
            {isBlackActive && (
              <span className="tracking-widest animate-pulse font-bold" style={{ color: isAiMode ? "#7c3aed" : "var(--color-success)" }}>
                ACTIVE
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Round over controls */}
      {roundOver && !isSpectator && (
        <div className="flex gap-3 w-full max-w-[340px] relative z-10 shrink-0">
          <Button
            onClick={handleReplayRound}
            leftIcon={<RefreshCw className="w-3.5 h-3.5 animate-spin-slow" />}
            className="flex-1 btn-neo h-11 text-[10px] uppercase font-black px-6 shadow-[3px_3px_0px_#000000] bg-slate-900 border-2 border-black text-slate-355 hover:bg-slate-800"
          >
            Play Again
          </Button>
          <Button
            onClick={handleFinishMatch}
            leftIcon={<Trophy className="w-3.5 h-3.5" />}
            className="flex-1 btn-neo h-11 text-[10px] uppercase font-black px-6 shadow-[3px_3px_0px_#000000] bg-brand-orange text-slate-955 hover:bg-brand-orange/95"
          >
            {isAiMode ? "Exit Practice" : "Finish Match"}
          </Button>
        </div>
      )}

      {/* AI Mode disclaimer */}
      {isAiMode && (
        <p className="text-[8px] font-bold text-slate-500 text-center uppercase tracking-widest mt-1">
          Practice Mode — No XP — No Stats — Just for Fun
        </p>
      )}
    </div>
  );
}
