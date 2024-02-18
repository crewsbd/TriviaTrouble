import { GameData } from './GameData.mjs';
import { Player } from './Player.mjs';
import { clickOption, clickSelect, decodeEntities } from './utils.mjs';

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
        if(gameState) { // A game state has been passed, load it
            this.gameData = gameData;
            /**@type {Array<Player>} */
            this.players = gameState.players;
            this.currentScores = gameState.currentScores;
            this.round = gameState.round;
            this.maxRounds = gameState.maxRounds;
            this.currentPlayer = gameState.currentPlayer;
            this.gameData.saveGameState(this);
            this.runGame()
        }
        else { // Open the new game modal to start a new game
            this.gameData = gameData;
            this.players = [];
            this.round = 0;
            this.maxRounds = 5;
            this.currentPlayer = 0;
            this.currentScores = [];
            // this.gameData.saveGameState(this);
            this.showPlayerSelect();
        }
    }
    _init() {

    } 

    runGame() {
        console.log('---RUN GAME---');
        //Start new game. Load and display players.
        const playerSection = document.querySelector('#players');
        for(let index = 0; index < this.players.length; index++) {
            let newPlayer = document.createElement('div');
            newPlayer.dataset.name = this.players[index].name; // Put the name in for later display
            newPlayer.id = `p${index}badge`;
            newPlayer.style.backgroundColor = `${this.players[index].color}`;
            let newImg = document.createElement('img');
            newImg.src = `./images/avatars/${this.players[index].avatar}.svg`;
            newImg.width = 40;
            newImg.height = 40;
            newPlayer.insertAdjacentElement('afterbegin', newImg);
            playerSection.insertAdjacentElement('beforeend', newPlayer);
        }

        // Stage the first player.
        this.stagePlayer(0);

        //Load categories
        // this.populateCategories(this.gameData.getCategories);
        this.populateCategories({
          trivia_categories: [
            {
              id: 9,
              name: "Test category1",
            },
            {
              id: 10,
              name: "Test category2",
            },
          ],
        });
        
        //Set up "load question" button
        const questionElement = document.querySelector('#question');
        const generateQuestionButton = document.createElement('input');
        const questionText = document.querySelector('#question_text');
        generateQuestionButton.value = "Generate Question";
        generateQuestionButton.type = 'button';
        generateQuestionButton.addEventListener('click', () => {
            console.log('GENERATE QUESTION');
            // Load the question

            // Show it
            questionText.classList.remove('hidden');
            // Delete self
            generateQuestionButton.remove();
        })
        questionElement.insertAdjacentElement('afterbegin', generateQuestionButton);


        //After this, the game should run itself with events.

        // Add handler for test next player. REmvoe in production
        document.querySelector('#test_next_player').addEventListener('click', () => {
            this.nextPlayer();
        })
    }

    endGame() {
        console.log('---END GAME---');
        // Display end game modal

        // Clear localStorage game data.

        // Run showPlayerSelect
    }
    nextPlayer() {
        this.currentPlayer = (this.currentPlayer+1) % this.players.length;
        this.stagePlayer(this.currentPlayer);
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
            this.flyToElement(from, to);
        }
        this.flyToElement(playersListElement.firstElementChild, playersListElement.lastElementChild, 1.2).onfinish = () => {
            //shift all divs up one.
            let newLast = playersListElement.children[0];
            playersListElement.removeChild(newLast);
            playersListElement.insertAdjacentElement('beforeend', newLast);
            if(playersListElement.children[0].dataset.name != this.players[index].name) { // If top player isn't correct, do it again
                this._shiftPlayers(index);
            }
        }
    }


    showPlayerSelect() {
        // Get the components
        /** @type { HTMLTemplateElement} */
        const modalTemplate = document.querySelector('#playerSelectModal');
        const playerPaneTemplate = document.querySelector('#player-pane');
        
        /** @type {HTMLElement} */
        const newModal = modalTemplate.content.cloneNode(true).childNodes[1];
        
        const playerList = newModal.querySelector('#playerList');
        //this.addPlayerSelectPane(playerList);

        // Add player event handler
        newModal.querySelector('#addPlayerButton').addEventListener('click', (button) => {
            
            document.querySelector("#playButton").disabled = false;
            const newPlayer = new Player({
              name: "blank",
              color: "red",
              avatar: "cat",
              highScore: 0,
            });
            this.players.push(newPlayer);
            this.addPlayerSelectPane(playerList, newPlayer); // newPlayer needed to update player info
              
        })
        // Play button even handler
        newModal.querySelector('#playButton').addEventListener('click', () => {
            console.log("---PLAY---")
            newModal.remove();
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

        // Update the player name when it's changed.
        nameInput.addEventListener('input', () => {
            playerInstance.name = nameInput.value;

        });

        // Add the default avatar
        const newDefault = document.createElement('div');
        const newDefaultImg = document.createElement('img')
        newDefault.id = 'select-text';
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

        // for(let answer of this.answers) {
            const answerButton = document.createElement('input');
            answerButton.type = 'button';
            // answerButton.value = answer;
            answerButton.value = this.answers[index];
            questionElement.insertAdjacentElement('beforeend', answerButton);
            answerButton.addEventListener('click', () => this.answerButtonHandler(index));
        }
    }

    async answerButtonHandler(index) {
        console.log(`You pushed button ${index} with a value of ${this.answers[index]}`);
        if(this.answers[index] == this.correct) {
            console.log(`CORRECT!`);
        }
    }

    /**
     * Animate an element flying to another location
     * @param {HTMLElement} element 
     * @param {number} tx
     * @param {number} ty
     * @returns {Animation}
     */
    flyTo(element, tx, ty, scale = 1) {
        let ox = element.getBoundingClientRect().x;
        let oy = element.getBoundingClientRect().y;

        let dx = tx - ox; //Delta x,y
        let dy = ty - oy;

        return element.animate(
            [
                {
                    transform: `translate(0px, 0px) scale(1)`
                },
                {
                    transform: `translate(0px, 0px) scale(${scale})`,
                    boxShadow: '0 5px 15px #0005',
                    zIndex: `${scale * 10}`,
                    borderRadius: '1rem'
                },
                {
                    transform: `translate(${dx}px, ${dy}px) scale(${scale})`,
                    boxShadow: '0 5px 15px #0005',
                    zIndex: `${scale * 10}`,
                    borderRadius: '1rem'
                },
                {
                    transform: `translate(${dx}px, ${dy}px) scale(1)`,
                    borderRadius: '1rem'
                }
            ],
            {
                duration: 1000,
                easing: 'ease-in-out'
            } 
        )
    }

    /**
     * Animate an element flying to another element
     * @param {HTMLElement} element 
     * @param {HTMLElement} targetElement
     * @returns {Animation}
     */
    flyToElement(element, targetElement, scale=1) {
        let tx = targetElement.getBoundingClientRect().x
        let ty = targetElement.getBoundingClientRect().y

        return this.flyTo(element, tx, ty, scale);
    }
    
    
}

