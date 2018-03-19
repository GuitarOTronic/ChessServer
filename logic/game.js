let fs = require('fs')

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
        let name = row + column
        if (row < 3) color = 'White'
        else if (row > 6) color = 'Black'
        if (row === 2 || row === 7) return new Pawn(color, name)
        if (row === 1 || row === 8) {
            if (column == 'A' || column == 'H') return new Rook(color, name)
            if (column == 'B' || column == 'G') return new Knight(color, name)
            if (column == 'C' || column == 'F') return new Bishop(color, name)
            if (column == 'D') return new Queen(color, name)
            if (column == 'E') return new King(color, name)
        }
        return null
    }

    newTileOK(oldRow, oldCol, newRow, newCol) {
        if (this.board[newRow][newCol].piece.color === this.board[oldRow][oldCol].piece.color) throw new Error('Same Color Piece on New Tile')
    }

    _findKingTile(color) {
        let kingTile

        loop1:
        for (let r = 0; r < this.board.length; r++) {
            for (let c = 0; c < this.board[r].length; c++) {
                if (this.board[r][c].piece && this.board[r][c].piece.name === 'King' && this.board[r][c].piece.color === color) {
                    kingTile = this.board[r][c]
                    break loop1
                }
            }
        }

        return kingTile
    }

    pieceSafe(row, col) {
        let tile = this.board[row, col]
        let safe = true
        let dangerousTiles = []
        //Knights Check
        let knightPositions = [
            [1, 2],
            [1, -2],
            [-1, 2],
            [-1, -2],
            [2, 1],
            [2, -1],
            [-2, 1],
            [-2, -1]
        ]

        knightPositions = this._pointsRelativeToPiece(row, column, knightPositions)

        for (let i = 0; i < knightPositions.length; i++) {
            let [r, c] = knightPositions[i]
            if (this.board[r][c].piece && this.board[r][c].piece.name === 'Knight' && this.board[r][c].piece.color !== kingTile.piece.color) dangerousTiles.push([r, c])
        }
        //End Knights Check

        //crossCheck bro
        let pointsAroundPiece = [
            {
                direction: 'straight',
                modifier: [-1, 0]
            },
            {
                direction: 'diagonal',
                pawnColor: 'White',
                modifier: [-1, 1]
            },
            {
                direction: 'diagonal',
                pawnColor: 'White',
                modifier: [-1, -1]
            },
            {
                direction: 'straight',
                modifier: [0, 1]
            },
            {
                direction: 'straight',
                modifier: [0, -1]
            },
            {
                direction: 'straight',
                modifier: [1, 0]
            },
            {
                direction: 'diagonal',
                pawnColor: 'Black',
                modifier: [1, 1]
            },
            {
                direction: 'diagonal',
                pawnColor: 'Black',
                modifier: [1, -1]
            }
        ]

        for (let directionInfo of pointsAroundPiece) {
            let [rowDir, colDir] = directionInfo.modifier
            let currentRow = row + rowDir
            let currentColumn = col + colDir
            let currentTile = this.board[currentRow] && this.board[currentRow][currentColumn]
            let currentPiece = currentTile && currentTile.piece
            while (currentTile && (!currentPiece || currentPiece.color !== tile.piece.color)) {
                if (currentPiece && this.board[currentRow][currentColumn].piece.color !== tile.piece.color) {
                    switch (directionInfo.direction) {
                        case 'diagonal':
                            if (currentPiece.name === 'Bishop' || currentPiece.name === 'Queen' || (currentPiece.name === 'Pawn' && currentPiece.color === directionInfo.pawnColor)) dangerousTiles.push([currentRow, currentColumn])
                            break
                        case 'straight':
                            if (currentPiece.name === 'Rook' || currentPiece.name === 'Queen') dangerousTiles.push([currentRow, currentColumn])
                            break
                        default:
                            break
                    }
                    break
                }

                currentRow += rowDir
                currentColumn += colDir
                currentTile = this.board[currentRow] && this.board[currentRow][currentColumn]
                currentPiece = currentTile && currentTile.piece
            }
        }

        return dangerousTiles
    }

    _pointsRelativeToPiece(pieceRow, pieceCol, arrayOfRelativeXYPositions) {
        return arrayOfRelativeXYPositions.map(pos => {
            let [r, c] = pos
            return [pieceRow + r, pieceCol + c]
        }).filter(pos => pos[0] >= 0 && pos[0] < 8 && pos[1] >= 0 && pos[1] < 8)
    }

    checkMate(color) {
        let kingTile = this._findKingTile(color)
        let kingRow = kingTile.rowIndex
        let kingColumn = kingTile.columnIndex


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
    constructor(color, id) {
        this._color = color.toLowerCase().split('').includes('w') ? 'White' : 'Black'
        this._id = id
        this._captured = false
    }

    capture() {
        this._captured = true
    }

    get id() {
        return this._id
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
    constructor(color, id) {
        super(color, id)
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
    constructor(color, id) {
        super(color, id)
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
    constructor(color, id) {
        super(color, id)
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
    constructor(color, id) {
        super(color, id)
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
    constructor(color, id) {
        super(color, id)
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
    constructor(color, id) {
        super(color, id)
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

class History {
    constructor () {
        this._game = []
    }

    addMove (beginningTile, endTile) {
        this._game.push(this._createObject(beginningTile, endTile))
        
    }

    _createObject (beginningTile, endTile) {

    }

    get game () {
        return this._game
    }

}

let woo = new Board()

console.log(woo.board[0][0].piece)