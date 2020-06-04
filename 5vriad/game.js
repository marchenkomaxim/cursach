class Field {
  constructor(selector, rowsNum, colsNum) {
    this._gameEnd = false;
    this._field = document.querySelector(selector);
    this._colsNum = colsNum;
    this._rowsNum = rowsNum;

    this._dots = new Dots();
    this._html = new HTML();
    this._queue = new Queue(['gamer1', 'gamer2']);
    this._html.createTable(this._field, this._rowsNum, this._colsNum);
    this._run();
  }

  _run() {
    this._field.addEventListener('click', () => {
      const cell = event.target.closest('td:not(.gamer)');
      if (!this._gameEnd && cell) {
        const col = this._html.getPrevSiblingsNum(cell);
        const row = this._html.getPrevSiblingsNum(cell.parentElement);

        const gamer = this._queue.getGamer();
        const dot = new Dot(gamer, cell, row, col, this._dots);
        this._dots.add(dot, row, col);
        console.log(dot);

        const winLine = this._checkWin(dot);
        if (winLine) {
          this._win(winLine);
        }
      }
    });
  }

  _win(winLine) {
    this._gameEnd = true;
    this._notifyWinnerCells(winLine);
  }

  _notifyWinnerCells(winLine) {
    winLine.forEach(dot => {
      dot.becomeWinner();
    });
  }

  _checkWin(dot) {
    const dirs = [
      { deltaRow:  0, deltaCol: -1 },
      { deltaRow: -1, deltaCol: -1 },
      { deltaRow: -1, deltaCol:  0 },
      { deltaRow: -1, deltaCol:  1 },
    ];

    for (let i = 0; i < dirs.length; i++) {
      const line = this._checkLine(dot, dirs[i].deltaRow, dirs[i].deltaCol);
      if (line.length >= 5) {
        return line;
      }
    }
    return false;
  }

  _checkLine(dot, deltaRow, deltaCol) {
    const dir1 = this._checkDir(dot,  deltaRow,  deltaCol);
    const dir2 = this._checkDir(dot, -deltaRow, -deltaCol);
    return [].concat(dir1, [dot], dir2);
  }

  _checkDir(dot, deltaRow, deltaCol) {
    const result = [];
    let neighbor = dot;
    while (true) {
      neighbor = neighbor.getNeighbor(deltaRow, deltaCol);
      if (neighbor) {
        result.push(neighbor);
      } else {
        return result;
      }
    }
  }
}

class Dots {
  constructor() {
    this._dots = {};
  }

  add(dot, row, col) {
    if (this._dots[row] === undefined) {
      this._dots[row] = {};
    }
    this._dots[row][col] = dot;
  }

  get(row, col) {
    if (this._dots[row] && this._dots[row][col]) {
      return this._dots[row][col];
    } else {
      return undefined;
    }
  }
}

class Dot {
  constructor(gamer, elem, row, col, dots) {
    this._gamer = gamer;
    this._elem = elem;
    this._row = row;
    this._col = col;
    this._dots = dots;
    this._neighbors = {};

    this._findNeighbors();
    this._notifyNeighbors();
    this._reflect();
  }

  getRow() {
    return this._row;
  }

  getCol() {
    return this._col;
  }

  becomeWinner() {
    this._elem.classList.add('winner');
  }

  getNeighbor(deltaRow, deltaCol) {
    if (this._neighbors[deltaRow] !== undefined) {
      return this._neighbors[deltaRow][deltaCol];
    } else {
      return undefined;
    }
  }

  addNeighbor(neighbor) {
    const deltaRow = neighbor.getRow() - this._row;
    const deltaCol = neighbor.getCol() - this._col;
    if (this._neighbors[deltaRow] === undefined) {
      this._neighbors[deltaRow] = {};
    }
    this._neighbors[deltaRow][deltaCol] = neighbor;
  }

  _findNeighbors() {
    this._considerNeighbor(1, 1);
    this._considerNeighbor(1, 0);
    this._considerNeighbor(1, -1);
    this._considerNeighbor(-1, 1);
    this._considerNeighbor(-1, 0);
    this._considerNeighbor(-1, -1);
    this._considerNeighbor(0, 1);
    this._considerNeighbor(0, -1);
  }

  _considerNeighbor(deltaRow, deltaCol) {
    const neighbor = this._dots.get(this._row + deltaRow, this._col + deltaCol);

    if (neighbor !== undefined && neighbor._belongsTo(this._gamer)) {
      this.addNeighbor(neighbor);
    }
  }

  _notifyNeighbors() {
    for (const rowKey in this._neighbors) {
      for (const colKey in this._neighbors[rowKey]) {
        this._neighbors[rowKey][colKey].addNeighbor(this);
      }
    }
  }

  _reflect() {
    this._elem.classList.add('gamer');
    this._elem.classList.add(this._gamer);
  }

  _belongsTo(gamer) {
    return this._gamer === gamer;
  }
}

class Queue {
  constructor(gamers) {
    this._gamers = gamers;
    this._counter = new Counter(this._gamers.length);
  }

  getGamer() {
    return this._gamers[this._counter.get()];
  }
}

class Counter {
  constructor(length) {
    this._length = length;
    this._counter = null;
  }

  get() {
    if (this._counter === null) {
      this._counter = 0;
    } else {
      this._counter++;
      if (this._counter === this._length) {
        this._counter = 0;
      }
    }
    return this._counter;
  }
}

class HTML {
  createTable(parent, rowsNum, colsNum) {
    const table = document.createElement('table');
    for (let i = 0; i < rowsNum; i++) {
      const tr = document.createElement('tr');
      for (let j = 0; j < colsNum; j++) {
        const td = document.createElement('td');
        tr.appendChild(td);
      }
      table.appendChild(tr);
    }
    parent.appendChild(table);
  }

  getPrevSiblingsNum(elem) {
    let prev = elem.previousSibling;
    let i = 0;

    while (prev) {
      prev = prev.previousSibling;
      i++;
    }
    return i;
  }
}


new Field('#game', 30, 30);
