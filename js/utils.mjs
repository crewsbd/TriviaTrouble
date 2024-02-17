/**
 * Decodes the HTML entities in a string using built in functionality.
 * @param {string} htmlString 
 * @returns string
 */
export function decodeEntities(htmlString) {
    let temp = document.createElement('div');
    temp.innerHTML = htmlString;
    return temp.innerText;
}

/**
 * 
 * @param {HTMLElement} selectElement 
 */
export function clickSelect(clickedElement) {
    clickedElement.parentElement.classList.toggle('clicked');
    console.log(`Clicked ${clickedElement.innerText}`);
    // selectElement.classList.toggle('clicked')  // Display the select box
}

/**
 * 
 * @param {HTMLElement} optionElement 
 * @param {string} value 
 */
export function clickOption(optionElement, value) {
    console.log(optionElement);
    const selectElement = optionElement.parentElement.parentElement;
    console.log(selectElement);
    selectElement.dataset.value = value; // Can't remember why I wanted this
    const clickableElement = selectElement.querySelector('.select-selected');
    console.log(optionElement.innerHTML);

    clickableElement.querySelector('#select-text').innerHTML = optionElement.innerHTML;
    //clickableElement.innerHTML = value; // Put the new selection in
    clickSelect(clickableElement); // Close the select
}