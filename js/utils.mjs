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

    // selectElement.classList.toggle('clicked')  // Display the select box
}

/**
 * 
 * @param {HTMLElement} optionElement 
 * @param {string} value 
 */
export function clickOption(optionElement, value) {

    const selectElement = optionElement.parentElement.parentElement;

    selectElement.dataset.value = value; // Can't remember why I wanted this
    const clickableElement = selectElement.querySelector('.select-selected');


    clickableElement.querySelector('#select-text').innerHTML = optionElement.innerHTML;
    //clickableElement.innerHTML = value; // Put the new selection in
    clickSelect(clickableElement); // Close the select
}

export function getTemplateInstance(id) {
    /**@type {HTMLTemplateElement} */
    const template = document.querySelector(`#${id}`);
    return template.content.childNodes[1].cloneNode(true);
}

/**
     * Animate an element flying to another location
     * @param {HTMLElement} element 
     * @param {number} tx
     * @param {number} ty
     * @returns {Animation}
     */
export function flyTo(element, tx, ty, scale = 1) {
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
export function flyToElement(element, targetElement, scale=1) {
    let tx = targetElement.getBoundingClientRect().x
    let ty = targetElement.getBoundingClientRect().y

    return flyTo(element, tx, ty, scale);
}

