let {
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
} = require('../../logic/game.js')


/*PlaceHolder*/

let chai = require('chai')
let chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)
let expect = chai.expect


function startNewGame(){
  return new Board()
}


let testGame = startNewGame()
console.log(testGame.board)


describe('pawnTest', )
