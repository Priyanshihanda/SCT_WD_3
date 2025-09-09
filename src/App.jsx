// App.jsx
import { useState, useEffect } from "react";
import "./App.css";

import {
  PieChart, Pie, Cell, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, LineChart, Line
} from "recharts";

function AnalyticsModal({ stats, onClose, theme }) {
  const winLossData = [
    { name: "X Wins", value: stats.xWins },
    { name: "O Wins", value: stats.oWins },
    { name: "Draws", value: stats.draws },
  ];

  const aiData = [
    { name: "X", Wins: stats.xWins, Losses: stats.oWins },
    { name: "O", Wins: stats.oWins, Losses: stats.xWins },
  ];

  const movesTrend = stats.movesPerGame.map((moves, idx) => ({
    game: idx + 1,
    moves,
  }));

  const avgMoves = stats.movesPerGame.length
    ? stats.movesPerGame.reduce((a, b) => a + b, 0) / stats.movesPerGame.length
    : 0;

  const chartColors = {
    x: "#00C49F",
    o: "#FF8042",
    draw: "#8884d8",
    win: "#4CAF50",
    loss: "#F44336",
    line: "#2196F3",
    text: theme === "dark" ? "#fff" : "#000",
    grid: theme === "dark" ? "#555" : "#ccc",
  };

  return (
    <div className="analytics-modal">
      <div className={`analytics-content ${theme}-mode`}>
        <h2>📊 Game Analytics</h2>

        {/* ✅ Grid Layout for Charts */}
        <div className="charts-grid">
          <div className="chart-box">
            <h3 className="chart-title">🏆 Win / Loss Distribution</h3>
            <PieChart width={280} height={250}>
              <Pie data={winLossData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90}>
                <Cell fill={chartColors.x} />
                <Cell fill={chartColors.o} />
                <Cell fill={chartColors.draw} />
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: theme === "dark" ? "#333" : "#fff", color: chartColors.text }} />
            </PieChart>
          </div>

          <div className="chart-box">
            <h3 className="chart-title">🤖 AI Performance</h3>
            <BarChart width={320} height={250} data={aiData}>
              <CartesianGrid stroke={chartColors.grid} strokeDasharray="3 3" />
              <XAxis dataKey="name" stroke={chartColors.text} />
              <YAxis stroke={chartColors.text} />
              <Tooltip contentStyle={{ backgroundColor: theme === "dark" ? "#333" : "#fff", color: chartColors.text }} />
              <Legend wrapperStyle={{ color: chartColors.text }} />
              <Bar dataKey="Wins" fill={chartColors.win} />
              <Bar dataKey="Losses" fill={chartColors.loss} />
            </BarChart>
          </div>

          <div className="chart-box">
            <h3 className="chart-title">📈 Moves Per Game</h3>
            <LineChart width={320} height={250} data={movesTrend}>
              <CartesianGrid stroke={chartColors.grid} strokeDasharray="3 3" />
              <XAxis dataKey="game" stroke={chartColors.text} />
              <YAxis stroke={chartColors.text} />
              <Tooltip contentStyle={{ backgroundColor: theme === "dark" ? "#333" : "#fff", color: chartColors.text }} />
              <Line type="monotone" dataKey="moves" stroke={chartColors.line} />
            </LineChart>
          </div>
        </div>

        <p>📈 Average Moves: <b>{avgMoves.toFixed(1)}</b></p>

        <button className="close-btn" onClick={onClose}>❌ Close</button>
      </div>
    </div>
  );
}


function App() {
  const designBoard = ["TIC", "X", "O", "X", "TAC", "O", "O", "X", "TOE"];

  const [board, setBoard] = useState(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true);
  const [winner, setWinner] = useState(null);
  const [winningLine, setWinningLine] = useState([]);
  const [isDraw, setIsDraw] = useState(false);

  const [mode, setMode] = useState(null); // "pvp" | "ai"
  const [aiLevel, setAiLevel] = useState(null); // "easy" | "medium" | "hard"

  // 🌗 Theme toggle
  const [theme, setTheme] = useState("dark");

  // 😀 Emoji/XO sets
  const emojiSets = {
    classic: ["X", "O"],
    cool: ["😎", "🤖"],
    animals: ["🐱", "🐶"],
    fruits: ["🍎", "🍌"],
    love: ["❤️", "💔"],
    sports: ["🏀", "⚽️"],
    daynight: ["🌞", "🌙"],
  };
  const [emojiSet, setEmojiSet] = useState("classic");

  // 🆕 Analytics states
  const [stats, setStats] = useState({
  totalGames: 0,
  xWins: 0,
  oWins: 0,
  draws: 0,
  movesPerGame: [],   // 👈 movesHistory ki jagah movesPerGame likho
  aiStats: {
    easy: { wins: 0, losses: 0 },
    medium: { wins: 0, losses: 0 },
    hard: { wins: 0, losses: 0 },
  },
});
  const [moves, setMoves] = useState(0);
  const [showAnalytics, setShowAnalytics] = useState(false);

  // 🌗 Toggle background on menu
  useEffect(() => {
    if (!mode) {
      document.body.classList.add("mode-screen");
    } else {
      document.body.classList.remove("mode-screen");
    }
  }, [mode]);

  useEffect(() => {
    if (!mode) {
      document.body.classList.remove("light-mode", "dark-mode");
      document.body.classList.add("mode-screen");
    } else {
      document.body.classList.remove("mode-screen");
      document.body.classList.remove("light-mode", "dark-mode");
      document.body.classList.add(`${theme}-mode`);
    }
  }, [theme, mode]);

  // 🆕 Always fresh board whenever mode/aiLevel changes
  useEffect(() => {
    setBoard(Array(9).fill(null));
    setWinner(null);
    setIsDraw(false);
    setWinningLine([]);
    setXIsNext(true);
  }, [mode, aiLevel]);

  const checkWinner = (squares) => {
    const lines = [
      [0, 1, 2],[3, 4, 5],[6, 7, 8],
      [0, 3, 6],[1, 4, 7],[2, 5, 8],
      [0, 4, 8],[2, 4, 6],
    ];
    for (let line of lines) {
      const [a, b, c] = line;
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        setWinner(squares[a]);
        setWinningLine(line);
        return;
      }
    }
    if (squares.every((sq) => sq)) {
      setIsDraw(true);
    }
  };

  const handleClick = (i) => {
    if (winner || board[i]) return;
    const squares = [...board];
    squares[i] = xIsNext ? "X" : "O";
    setBoard(squares);
    setXIsNext(!xIsNext);
    setMoves(moves + 1);
    checkWinner(squares);
  };

  // 🆕 Update stats on game over
useEffect(() => {
  if (winner || isDraw) {
    setStats((prev) => {
      const updated = { ...prev, totalGames: prev.totalGames + 1 };

      if (winner === "X") updated.xWins++;
      if (winner === "O") updated.oWins++;
      if (isDraw) updated.draws++;

      updated.movesPerGame = [...prev.movesPerGame, moves]; // 👈 FIX

      if (mode === "ai" && aiLevel) {
        if (winner === "X") updated.aiStats[aiLevel].wins++;
        if (winner === "O") updated.aiStats[aiLevel].losses++;
      }
      return updated;
    });

    setMoves(0);
    setTimeout(() => setShowAnalytics(true), 800);
  }
}, [winner, isDraw]);


  const renderSquare = (i) => {
    const [emojiX, emojiO] = emojiSets[emojiSet];
    return (
      <button
        key={i}
        className={`square ${winningLine.includes(i) ? "winner-cell" : ""}`}
        onClick={() => handleClick(i)}
      >
        {board[i] ? (
          <span className={`${board[i] === "X" ? "move-x emoji-move" : "move-o emoji-move"}`}>
            {board[i] === "X" ? emojiX : emojiO}
          </span>
        ) : (
          designBoard[i]
        )}
      </button>
    );
  };

  const handleRestart = () => {
    setBoard(Array(9).fill(null));
    setXIsNext(true);
    setWinner(null);
    setWinningLine([]);
    setIsDraw(false);
    setMoves(0);
  };

  // AI logic remains same (easy, medium, hard with minimax)...

  const getRandomMove = (squares) => {
    const empty = squares.map((val, i) => (val === null ? i : null)).filter((val) => val !== null);
    if (empty.length === 0) return null;
    return empty[Math.floor(Math.random() * empty.length)];
  };

  const getMediumMove = (squares) => {
    const lines = [
      [0, 1, 2],[3, 4, 5],[6, 7, 8],
      [0, 3, 6],[1, 4, 7],[2, 5, 8],
      [0, 4, 8],[2, 4, 6],
    ];
    for (let [a, b, c] of lines) {
      if (squares[a] === "O" && squares[b] === "O" && !squares[c]) return c;
      if (squares[a] === "O" && squares[c] === "O" && !squares[b]) return b;
      if (squares[b] === "O" && squares[c] === "O" && !squares[a]) return a;
    }
    for (let [a, b, c] of lines) {
      if (squares[a] === "X" && squares[b] === "X" && !squares[c]) return c;
      if (squares[a] === "X" && squares[c] === "X" && !squares[b]) return b;
      if (squares[b] === "X" && squares[c] === "X" && !squares[a]) return a;
    }
    return getRandomMove(squares);
  };

  const evaluateWinner = (squares) => {
    const lines = [
      [0, 1, 2],[3, 4, 5],[6, 7, 8],
      [0, 3, 6],[1, 4, 7],[2, 5, 8],
      [0, 4, 8],[2, 4, 6],
    ];
    for (let [a, b, c] of lines) {
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) return squares[a];
    }
    return null;
  };

  const minimax = (squares, depth, isMaximizing) => {
    const winnerNow = evaluateWinner(squares);
    if (winnerNow === "O") return 10 - depth;
    if (winnerNow === "X") return depth - 10;
    if (squares.every((sq) => sq)) return 0;

    if (isMaximizing) {
      let bestScore = -Infinity;
      squares.forEach((val, i) => {
        if (!val) {
          squares[i] = "O";
          let score = minimax(squares, depth + 1, false);
          squares[i] = null;
          bestScore = Math.max(score, bestScore);
        }
      });
      return bestScore;
    } else {
      let bestScore = Infinity;
      squares.forEach((val, i) => {
        if (!val) {
          squares[i] = "X";
          let score = minimax(squares, depth + 1, true);
          squares[i] = null;
          bestScore = Math.min(score, bestScore);
        }
      });
      return bestScore;
    }
  };

  const getBestMove = (squares) => {
    let bestScore = -Infinity;
    let move = null;
    squares.forEach((val, i) => {
      if (!val) {
        squares[i] = "O";
        let score = minimax(squares, 0, false);
        squares[i] = null;
        if (score > bestScore) {
          bestScore = score;
          move = i;
        }
      }
    });
    return move;
  };

  useEffect(() => {
    if (mode === "ai" && aiLevel && !winner && !isDraw && !xIsNext) {
      let move;
      if (aiLevel === "easy") move = getRandomMove(board);
      else if (aiLevel === "medium") move = getMediumMove(board);
      else if (aiLevel === "hard") move = getBestMove(board);

      if (move !== null) setTimeout(() => handleClick(move), 500);
    }
  }, [board, xIsNext, aiLevel, mode, winner, isDraw]);

  // ========================== Screens ==========================

  if (!mode) {
    return (
      <div className="mode-selection">
        <h1>🎮 Tic Tac Toe</h1>
        <button className="mode-btn" onClick={() => setMode("pvp")}>👥 Player vs Player</button>
        <button className="mode-btn" onClick={() => setMode("ai")}>🤖 Player vs Computer</button>
      </div>
    );
  }

  if (mode === "ai" && !aiLevel) {
    return (
      <div className="mode-selection">
        <h1>🤖 Choose AI Level</h1>
        <select className="mode-btn" onChange={(e) => setAiLevel(e.target.value)}>
          <option value="">-- Select Level --</option>
          <option value="easy">Easy (Random)</option>
          <option value="medium">Medium (Block + Win)</option>
          <option value="hard">Hard (Unbeatable)</option>
        </select>
        <br />
        <button className="mode-btn" onClick={() => setMode(null)}>⬅ Back</button>
      </div>
    );
  }

  const [emojiX, emojiO] = emojiSets[emojiSet];

  return (
    <div className={`game-container ${theme}-mode`}>
      <div className="board">{designBoard.map((_, i) => renderSquare(i))}</div>
      <div className="info">
        {winner ? (
          <span>🏆 Winner: <b>{winner === "X" ? emojiX : emojiO}</b></span>
        ) : isDraw ? (
          <span>🤝 Game Draw!</span>
        ) : (
          <span>👉 Next Player: <b>{xIsNext ? emojiX : emojiO}</b></span>
        )}
      </div>

      <div className="button-group">
        <button className="restart" onClick={handleRestart}>🔄 Restart</button>
        <button className="toggle-btn" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
          {theme === "dark" ? "🌞 Light" : "🌙 Dark"}
        </button>
        <select className="mode-btn" value={emojiSet} onChange={(e) => setEmojiSet(e.target.value)}>
          <option value="classic">X / O</option>
          <option value="cool">😎 vs 🤖</option>
          <option value="animals">🐱 vs 🐶</option>
          <option value="fruits">🍎 vs 🍌</option>
          <option value="love">❤️ vs 💔</option>
          <option value="sports">🏀 vs ⚽️</option>
          <option value="daynight">🌞 vs 🌙</option>
        </select>
        <button className="mode-btn" onClick={() => { setMode(null); setAiLevel(null); }}>⬅ Back to Menu</button>
      </div>

      {/* 🆕 Analytics Popup */}
      {showAnalytics && (
        <AnalyticsModal
          stats={stats}
          theme={theme}
          onClose={() => setShowAnalytics(false)}
        />
      )}
    </div>
  );
}

export default App;
