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
  /**
   * Returns a triva question data object
   * @param {String} difficulty 
   * @param {number} category 
   * @returns Array<object>
   */
  async getQuestion(difficulty, category) {
    const queryURL = `${this.apiURL}/api.php?category=${category}&difficulty=${difficulty}&amount=1&type=multiple`;
    //console.log(queryURL);
    const result = await fetch(queryURL);
    const data = await result.json();
    
    return data;
  }
  async getCategories() {
    const queryURL = `${this.apiURL}/api_category.php`;
    const result = await fetch(queryURL);
    // console.log(result);
    const data = await result.json();
    // console.log(data);
    return data;
  }
  async resetToken() {
    await fetch(`${this.apiURL}/api_token.php?command=reset&token=${this.token}`);
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
