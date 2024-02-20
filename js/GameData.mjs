import {Player} from './Player.mjs';

/**
 * A class to interface with the triva api
 */
export class GameData {
  /**
   * Constructor
   */
  constructor() {
    this.apiURL = "https://opentdb.com";
    this._init();
  }

  getGameState() {
    const stateString = localStorage.getItem('gameState');
    if(stateString) {
      return JSON.parse(stateString);
    }
    else {
      return null;
    }
  }

  saveGameState(gameState) {
    localStorage.setItem('gameState', JSON.stringify(gameState));
  }

  /**
   * Returns a triva question data object
   * @param {String} difficulty
   * @param {number} category
   * @returns Array<object>
   */
  async getQuestion(difficulty, category) {
    let queryURL = '';
    console.log(await this.getSetting('dev'));
    if(await this.getSetting('dev')) {
      queryURL = 'json/test-question.json';
    }
    else {
      queryURL = `${this.apiURL}/api.php?category=${category}&difficulty=${difficulty}&amount=1&type=multiple`;
    }
    //console.log(queryURL);
    const result = await fetch(queryURL);
    const data = await result.json();

    return data;
  }
  async getCategories() {
    let queryURL = '';
    console.log(await this.getSetting('dev'));
    if(await this.getSetting('dev')) {
      queryURL = 'json/test-categories.json';
    }
    else {
      queryURL = `${this.apiURL}/api_category.php`;
    }
    const result = await fetch(queryURL);
    // console.log(result);
    const data = await result.json();
    // console.log(data);
    return data;
  }

  async resetToken() {
    await fetch(
      `${this.apiURL}/api_token.php?command=reset&token=${this.token}`
    );
  }

  /**
   * 
   * @returns {Array<Player>}
   */
  async getPlayers() {
    /** @type {string} */
    const players = localStorage.getItem("players");
    if (players) {
      /** @type {Array<Object>} */
      const playerArray = JSON.parse(players);
      return playerArray.map((player) => new Player(player));
      //return playerArray; // Returns
    } else {
      localStorage.setItem("players", []);
      return [];
    }
  }

  /**
   *
   * @param {Player} player
   */
  async savePlayer(player) {
    /**@type {Array<Player>} */
    const players = await this.getPlayers();
    const index = players.findIndex((item) => {
      if (item.name == player.name) {
        return true;
      }
      return false;
    });

    if (index > -1) {
      players[index] = player;
    } else {
      players.push(player);
    }
    console.log(players);
    localStorage.setItem("players", JSON.stringify(players));
  }

  async getAvatars() {
    
    const result = await fetch('json/avatars.json');
    if(result.ok) {
      const json = await result.json();
      return json;
    }
    else {
      return null;
    }
  }

  async getColors() {
    
    const result = await fetch('json/colors.json');
    if(result.ok) {
      const json = await result.json();
      return json;
    }
    else {
      return null;
    }
  }

  async getSetting(key) {
    console.log('GET SETTING');
    const settings = await fetch('json/settings.json');
    console.log(settings);
    if(settings.ok) {
      const json = await settings.json();
      console.log(json);
      if(key in json) {
        console.log('Key is present');
        console.log(json[key]);
        return json[key];
      }
    }
    return null;
  }


  async _init() {
    console.log("init");
    if (!this._tokenValid()) {
      this._getNewToken();
    }
  }

  _getToken() {
    if (!this._tokenValid()) {
      getNewToken();
    }
    return this.token;
  }

  _updateTokenExpiration() {
    const today = new Date();
    const expires = new Date(today + this._hour(6));
    localStorage.setItem("tokenExpires", expires.toISOString());
  }
  async _getNewToken() {
    const result = await fetch(`${this.apiURL}/api_token.php?command=request`);
    const json = await result.json();
    this.token = json.token;
    localStorage.setItem("token", this.token);
    const expires = new Date() + this._hour(6);
    console.log(expires);

    this._updateTokenExpiration();
  }

  _tokenValid() {
    const token = localStorage.getItem("tokenExpires");
    if (token) {
      const tokenDate = new Date(token);
      const todayDate = new Date();
      const expireDate = new Date(todayDate.getTime() + this._hour(6));
      //console.log(`${tokenDate}\n${todayDate}\n${expireDate}`);
      if (expireDate > tokenDate) {
        return true;
      }
    }
    return false;
  }

  _hour(hours) {
    return hours * 60 * 60 * 1000;
  }
}
