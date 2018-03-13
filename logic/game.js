class Game {
    constructor(whitePlayerName = 'White', whitePlayerID = null, blackPlayerName = 'Black', blackPlayerID = null) {
        if (whitePlayerName.toLowerCase() === blackPlayerName.toLowerCase()) {
            whitePlayerName += ' (W)'
            blackPlayerName += ' (B)'
        }
        this._whitePlayer = new Player(whitePlayerName, 'white')
        this._blackPlayer = new Player(blackPlayerName, 'black')

        this._gameHistory = []

        this._board = new Board(whitePlayer, blackPlayer)
    }
}

class Player {
    constructor(name, color, id = null) {
        this._name = name
        this._color = color
        this._id = id
    }

    get color() {
        return this._color
    }

    get name() {
        return this._name
    }

    get id() {
        return this._id
    }
}

class Board {
    constructor() {
        this._board = []
        let columns = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']
        let rows = [1, 2, 3, 4, 5, 6, 7, 8]
        for (let row of rows) {
            let thisRow = []
            for (let column in columns) {
                thisRow.push({
                    name: columns[column] + row,
                    columnIndex: Number.parseInt(column),
                    rowIndex: row - 1,
                    piece: this.determineStartingPiece(columns[column], row)
                })
            }
            this._board.push(thisRow)
        }
    }

    determineStartingPiece(column, row) {
        let color = ''
        if (row < 3) color = 'White'
        else if (row > 6) color = 'Black'
        if (row === 2 || row === 7) return new Pawn(color)
        if (row === 1 || row === 8) {
            if (column == 'A' || column == 'H') return new Rook(color)
            if (column == 'B' || column == 'G') return new Knight(color)
            if (column == 'C' || column == 'F') return new Bishop(color)
            if (column == 'D') return new Queen(color)
            if (column == 'E') return new King(color)
        }
        return null
    }

    newTileOK(oldRow, oldCol, newRow, newCol) {
        if (this.board[newRow][newCol].piece.color === this.board[oldRow][oldCol].piece.color) throw new Error('Same Color Piece on New Tile')
    }

    kingSafe(color) {

    }

    unobstructedMove(oldRow, oldCol, newRow, newCol) {
        let [lowCol, highCol] = [newCol, oldCol].sort((a, b) => a - b)
        let [lowRow, highRow] = [newRow, oldRow].sort((a, b) => a - b)
        if (newRow === oldRow) {
            for (let c = lowCol + 1; c < highCol; c++) {
                if (this.board[newRow][c].piece) throw new Error('Obstructed Horizontal Move')
            }
        } else if (newCol === oldCol) {
            for (let r = lowRow + 1; r < highRow; r++) {
                if (this.board[r][newCol].piece) throw new Error('Obstructed Vertical Move')
            }
        } else if (newRow + newCol === oldRow + oldCol) {
            for (let r = lowRow + 1; r < highRow; r++) {
                for (let c = highCol - 1; c > lowCol; c--) {
                    if (this.board[r][c].piece) throw new Error('Obstructed Left-Diagonal Move')
                }
            }
        } else if (newRow - newCol === oldRow - oldCol) {
            for (let r = lowRow + 1; r < highRow; r++) {
                for (let c = lowCol + 1; c < highCol; c++) {
                    if (this.board[r][c].piece) throw new Error('Obstructed Right-Diagonal Move')
                }
            }
        } else {
            throw new Error('Invalid Move')
        }
    }

    get board() {
        return this._board
    }
}

class Piece {
    constructor(color) {
        this._color = color.toLowerCase().split('').includes('w') ? 'White' : 'Black'
        this._captured = false
    }

    capture() {
        this._captured = true
    }

    get captured() {
        return this._captured
    }

    get color() {
        return this._color
    }

    get shortColor() {
        return this.color === 'White' ? '(W)' : '(B)'
    }
}

class Pawn extends Piece {
    constructor(color) {
        super(color)
        this._name = 'Pawn'
        this._shortName = 'P'
    }

    get name() {
        return this._name
    }

    get shortName() {
        return this._shortName
    }
}

class Bishop extends Piece {
    constructor(color) {
        super(color)
        this._name = 'Bishop'
        this._shortName = 'B'
    }

    get name() {
        return this._name
    }

    get shortName() {
        return this._shortName
    }
}

class Knight extends Piece {
    constructor(color) {
        super(color)
        this._name = 'Knight'
        this._shortName = 'N'
    }

    get name() {
        return this._name
    }

    get shortName() {
        return this._shortName
    }
}

class Rook extends Piece {
    constructor(color) {
        super(color)
        this._name = 'Rook'
        this._shortName = 'R'
    }

    get name() {
        return this._name
    }

    get shortName() {
        return this._shortName
    }
}

class Queen extends Piece {
    constructor(color) {
        super(color)
        this._name = 'Queen'
        this._shortName = 'Q'
    }

    get name() {
        return this._name
    }

    get shortName() {
        return this._shortName
    }
}

class King extends Piece {
    constructor(color) {
        super(color)
        this._name = 'King'
        this._shortName = 'K'
    }

    get name() {
        return this._name
    }

    get shortName() {
        return this._shortName
    }
}

let woo = new Board()