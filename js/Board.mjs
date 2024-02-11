export class Board {
    constructor() {

    }
    _init() {

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
        text.innerText = question.results[0].question;

        /** @type Array<string> */
        this.answers = question.results[0].incorrect_answers;
        this.correct = question.results[0].correct_answer;
        this.correctIndex = Math.floor(Math.random() * 3);
        console.log(`${this.correctIndex}: ${this.correct}`);

        this.answers.splice(this.correctIndex, 0, this.correct);

        for(let answer of this.answers) {
            const answerButton = document.createElement('input');
            answerButton.type = 'button';
            answerButton.value = answer;
            questionElement.insertAdjacentElement('beforeend', answerButton);
        }


    }
}