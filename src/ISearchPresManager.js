/* eslint-disable jsdoc/require-returns-check */
//An interface's method stubs don't have body's to return anything from

import * as d3 from "d3";

/**
 * Gets called when a user selects a result
 *
 * @callback ISearchPresManager~userSelectedResultCb
 * @param {string} resultID- The ID of the result selected
 * (same as the id used as the key in {@link BaseSearchComponent#liveResults})
 * @returns {void}
 */

/**
 * An interface for PresManager classes which serve to manage the presentation of subclasses of {@link BaseSearchComponent}
 * including displaying results and gathering user-inputted query parameters
 *
 * @interface
 */
class ISearchPresManager {
    /**
     *
     * @param {ISearchPresManager~userSelectedResultCb} userSelectedResultCb - {@link userSelectedResultCb}
     * @param {d3.Selection} viewportSel - An element whose screen-space could be populated with new UI elements
     * @param {d3.Selection} containerSel - The primary element that displaying results for this (sub)search is intended for.
     * May be the same as viewportSel if this for a top-level search.
     * @param {function()} updateQueryResults - {@link BaseSearchComponent.updateQueryResults}
     */
    constructor(userSelectedResultCb, viewportSel, containerSel, updateQueryResults) {}

    /**
     * Open (so it is visible to the user) the presentation for associated search, in a default manner.
     * All pieces of presentation should be open-able from whatever presentation is opened by default here.
     * (e.g. an advanced search pane may be hidden by default but can be opened via a button on a simple search pane
     * which is opened by default).
     *
     * @returns {void}
     */
    openDisplay() {}

    /**
     * Get all user-inputted query parameters for the associated search. To be used by {@link BaseSearchComponent.gatherQueryParameters}.
     *
     * @returns {*}
     */
    getAllUserQueryParams() {}

    /**
     * Enable or disable the all user input relating to query parameters
     *
     * @param {boolean} enabled
     */
    toggleAllQueryInput(enabled) {}

    /**
     * Display the given result
     *
     * @param {*} result
     * @returns {void}
     */
    addResultToDisplay(result) {}

    /**
     * Clear all results from the display (should be called for new searches)
     *
     * @returns {void}
     */
    clearResultsDisplay() {}

    /**
     * Destroys all UI components (removes them from DOM. but it may not delete components attached to that piece of DOM)
     *
     */
    destroy() {}
}

export default ISearchPresManager;