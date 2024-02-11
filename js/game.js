import { GameData } from './GameData.mjs';
import { Board } from './Board.mjs';

console.log('game.js');



const gameData = new GameData();
const board = new Board();


// board.populateCategories(gameData);
// board.populateQuestion()

gameData.getCategories().then((data) => board.populateCategories(data));
gameData.getQuestion('medium', '9').then((data) => board.populateQuestion(data));