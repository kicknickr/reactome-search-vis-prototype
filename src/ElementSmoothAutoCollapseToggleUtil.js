//TODO https://css-tricks.com/using-css-transitions-auto-dimensions/

const collapseSection = (element) => {
    // get the height of the element's inner content, regardless of its actual size
    const sectionHeight = element.scrollHeight;

    // temporarily disable all css transitions
    const elementTransition = element.style.transition;
    element.style.transition = '';

    // on the next frame (as soon as the previous style change has taken effect),
    // explicitly set the element's height to its current pixel height, so we
    // aren't transitioning out of 'auto'
    requestAnimationFrame(() => {
        element.style.height = sectionHeight + 'px';
        element.style.transition = elementTransition;

        // on the next frame (as soon as the previous style change has taken effect),
        // have the element transition to height: 0
        requestAnimationFrame(() => {element.style.height = 0 + 'px';});
    });

    // mark the section as "currently collapsed"
    element.setAttribute('data-collapsed', 'true');
};

const expandSection = (element) => {
    // get the height of the element's inner content, regardless of its actual size
    const sectionHeight = element.scrollHeight;

    // have the element transition to the height of its inner content
    element.style.height = sectionHeight + 'px';

    const transEndHandler = (e) => {
        // remove this event listener so it only gets triggered once
        element.removeEventListener('transitionend', transEndHandler);

        // remove "height" from the element's inline styles, so it can return to its initial value
        element.style.height = null;
    };

    // when the next css transition finishes (which should be the one we just triggered)
    element.addEventListener('transitionend', transEndHandler);

    // mark the section as "currently not collapsed"
    element.setAttribute('data-collapsed', 'false');
};

/**
 * TODO HEIGHT
 *
 * @param {HTMLElement} element - DOM element (not a {@link d3.Selection}) that is to be expanded or collapsed
 * @param {string} transitionStyleString - The string used for the css rule 'transition' for the duration of the TODO
 */
const toggleSectionExpansion = (element, transitionStyleString) => {

    // Terminate early if height is not null and other than 0px because this would mean that a transition is in progress
    if (element.style.height !== "0px" && !!element.style.height) return;
    element.style.overflow = "hidden";
    element.style.transition = transitionStyleString;

    const isCollapsed = element.getAttribute('data-collapsed') === 'true';

    if(isCollapsed) {
        expandSection(element);
        element.setAttribute('data-collapsed', 'false')
    } else {
        collapseSection(element);
    }
};

export {toggleSectionExpansion};