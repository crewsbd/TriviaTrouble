import { GameData } from './GameData.mjs';
import { Board } from './Board.mjs';
import { Player } from './Player.mjs';

console.log('game.js');

const gameData = new GameData();
const gameState = gameData.getGameState();

const board = new Board(gameState, gameData)