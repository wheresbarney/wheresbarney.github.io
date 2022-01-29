// 'use strict';

/*
Bugs
1. draw CSS, closed+won CSS
2. Fix win generator (click on correct board!)
*/

WinState = {
  X_WON: "x_won",
  O_WON: "o_won",
  DRAW: "draw"
};

function Square(props) {
  className = "cell";
  if (props.lastClicked) {
    className += " lastClicked";
  }

  return (
    <button className={className} onClick={props.onClick}>
      {props.value}
    </button>
  );
}

class RegularBoard extends React.Component {
  renderSquare(i) {
    return (
      <Square
        key={i}
        value={this.props.squares[i]}
        lastClicked={this.props.lastClicked === i}
        onClick={() => this.props.onClick(i)}
      />
    );
  }

  render() {
    let board = [];
    for (let cell = 0; cell < 9; ++cell) {
      board.push(this.renderSquare(cell));
    }
    return (
      <div
        className={
          "inner " +
          this.props.winState +
          " " +
          (this.props.playable ? "playable" : "closed")
        }
      >
        {board}
      </div>
    );
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      // outer array: boards; inner arrays: cells in board
      squares: Array.from(Array(9), () => Array(9).fill(null)),
      wins: Array(9).fill(null),
      playable: [true].concat(Array(8).fill(false)),
      xIsNext: true
    };
  }

  reset() {
    this.setState({
      // outer array: boards; inner arrays: cells in board
      squares: Array.from(Array(9), () => Array(9).fill(null)),
      wins: Array(9).fill(null),
      playable: [true].concat(Array(8).fill(false)),
      xIsNext: true
    });
  }

  generateTestWin(winner) {
    const loser = winner === "X" ? "O" : "X";
    const wonBoardState = [
      winner,
      loser,
      null,
      loser,
      winner,
      null,
      loser,
      null,
      winner
    ];
    const winnerState = winner === "X" ? WinState.X_WON : WinState.O_WON;

    this.setState({
      squares: [
        wonBoardState.slice(),
        wonBoardState.slice(),
        wonBoardState.slice(0, 8, null).concat(null)
      ].concat(Array.from(Array(6), () => Array(9).fill(null))),
      wins: [winnerState, winnerState].concat(Array(7).fill(null)),
      playable: [false, false, true, false, false, false, false, false, false],
      xIsNext: winner === "X",
      lastClicked: {
        board: 0,
        index: 2
      }
    });
  }

  calculateBoardWinner(cells) {
    const winner = this.calculateWinnerImpl(cells);
    if (winner) {
      return winner === "X" ? WinState.X_WON : WinState.O_WON;
    }
    if (cells.every((x) => x)) {
      return WinState.DRAW;
    }
    return null;
  }

  calculateOverallWinner() {
    return this.calculateWinnerImpl(this.state.wins);
  }

  calculateWinnerImpl(squares) {
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
      if (
        squares[a] &&
        squares[a] === squares[b] &&
        squares[a] === squares[c]
      ) {
        return squares[a];
      }
    }
    return null;
  }

  handleClick(board, index) {
    if (!this.state.playable[board] || this.state.squares[board][index]) {
      return;
    }

    const squares = this.state.squares.slice();
    squares[board][index] = this.state.xIsNext ? "X" : "O";

    const wins = this.state.wins.slice();
    wins[board] = this.calculateBoardWinner(squares[board]);
    const nextIsComplete = squares[index].every((x) => x);
    const playable = squares.map((sq, i) => {
      if (nextIsComplete) {
        // every incomplete square is open
        return !sq.every((x) => x);
      }
      return i === index;
    });

    this.setState((state) => ({
      squares: squares,
      wins: wins,
      playable: playable,
      lastClicked: {
        board: board,
        index: index
      },
      xIsNext: !state.xIsNext
    }));
  }

  render() {
    const winner = this.calculateOverallWinner();
    let status;
    if (winner) {
      status = "Winner: " + winner === WinState.X_WON ? "X" : "O";
    } else {
      status = "Next player: " + (this.state.xIsNext ? "X" : "O");
    }

    const boards = [];
    for (let b = 0; b < 9; ++b) {
      boards.push(
        <RegularBoard
          key={b}
          squares={this.state.squares[b]}
          lastClicked={
            this.state.lastClicked?.board == b
              ? this.state.lastClicked.index
              : null
          }
          winState={this.state.wins[b]}
          playable={this.state.playable[b]}
          onClick={(i) => this.handleClick(b, i)}
        />
      );
    }
    return (
      <div className="game">
        <div className="outer">{boards}</div>
        <div className="game-info">
          <div>{status}</div>
          <button onClick={() => this.reset()}>Reset</button>
          <button onClick={() => this.generateTestWin("X")}>X wins</button>
          <button onClick={() => this.generateTestWin("O")}>O wins</button>
        </div>
      </div>
    );
  }
}

// ========================================

ReactDOM.render(<Game />, document.getElementById("root"));
