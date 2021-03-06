/**
 * Wait for the given element to be checked, enabled, selected, visible, contain
 * a text, contain a value or to exist
 * @param  {String}   elem                     Element selector
 * @param  {String}   ms                       Wait duration (optional)
 * @param  {String}   falseCase                Check for opposite state
 * @param  {String}   state                    State to check for (default
 *                                             existence)
 */
const waitForContent = (element, ms, getWhat, falseCase) => {
    try {
        return browser.waitUntil(
            // getText, getValue
            () => { return $(element)[getWhat]().length > 0 == !falseCase },
            {
                timeout: ms,
                timeoutMsg: `$(${element}).${getWhat}().length > 0 == ${!falseCase} timeout`
            }
        );
    } catch(e){
        return false;
    }
}

const waitForCondition = (element, ms, isWhat, falseCase, element2) => {
    // isClickable, isDisplayed, isDisplayedInViewPort, isEnabled, isExisting, isFocused, isSelected,
    // isEqual(with element2)
    try {
        return browser.waitUntil(
            () => { return $(element)[isWhat](element2) == !falseCase },
            {
                timeout: ms,
                timeoutMsg: `$(${element}).${isWhat}(${element2}) == ${!falseCase} timeout`
            }
        );    
    } catch(e) {
        return false;
    }
}

const parseExpectedText = require('../common/parseExpectedText');

module.exports =
(elem, ms, falseCase, state) => {
    /**
     * Parsed element selector
     * @type {String}
     */
    const myElem = (typeof(elem) == 'object') ? elem.selector: (typeof(elem) == 'string') ? parseExpectedText(elem) : 'bogus element';
    
    /**
     * Maximum number of milliseconds to wait, default 3000
     * @type {Int}
     */
    const intMs = parseInt(ms, 10) || 3000;

    /**
     * Maximum number of milliseconds to wait, default 3000
     * @type {String}
     */
    var myState = state || 'existing';

    try {
        const existOption = {timeout: intMs, reverse: !!falseCase};
        $(myElem).waitForExist(existOption);
    } catch(e) {/*no-op*/}

    if (['existing', 'enabled', 'displayed', 'clickable'].includes(myState)) {
        // ready to call conditions;
        myState = (myState.charAt(0).toUpperCase() + myState.slice(1)).replace('Existing', 'Exist');
        const waitForCommand = `waitFor${myState}`;
        const option = {
            timeout: intMs,
            reverse: !!falseCase,
            timeoutMsg: `${myElem}.$waitFor${myState} == ${!falseCase} timeout`
        }
        if ($(myElem).isExisting()) $(myElem)[waitForCommand](option);
    } else if (myState.includes('containing')) { // 'containing a text', 'containing a value'
        if (myState.includes('value')) myState = 'getValue';
        if (myState.includes('text')) myState = 'getText';
        if ($(myElem).isExisting()) waitForContent(myElem, intMs, myState, !!falseCase);
    } else {
        // convert conditions
        var checkAction = `is${myState.charAt(0).toUpperCase()}${myState.slice(1)}`;
        if (checkAction == 'isVisible') checkAction = 'isDisplayedInViewport';
        if (checkAction == 'isChecked') checkAction = 'isSelected';
        if ($(myElem).isExisting()) waitForCondition(myElem, intMs, checkAction, !!falseCase);
    }
};
