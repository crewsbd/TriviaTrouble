export class Player {
    constructor(JSONobject) {
        this.name = JSONobject.name;
        this.color = JSONobject.color;
        this.avatar = JSONobject.avatar;
        this.highScore = JSONobject.highScore;
    }
    load(name) {
        // Get name from local storage
        let data = localStorage.getItem(`playerData`);
        let playersList = JSON.parse(data);
    }
    save() {
        let data = localStorage.getItem('playerData');
        /**@type {Array<object>} */
        let playerList = JSON.parse(data);
        playerList.push(this)
        localStorage.setItem(JSON.stringify(playerList));
    }

}