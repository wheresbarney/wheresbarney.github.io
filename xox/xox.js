BoardStateEnum = {
  OPEN: "open",
  CLOSED: "closed",
  X_WON: "x_won",
  O_WON: "o_won"
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
    return <div className={"inner " + this.props.state}>{board}</div>;
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.reset();
  }

  reset() {
    const squares = [];
    for (let i = 0; i < 9; ++i) {
      squares.push(Array(9).fill(null));
    }
    this.state = {
      squares: squares,
      lastClicked: {
        board: null,
        index: 0
      },
      xIsNext: true
    };
  }

  testWin(who) {
    const squares = [];
    for (let i = 0; i < 9; ++i) {
      squares.push(Array(9).fill(null));
    }
    squares[0] = Array(9).fill(who);
    squares[1] = Array(9).fill(who);
    squares[2] = Array(9).fill(who);

    this.setState({
      squares: squares,
      lastClicked: {
        board: 2,
        index: 3
      },
      xIsNext: true
    });
  }

  calculateBoardWinner(board) {
    const winner = this.calculateWinnerImpl(this.state.squares[board]);
    if (winner)
      return winner === "X" ? BoardStateEnum.X_WON : BoardStateEnum.O_WON;
    return null;
  }

  calculateOverallWinner() {
    return this.calculateWinnerImpl(
      this.state.squares.map((sq) => this.calculateWinnerImpl(sq))
    );
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
    if (board !== this.state.lastClicked.index) {
      return;
    }
    if (this.calculateBoardWinner(board) || this.state.squares[board][index]) {
      return;
    }

    const squares = this.state.squares.slice();
    squares[board][index] = this.state.xIsNext ? "X" : "O";
    this.setState({
      squares: squares,
      lastClicked: {
        board: board,
        index: index
      },
      xIsNext: !this.state.xIsNext
    });
  }

  render() {
    const winner = this.calculateOverallWinner();
    let status;
    if (winner) {
      status = "Winner: " + winner;
    } else {
      status = "Next player: " + (this.state.xIsNext ? "X" : "O");
    }

    const boards = [];
    for (let b = 0; b < 9; ++b) {
      const winner = this.calculateBoardWinner(b);
      const state = winner
        ? winner
        : this.state.lastClicked?.index === b
        ? BoardStateEnum.OPEN
        : BoardStateEnum.CLOSED;

      boards.push(
        <RegularBoard
          key={b}
          squares={this.state.squares[b]}
          lastClicked={
            this.state.lastClicked?.board == b
              ? this.state.lastClicked.index
              : null
          }
          state={state}
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
          <button onClick={() => this.testWin("X")}>X wins</button>
          <button onClick={() => this.testWin("Y")}>Y wins</button>
        </div>
      </div>
    );
  }
}

// ========================================

ReactDOM.render(<Game />, document.getElementById("root"));
