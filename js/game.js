import { GameData } from './GameData.mjs';
import { Board } from './Board.mjs';


const gameData = new GameData();
const gameState = gameData.getGameState();

const board = new Board(gameState, gameData)