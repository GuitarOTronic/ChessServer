let fs = require('fs')

class Game {
    constructor(whitePlayerName = 'White', whitePlayerID = null, blackPlayerName = 'Black', blackPlayerID = null, history) {
        if (whitePlayerName.toLowerCase() === blackPlayerName.toLowerCase()) {
            whitePlayerName += ' (W)'
            blackPlayerName += ' (B)'
        }
        this._whitePlayer = new Player(whitePlayerName, 'white')
        this._blackPlayer = new Player(blackPlayerName, 'black')

        this._gameHistory = history || []
        this._board = new Board(this._gameHistory)

    }

    // get history(){
    //   return this._gameHistory
    // }
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
    constructor(history) {
        this._board = []
        this._gameHistory = new History()

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

        if (history && history.length) {
            history.forEach(turn => {
                this.move(turn.beginningTile, turn.endTile)
            })
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

    threateningTiles(tile) {
        let currentPieceColor = tile.piece.color
        let opponentPieces = this.board.reduce((opponentTiles, rowArr) => {
            return [...opponentTiles, ...rowArr.filter(rowTile => (rowTile.piece && rowTile.piece.color !== currentPieceColor))]
        }, [])

        let dangerousTiles = opponentPieces.filter(opponentTile => {
            return (
                opponentTile.piece.moveOkay(opponentTile, tile, this._gameHistory) &&
                (opponentTile.piece.name === 'Knight' || this.unobstructedMove(opponentTile.rowIndex, opponentTile.columnIndex,tile.rowIndex, tile.columnIndex))
            )
        })

        return dangerousTiles
    }

    pieceSafe(tile) {
        return !this.threateningTiles(tile).length
    }

    _pointsRelativeToPiece(pieceRow, pieceCol, arrayOfRelativeXYPositions) {
        return arrayOfRelativeXYPositions.map(pos => {
            let [r, c] = pos
            return [pieceRow + r, pieceCol + c]
        }).filter(pos => pos[0] >= 0 && pos[0] < 8 && pos[1] >= 0 && pos[1] < 8)
    }

    possibleMoves(tile){
      let possibilities = []
      for (let r = 0; r < this.board.length; r++) {
          for (let c = 0; c < this.board[r].length; c++) {
            if (this.board[r][c].piece && this.board[r][c].piece.color != tile.piece.color || !this.board[r][c].piece){
              if (tile.piece.moveOkay(tile, this.board[r][c], history)){
                possibilities.push([r, c])
              }
            }
          }
        }
        return possibilities
    }

    checkMate(color) {
        let kingTile = this._findKingTile(color)
        let kingRow = kingTile.rowIndex
        let kingColumn = kingTile.columnIndex


    }

    unobstructedMove(oldRow, oldCol, newRow, newCol){
        let [lowCol, highCol] = [newCol, oldCol].sort((a, b) => a - b)
        let [lowRow, highRow] = [newRow, oldRow].sort((a, b) => a - b)

        if (newRow === oldRow) {
            for (let c = lowCol + 1; c < highCol; c++) {
                if (this.board[newRow][c].piece) {
                  return false
                }
            }
        } else if (newCol === oldCol) {
            for (let r = lowRow + 1; r < highRow; r++) {
                if (this.board[r][newCol].piece) {
                  return false
                }
            }
        } else if (newRow + newCol === oldRow + oldCol) {
            let [c, r] = [highCol, lowRow]

            while (c > lowCol) {
                // and r < highRow, but the difference will always be the same for both column and row
                c -= 1
                r += 1
                if (this.board[r][c].piece) return false
            }

        } else if (newRow - newCol === oldRow - oldCol) {
            let [c, r] = [lowCol, lowRow]

            while (c < highCol) {
                // and r < highRow, but the difference will always be the same for both column and row
                c += 1
                r += 1
                if (this.board[r][c].piece) return false
            }

        } else {
            return false
        }
        return true
    }

    move(oldTileName, newTileName) {
      let oldTile = this.tile(oldTileName)
      let newTile = this.tile(newTileName)
      if(!oldTile.piece) throw new Error ('Board.move: no piece on beginning tile')

      if(oldTile.piece.moveOkay(oldTile, newTile, this._gameHistory)){
        if (oldTile.piece.name !== 'Knight') {
            if(!this.unobstructedMove(oldTile.rowIndex, oldTile.columnIndex, newTile.rowIndex, newTile.columnIndex)) throw new Error ('Board.move: illegal move. Shits in the way')
        }
        //our king safe?
        // their king in check?
        //  if yes, check for checkMate

        //phantom move
        let tempOldPiece = newTile.piece
        newTile.piece = oldTile.piece
        oldTile.piece = null
        let ourKing = this._findKingTile(newTile.piece.color)
        let isSafe = this.pieceSafe(ourKing)

        if(isSafe){
          oldTile.piece = newTile.piece
          newTile.piece = tempOldPiece
          this._gameHistory.addMove(oldTile, newTile)
          newTile.piece = oldTile.piece
          oldTile.piece = null
        }else{
          throw new Error ('You kings in check!')
        }


      } else {
        throw new Error ('Board.move: illegal move ')
      }
    }

    get board() {
        return this._board
    }

    get history(){
      return this._gameHistory
    }

    tile(tileName){
      let columns = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']
      let rows = ['1', '2', '3', '4', '5', '6', '7', '8']
      return this.board[rows.indexOf(tileName[1])][columns.indexOf(tileName[0])]
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

    static moveOkay(tile, newTile){
      if (!tile || !tile.piece || !newTile) return false
      if (tile === newTile) return false
      if (newTile.piece && newTile.piece.color === tile.piece.color) return false
      return true
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

    moveOkay(tile, newTile, history){
      if(!Piece.moveOkay(tile, newTile)) return false

      let verticalMovement = Math.abs(tile.rowIndex - newTile.rowIndex)
      let horizontalMovement = Math.abs(newTile.columnIndex - tile.columnIndex)

      if (tile.piece.color === 'White' ? newTile.rowIndex <= tile.rowIndex : newTile.rowIndex >= tile.rowIndex) return false

      if (verticalMovement > 2 || horizontalMovement > 1) {
        return false
      } else {
        if (verticalMovement === 2) {
          if (horizontalMovement) return false
          if (history.pieceHistory(tile.piece.id).length != 0 ) return false
        }else if (horizontalMovement) {
          if (verticalMovement !== 1) return false
          if (!newTile.piece) return false
        }else if (!horizontalMovement) {
          if (newTile.piece) return false
        }

        return true
      }

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

    moveOkay (tile, newTile){
      if(!Piece.moveOkay(tile, newTile)) return false

      let verticalMovement = Math.abs(tile.rowIndex - newTile.rowIndex)
      let horizontalMovement = Math.abs(newTile.columnIndex - tile.columnIndex)

      if(verticalMovement !== horizontalMovement) return false

      return true
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

    moveOkay (tile, newTile) {
        if (!Piece.moveOkay(tile, newTile)) return false

        let verticalMovement = Math.abs(tile.rowIndex - newTile.rowIndex)
        let horizontalMovement = Math.abs(newTile.columnIndex - tile.columnIndex)

        if (!((verticalMovement && horizontalMovement) && verticalMovement + horizontalMovement === 3)) return false

        return true
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

    moveOkay (tile, newTile, history){
      if(!Piece.moveOkay(tile, newTile)) return false

      let verticalMovement = Math.abs(tile.rowIndex - newTile.rowIndex)
      let horizontalMovement = Math.abs(newTile.columnIndex - tile.columnIndex)

      if(verticalMovement && horizontalMovement) return false

      return true
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

    moveOkay (tile, newTile) {
        if (!Piece.moveOkay(tile, newTile)) return false

        let verticalMovement = Math.abs(tile.rowIndex - newTile.rowIndex)
        let horizontalMovement = Math.abs(newTile.columnIndex - tile.columnIndex)

        if (verticalMovement !== horizontalMovement) {
            if (verticalMovement && horizontalMovement) {
                return false
            }
        }

        return true
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

    moveOkay(tile, newTile, history) {
        if (!Piece.moveOkay(tile, newTile)) return false

        let verticalMovement = Math.abs(tile.rowIndex - newTile.rowIndex)
        let horizontalMovement = Math.abs(newTile.columnIndex - tile.columnIndex)

        if (verticalMovement > 1) return false

        if (horizontalMovement > 1) {
            //castle check goes here
            return false
        }

        return true
    }
}

class History {
    constructor () {
        this._game = []
    }

    addMove (beginningTile, endTile) {
        this._game.push(this._createObject(beginningTile, endTile))

    }

    piecesCapturedBy (pieceId) {
        let capturedObj = {}
        this.game.forEach(historyObj => {
            if (historyObj.id == pieceId && historyObject.captured) {
                capturedObj[historyObj.captured] = capturedObj[historyObj.captured] ? capturedObj[historyObj.captured] + 1 : 1
            }
        })
        return capturedObj
    }

    pieceHistory (pieceId) {
        return this.game.filter(historyObj => historyObj.id == pieceId)
    }

    _createObject (beginningTile, endTile) {
        if (!beginningTile || !endTile && !beginningTile.piece) throw new Error(`Invalid beginning or end tile in _createObject of History class. begTile: ${beginningTile}, endTile: ${endTile}`)
        let turnObject = {
            turn: this.game.length + 1,
            id: beginningTile.piece.id,
            beginningTile: beginningTile.name,
            endTile: endTile.name,
            captured: endTile.piece ? endTile.piece.name : null,
            piece: beginningTile.piece.shortName,
            color: beginningTile.piece.shortColor
        }
        return turnObject
    }

    get game () {
        return this._game
    }
}

let woo = new Board()
// woo.move('A2', 'A4')
// woo.move('A4', 'A5')
// woo.move('A5', 'A6')
// woo.move('A1', 'A3')
// woo.move('A3', 'D3')
woo.move('C2', 'C3')
console.log(woo.tile('C2'))
woo.move('D1', 'A4')
woo.move('D7', 'D6')
// console.log('**************************');
// console.log('**************************');
// let bleh = woo._pieceSafe(woo.tile('A6'))



module.exports ={
  Game,
  Player,
  Board,
  Piece,
  Pawn,
  Knight,
  Bishop,
  Rook,
  Queen,
  King,
  History
  }
