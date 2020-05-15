import * as d3 from "d3";
import {debounce} from "throttle-debounce";
import {textField} from "material-components-web";
const MDCTextField = textField.MDCTextField;
import ISearchPresManager from "./ISearchPresManager";

/**
 * A component for a "simple search" in which there is a text field for entering a query string
 * and results displayed below it.
 * The class is expected to be used by {@link BaseSearchComponent} (or a specific impl)
 * and also possibly {@link PaneComponent}.
 * The results are supplied externally with the {@link SimpleSearchPresComponent.addResult} method.
 * The query that produces these results may gather query parameters from other UI components
 * and is not limited to this one query string.
 */
class SimpleSearchPresComponent {
    /** @description Gets called if a user click on a given result entry
     * @type {PresentingQueryBasedSearchComp~selectDBEntryHandler} */
    selectResultFunc;
    /** @description The result list "ul" elem
     * @type {d3.Selection} */
    searchResultsListSel;
    /** @description The name of the field that should be accessed in a given result to ID it,
     * which is then used in the call the {@link SimpleSearchPresComponent#selectResultFunc}
     * @type {string} */
    resultIdField;
    /** @description The name of the field that should be accessed in a given result
     * to display its primary text in the presentation of that result
     * @type {string} */
    resultPrimaryTextField;
    /** @description The name of the field that should be accessed in a given result
     * to display its secondary text in the presentation of that result
     * @type {string} */
    resultSecondaryTextField;
    /** @description The value of the query string entered by the user.
     * It is the only user-inputted query parameter that can be set within this class.
     * @type {string} */
    userQueryString = "";
    /** @description TODO
     * @type {d3.Selection} */
    searchBarRegion;

    /**
     * @param {d3.Selection} containerSel - The element that is modified by this class
     * @param {ISearchPresManager~userSelectedResultCb} selectResultFunc -
     * A wrapped around {@link SimpleSearchPresComponent#selectResultFunc} with some additional functionality
     * @param {function()} updateQueryResultsFunc - {@link PresentingQueryBasedSearchComp.updateQueryResults}
     * @param {string} resultIdField - {@link SimpleSearchPresComponent#resultIdField}
     * @param {string} resultPrimaryTextField - {@link SimpleSearchPresComponent#resultPrimaryTextField}
     * @param {string} resultSecondaryTextField - {@link SimpleSearchPresComponent#resultSecondaryTextField}
     */
    constructor(
        containerSel, selectResultFunc, updateQueryResultsFunc,
        resultIdField, resultPrimaryTextField, resultSecondaryTextField)
    {
        this.selectResultFunc = selectResultFunc;
        this.resultIdField = resultIdField;
        this.resultPrimaryTextField = resultPrimaryTextField;
        this.resultSecondaryTextField = resultSecondaryTextField;

        this.searchBarRegion = containerSel.append("div");
        // .classed("pathway-search-pane-search-bar-region", true);
        const searchBarSel = this.searchBarRegion.append("div")
            .classed("mdc-text-field mdc-text-field--fullwidth", true);
        searchBarSel.append("input").classed("mdc-text-field__input", true)
            .on("input", debounce(1000, false, (a, b, [inputElem]) => {
                this.userQueryString = inputElem.value;
                updateQueryResultsFunc();
            }));
        searchBarSel.append("div").classed("mdc-line-ripple", true);
        const searchBarComp = new MDCTextField(searchBarSel.node());

        this.searchResultsListSel = containerSel.append("ul")
            .classed("mdc-list mdc-list--two-line search-pane-search-results-list", true);
    }

    clearAllResults() {
        this.searchResultsListSel.selectAll("*").remove();
    }

    addResult(queryResult) {
        const resultId = queryResult[this.resultIdField];
        const li = this.searchResultsListSel.append("li")
            .classed("mdc-list-item", true)
            // .attr("role", "menuitem")
            // .attr("tabindex", 0)
            .on("click", () => {
                this.selectResultFunc(resultId);
            })
            .on("contextmenu", () => {
                console.log("test");
            });
        const liSpanContainer = li.append("span")
            .classed("mdc-list-item__text", true);
        liSpanContainer.append("span")
            .classed("mdc-list-item__primary-text", true)
            .html(queryResult[this.resultPrimaryTextField]);
        liSpanContainer.append("span")
            .classed("mdc-list-item__secondary-text", true)
            .html(queryResult[this.resultSecondaryTextField]);
        // li.append("span").classed("mdc-list-item__meta", true).text("testText");
        li.append("div").classed("mdc-list-item__meta", true).text(resultId);
        // console.log(queryResult);
        return li;
    }

    /**
     * Enable or disable the user input in the search bar and convey this in the style
     *
     * @param {boolean} enabled
     */
    toggleAllowUserSearchBarInput(enabled) {
        this.searchBarRegion.classed("interaction-blocked", !enabled);
    }

    resetSearchBarInput() {

    }
}

export default SimpleSearchPresComponent;