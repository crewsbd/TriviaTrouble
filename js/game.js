import { GameData } from './GameData.mjs';
import { Board } from './Board.mjs';
import { Player } from './Player.mjs';

console.log('game.js');

const gameData = new GameData();
const gameState = gameData.getGameState();

const board = new Board(gameState, gameData)

// board.runGame();


// board.populateCategories(gameData);
// board.populateQuestion()

// const p1 = document.querySelector('#p01badge');
// const p2 = document.querySelector('#p02badge');
// const p3 = document.querySelector('#p03badge');
// board.flyToElement(p1, p3, 2);
// board.flyToElement(p2, p1, 1);
// board.flyToElement(p3, p2, 1);

// gameData.savePlayer(new Player({
//     name: "Brian",
//     color: "red",
//     avatar: "cat",
//     highScore: 100
// })).then(() => {
//     gameData.savePlayer(new Player({
//         name: "Joe",
//         color: "green",
//         avatar: "cat",
//         highScore: 100
//     }));
// })



// gameData.getCategories().then((data) => board.populateCategories(data));
// gameData.getQuestion('medium', '9').then((data) => board.populateQuestion(data));