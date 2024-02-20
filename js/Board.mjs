import { GameData } from './GameData.mjs';
import { Player } from './Player.mjs';
import { clickOption, clickSelect, decodeEntities, getTemplateInstance, flyToElement } from './utils.mjs';

/**
 * Class to manage the game state
 */
export class Board {
    /**
     * Constructor
     * @param {Object} gameState
     * @param {GameData} gameData 
     */
    constructor(gameState, gameData) {
        console.log(gameState);
        this._init(gameData);
        if(gameState) { // A game state has been passed, load it
            this.gameData = gameData;
            /**@type {Array<Player>} */
            this.players = gameState.players;
            this.currentScores = gameState.currentScores;
            this.round = gameState.round;
            this.maxRounds = gameState.maxRounds;
            this.currentPlayer = gameState.currentPlayer;
            this.answers = gameState.currentQuestions;
            this.correct = gameState.correct;
            this.correctIndex = gameState.correctIndex;
            this.questionValue = gameState.questionValue;
            this.categories = gameState.categories;
            this.gameData.saveGameState(this);
            this.gameOver = gameState.gameOver;
            this.runGame()
        }
        else { // Open the new game modal to start a new game
            this.gameData = gameData;
            /**@type {Array<Player>} */
            this.players = [];
            this.round = 1;
            this.maxRounds = 5;
            this.currentPlayer = 0;
            this.currentScores = [];
            this.answers = [];
            this.correct = '';
            this.correctIndex = 0;
            this.questionValue = 1;
            this.categories = [];
            this.gameOver = false;
            // this.gameData.saveGameState(this);
            this.showPlayerSelect();
        }
    }
    /**
     * Async constructor stuff
     */
    async _init(gameData) {
        console.log('BOARD INIT');
        this.categories = await gameData.getCategories();
        console.log(this.categories);
    } 

    async runGame() {
        console.log('---RUN GAME---');
        //Start new game. Load and display players.
        this.gameOver = false;
        const playerSection = document.querySelector('#players');
        // Set up each player
        for(let index = 0; index < this.players.length; index++) {
            let newPlayer = document.createElement('div');
            newPlayer.dataset.name = this.players[index].name; // Put the name in for later display
            newPlayer.id = `p${index}badge`;
            newPlayer.style.backgroundColor = `${this.players[index].color}`;
            let newImg = document.createElement('img');
            newImg.src = `./images/avatars/${this.players[index].avatar}.svg`;
            newImg.width = 40;
            newImg.height = 40;
            let scoreBadge = document.createElement('div');
            scoreBadge.classList.add('score-badge')
            //this.currentScores[index] = 0;
            scoreBadge.innerHTML = this.currentScores[index];

            newPlayer.insertAdjacentElement('afterbegin', newImg);
            newPlayer.insertAdjacentElement('beforeend', scoreBadge);
            playerSection.insertAdjacentElement('beforeend', newPlayer);
        }

        // Stage the first player.
        this.stagePlayer(this.currentPlayer);

        //Load categories
        // this.populateCategories(this.gameData.getCategories);
        
        this.populateCategories(this.categories);
        
        //Set up "load question" button
        this.resetPlayArea();

        // Game is ready to play, so save in in case the browser gets refreshed
        this.gameData.saveGameState(this);
       
        //After this, the game should run itself with events.

        // Add handler for test next player. REmvoe in production
        if (this.gameData.getSetting("dev")) {
          document
            .querySelector("#test_next_player")
            .addEventListener("click", () => {
              this.nextPlayer();
            });
        }
    }

    endGame() {
        console.log('---END GAME---');
        // Display end game modal
        const victory = getTemplateInstance('victoryMessage');
        victory.querySelector('#okButton').addEventListener('click', () => {
            victory.remove();
        })
        document.querySelector('body').insertAdjacentElement('afterbegin', victory );
        
        // Clear localStorage game data.
        localStorage.removeItem('gameState');
        this.gameOver = true;
        this.clearPlayers();

        // Run showPlayerSelect
        this.showPlayerSelect();
    }

    clearPlayers() {
        for(let index = 0; index < this.players.length; index++) {
            document.querySelector(`#p${index}badge`).remove();

            
        }
        this.currentScores = [];
        this.players = [];
        this.currentPlayer = 0;
    }

    nextPlayer() {
          this.currentPlayer++;

          if (this.currentPlayer >= this.players.length) {
            this.round++;
            this.currentPlayer = 0;
          }
          if (this.round > this.maxRounds) {
            this.endGame();
          } else {
            this.updateScores();
            this.stagePlayer(this.currentPlayer);
            this.resetPlayArea();
            this.gameData.saveGameState(this);
          }
    }

    updateScores() {
        for(let index = 0; index < this.players.length; index++) {
            console.log(`#p${index}badge`);
            let marker = document.querySelector(`#p${index}badge .score-badge`);
            console.log(marker);
            marker.textContent = this.currentScores[index];
        }
    }

    resetPlayArea() {
        this.populateCategories(this.categories);
        
        // Get the pieces
        const questionElement = document.querySelector('#question');
        const generateQuestionButton = document.createElement('input');
        const questionText = document.querySelector('#question_text');
        const roundCounter = document.querySelector('#currentRound');

        // Configure generate question button
        generateQuestionButton.value = "Generate Question";
        generateQuestionButton.type = 'button';
        generateQuestionButton.id = 'generateQuestion';
        generateQuestionButton.classList.add('full-button');
        questionText.classList.add('hidden');
        generateQuestionButton.addEventListener('click', async () => {
            console.log('GENERATE QUESTION');
            // Load the question
            const difficulty = document.querySelector('#difficulty');
            const category = document.querySelector('#categories');
            this.populateQuestion(await this.gameData.getQuestion(difficulty.value, category.value));
            
            // Show it
            questionText.classList.remove('hidden');
            // Delete self
            generateQuestionButton.remove();
        })
        questionElement.insertAdjacentElement('afterbegin', generateQuestionButton);
        roundCounter.innerHTML = this.round;

        // Remove old answers
        const oldAnswers = document.querySelectorAll('.answerOption');
        oldAnswers.forEach((element) => element.remove());


    }

    stagePlayer(index) {
        const nameBadge = document.querySelector('#player_name');
        const playersListElement = document.querySelector('#players');
        const targetName = this.players[index].name;

        // Put the specified players name on display
        nameBadge.innerHTML = this.players[index].name;

        // Shift the players until the correct one is in first position.
        // Recursive version

        if(playersListElement.children[0].dataset.name != this.players[index].name) {
            this._shiftPlayers(index); 
        }
        nameBadge.style.backgroundColor = this.players[index].color;
    }

    /**
     * Animate shifting players around until correct player is on top. Recursive
     * @param {HTMLElement} from 
     * @param {HTMLElement} to 
     */
    _shiftPlayers(index) {
        const playersListElement = document.querySelector('#players');
        // Animate all players shifting
        for(let playerIndex = 1; playerIndex < this.players.length; playerIndex++) {
            let from = playersListElement.children[playerIndex];
            let to = playersListElement.children[playerIndex-1]; // shift it up
            flyToElement(from, to);
        }
        flyToElement(playersListElement.firstElementChild, playersListElement.lastElementChild, 1.2).onfinish = () => {
            //shift all divs up one.
            let newLast = playersListElement.children[0];
            playersListElement.removeChild(newLast);
            playersListElement.insertAdjacentElement('beforeend', newLast);
            if(playersListElement.children[0].dataset.name != this.players[index].name) { // If top player isn't correct, do it again
                this._shiftPlayers(index);
            }
        }
    }

    async showPlayerSelect() {
        // Get the components
        /** @type { HTMLTemplateElement} */
        const playerPaneTemplate = document.querySelector('#player-pane');
        
        /** @type {HTMLElement} */
        const newModal = getTemplateInstance('playerSelectModal');

        // Add the player dropdown items
        const playerDataList = newModal.querySelector('#player-names');

        /** @type {Array<Player>} */
        const savedPlayers = await this.gameData.getPlayers();

        for(let savedPlayer of savedPlayers) {
            console.log(savedPlayer.name);
            /** @type {HTMLOptionElement} */
            let newOption = document.createElement('option');
            console.log(newOption);
            newOption.innerHTML = savedPlayer.name;
            newOption.value = savedPlayer.name;
            playerDataList.insertAdjacentElement('beforeend', newOption);
        }
        
        const playerList = newModal.querySelector('#playerList');
        //this.addPlayerSelectPane(playerList);

        // Add player event handler
        newModal.querySelector('#addPlayerButton').addEventListener('click', (button) => {
            
            document.querySelector("#playButton").disabled = false;
            const newPlayer = new Player({
              name: `blank${this.players.length}`,
              color: "red",
              avatar: "car",
              highScore: 0,
            });
            this.players.push(newPlayer);
            this.addPlayerSelectPane(playerList, newPlayer); // newPlayer needed to update player info
              
        })
        // Play button even handler
        newModal.querySelector('#playButton').addEventListener('click', () => {
            console.log("---PLAY---")
            newModal.remove();
            this.round = 1;
            this.runGame();
        })
        
        document.querySelector('body').insertAdjacentElement('afterbegin', newModal);
    }

    async addPlayerSelectPane(playerList, playerInstance) {
        // Get the avatars and colors list from the JSON
        const avatars = await this.gameData.getAvatars();
        const colors = await this.gameData.getColors();
        const newPane = document.querySelector('#player-pane').content.cloneNode(true).childNodes[1];
        const nameInput = newPane.querySelector('#name-input');
        const avatarSelect = newPane.querySelector('#avatar-select');
        const avatarDrop = avatarSelect.querySelector('.dropdown');
        const colorSelect = newPane.querySelector('#color-select');
        const colorDrop = colorSelect.querySelector('.dropdown');

        this.currentScores.push(0);

        // Update the player name when it's changed.
        nameInput.addEventListener('input', () => {
            playerInstance.name = nameInput.value;

        });

        // Add the default avatar
        const newDefault = document.createElement('div');
        const newDefaultImg = document.createElement('img')
        newDefault.id = 'select-text';
        newDefaultImg.classList.add('avatar-image');
        playerInstance.avatar = avatars[0].name;
        playerInstance.color = colors[0].color;
        newDefaultImg.src =`./images/avatars/${avatars[0].file}`;
        newDefault.insertAdjacentElement('afterbegin', newDefaultImg);
        avatarSelect.querySelector('.select-selected').insertAdjacentElement('afterbegin', newDefault);

        // Feed the avatars into the dropdown
        for(let avatar of avatars) {
            let newOption = document.createElement('div');
            newOption.classList.add('dropdown-option');
            
            let newImg = document.createElement('img');
            newImg.src = `./images/avatars/${avatar.file}`;
            newImg.classList.add('avatar-image');
            // Put it together
            newOption.insertAdjacentElement('afterbegin', newImg);
            avatarDrop.insertAdjacentElement('afterbegin', newOption);
            // Add a listener
            newOption.addEventListener("click", () => {
              clickOption(newOption, avatar.name);
              playerInstance.avatar = avatar.name;
            });
        }

        // Feed the colors into the dropdown
        for(let color of colors) {
            let newOption = document.createElement('div');
            newOption.classList.add('dropdown-option');
            
            let newSwatch = document.createElement('div');
            newSwatch.innerHTML = `${color.name}`;
            newSwatch.style.backgroundColor = color.color;
            newSwatch.classList.add('swatch');
            // Put it together
            newOption.insertAdjacentElement('afterbegin', newSwatch);
            colorDrop.insertAdjacentElement('afterbegin', newOption);
            // Add a listener
            newOption.addEventListener("click", () => {
              clickOption(newOption, color.name);
              playerInstance.color = color.color;
            });
        }
        // Put the new pane in place
        playerList.insertAdjacentElement('beforeend', newPane);
    }

    async populateCategories(categories) {
        console.log(categories);
        const categoriesElement = document.getElementById('categories');
        for(let category of categories.trivia_categories) {
            let optionElement = document.createElement('option');
            optionElement.innerText = category.name;
            optionElement.value = category.id;
            categoriesElement.insertAdjacentElement('beforeend', optionElement);
        }
    }

    /**
     * Load the question onto the page and memory
     * @param {Array<object} question 
     */
    async populateQuestion(question) {

        console.log(question);
        const questionElement = document.getElementById('question');
        
        const text = questionElement.querySelector('#question_text');
        //console.log(text);
        text.innerHTML = question.results[0].question;

        /** @type Array<string> */
        this.answers = question.results[0].incorrect_answers;
        this.correct = question.results[0].correct_answer;
        this.correctIndex = Math.floor(Math.random() * 3);
        console.log(`${this.correctIndex}: ${this.correct}`);

        this.answers.splice(this.correctIndex, 0, this.correct);

        for(let index = 0; index < this.answers.length; index++) {
            const answerButton = document.createElement('input');
            answerButton.type = 'button';
            answerButton.classList.add('answerOption');
            answerButton.value = decodeEntities(this.answers[index]);
            questionElement.insertAdjacentElement('beforeend', answerButton);
            answerButton.addEventListener('click', () => this.answerButtonHandler(index));
        }
    }

    async answerButtonHandler(answerIndex) {
        console.log(`You pushed button ${answerIndex} with a value of ${this.answers[answerIndex]}`);
        // Display a message for correct answers
        if(answerIndex == this.correctIndex) {
            // console.log(`CORRECT!`);
            const correctModal = getTemplateInstance('correctMessage');
            correctModal.querySelector('#winnerName').innerHTML = this.players[this.currentPlayer].name;
            correctModal.querySelector('#scoredPoints').innerHTML = this.questionValue;
            correctModal.querySelector('#okButton').addEventListener('click', () => {
                correctModal.remove();
            })
            document.querySelector('body').insertAdjacentElement('afterbegin', correctModal);
            this.currentScores[this.currentPlayer] += this.questionValue;
        }
        // Display an answer for incorrect answers
        else {
            // Display wrong answer message
            const incorrectModal = getTemplateInstance('incorrectMessage');
            incorrectModal.querySelector('#correctAnswer').innerHTML = this.correct;
            incorrectModal.querySelector('#okButton').addEventListener('click', () => {
                incorrectModal.remove();
            })
            document.querySelector('body').insertAdjacentElement('afterbegin', incorrectModal);
        }
        //this.resetPlayArea();
        this.nextPlayer();
    }
}

