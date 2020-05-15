import * as d3 from "d3";

import ISearchPresManager from "./ISearchPresManager";
import BaseSearchComponent from "./BaseSearchComponent";
import PaneComponent from "./PaneComponent";
import SimpleSearchPresComponent from "./SimpleSearchPresComponent";
import ReactomeRequestProcessor from "./ReactomeRequestProcessor";
import AdvancedSearchPresComponent from "./AdvancedSearchPresComponent";


/**
 * TODO sdsdfsdf
 *
 * @implements {ISearchPresManager}
 */
class QueryBasedSearchPresManager {

    /** @description TODO
     * @type {PaneComponent} */
    simpleQuerySearchPaneComponent;
    /** @description TODO
     * @type {SimpleSearchPresComponent} */
    simpleQuerySearchPresComponent;
    /** @description TODO
     * @type {PaneComponent} */
    advancedQuerySearchPaneComponent;
    /** @description TODO
     * @type {AdvancedSearchPresComponent} */
    advancedQuerySearchPresComponent;
    /** @description {@link PresentingQueryBasedSearchComp#facetInfo}
     * @type {PresentingQueryBasedSearchComp~facetInfoObj} */
    facetInfo;

    /**
     *
     * @param {ISearchPresManager~userSelectedResultCb} userSelectedResultCb - {@link ISearchPresManager#constructor}}
     * @param {d3.Selection} viewportSel - {@link ISearchPresManager#constructor}
     * @param {d3.Selection} containerSel - {@link ISearchPresManager#constructor}
     * @param {function()} updateQueryResults - {@link BaseSearchComponent.updateQueryResults}
     * @param {function(BaseSearchComponent~resultsConstraintModeEnum, BaseSearchComponent~subSearchEnum)} setResultsConstraintCb -
     * {@link BaseSearchComponent.setResultsConstraint}
     * @param {PresentingQueryBasedSearchComp~facetInfoObj} facetInfo - {@link QueryBasedSearchPresManager#facetInfo}
     * @param {Array<BaseSearchComponent~subSearchEnum>} validRelationalSearchTypes - {@link AdvancedSearchPresComponent.constructor}
     */
    constructor(userSelectedResultCb, viewportSel, containerSel, updateQueryResults,
                setResultsConstraintCb, facetInfo, validRelationalSearchTypes) {
        this.facetInfo = facetInfo;
        this.simpleQuerySearchPaneComponent = new PaneComponent(
            containerSel, "DB Entry Simple Search", "simple-search-pane");
        this.simpleQuerySearchPresComponent = new SimpleSearchPresComponent(
            this.simpleQuerySearchPaneComponent.getPaneBodySel(), userSelectedResultCb, updateQueryResults,
            "stId", "name", "stId"
        );

        this.simpleQuerySearchPaneComponent.addActionButton("open_in_new", () => {
            this.openAdvancedPaneIntent();
        });
        this.simpleQuerySearchPaneComponent.addActionButton("lock_open", (buttonElem) => {
            const shouldBePinned = !this.simpleQuerySearchPaneComponent.isPinnedQ;
            this.simpleQuerySearchPaneComponent.setPanePinned(shouldBePinned);
            buttonElem.text(this.simpleQuerySearchPaneComponent.isPinnedQ?"lock":"lock_open")
        });
        this.simpleQuerySearchPaneComponent.addActionButton("close", () => {
            this.closeSimplePaneIntent();
        });


        this.advancedQuerySearchPaneComponent = new PaneComponent(
            containerSel,"DB Entry Advanced Search", "advanced-search-pane");

        this.advancedQuerySearchPresComponent = new AdvancedSearchPresComponent(
            this.advancedQuerySearchPaneComponent.getPaneBodySel(), updateQueryResults, setResultsConstraintCb, validRelationalSearchTypes);



        this.advancedQuerySearchPaneComponent.addActionButton("lock_open", (buttonElem) => {
            const shouldBePinned = !this.advancedQuerySearchPaneComponent.isPinnedQ;
            this.advancedQuerySearchPaneComponent.setPanePinned(shouldBePinned);
            buttonElem.text(this.advancedQuerySearchPaneComponent.isPinnedQ?"lock":"lock_open")
        });
        this.advancedQuerySearchPaneComponent.addActionButton("close", () => {
            this.closeAdvancedPaneIntent();
        });
    }

    renderCollapsibleSectionsComp() {
        // console.log(this.facetInfo);
        this.advancedQuerySearchPresComponent.renderCollapsibleSectionsComp(this.facetInfo);
    }

    addResultToDisplay(DbEntryResult) {
        this.simpleQuerySearchPresComponent.addResult(DbEntryResult);
    }

    clearResultsDisplay() {
        this.simpleQuerySearchPresComponent.clearAllResults();
    }

    /**
     * TODO make sure this is the true extent
     *
     * @returns {{species: Set<string>, compartment: Set<string>, entryNameUserQueryString: string, type: Set<string>, keyword: Set<string>}}
     */
    getAllUserQueryParams() {
        const params =  {
            ...this.advancedQuerySearchPresComponent.getQueryParams(),
            entryNameUserQueryString: this.simpleQuerySearchPresComponent.userQueryString
        };
        /* May be superfluous given that the UI components reporting the type values are defaulted to the restricted set
        and then interactivity is prevented, but this adds security against DOM tampering*/
        if(!this.facetInfo.get("type").userSelectionAllowed) params["type"] = this.facetInfo.get("type").facetTypes
                .filter(({isDefaultQ}) => isDefaultQ).map(({value}) => value);
        // console.log(params);
        return params;
    }

    toggleAllQueryInput(enabled) {
        this.simpleQuerySearchPresComponent.toggleAllowUserSearchBarInput(enabled);
        // this.facetInfo.forEach((facetInfo) => facetInfo.custChipSetComp.toggleUserInteractionAllowed(enabled));
        this.facetInfo.forEach((facetInfo) => facetInfo.userSelectionAllowed = enabled);
        this.renderCollapsibleSectionsComp();
    }

    openDisplay() {
        this.openSimplePaneIntent();
    }

    closeSimplePaneIntent() {
        if (this.advancedQuerySearchPaneComponent.isOpenQ) return;
        this.simpleQuerySearchPaneComponent.closeIfUnpinned();
    }

    closeAdvancedPaneIntent() {
        this.advancedQuerySearchPaneComponent.closeIfUnpinned();
    }

    closeUnneededPanesIntent() {
        this.closeAdvancedPaneIntent();
        this.closeSimplePaneIntent();
    }

    closePanesForce() {
        this.advancedQuerySearchPaneComponent.close(true);
        this.advancedQuerySearchPaneComponent.destroy();
        this.simpleQuerySearchPaneComponent.close(true);
        this.simpleQuerySearchPaneComponent.destroy();
    }

    openSimplePaneIntent() {
        this.simpleQuerySearchPaneComponent.open();
    }

    openAdvancedPaneIntent() {
        this.advancedQuerySearchPaneComponent.open();
    }

    destroy() {
        this.closePanesForce();
    }
}

export default QueryBasedSearchPresManager;