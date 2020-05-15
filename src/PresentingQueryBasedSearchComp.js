import * as d3 from "d3";

import QueryBasedSearchPresManager from "./QueryBasedSearchPresManager";
import ReactomeRequestProcessor from "./ReactomeRequestProcessor";
import BaseSearchComponent, {
    getTypeFacetOptionsForSearch,
    resultsConstraintModeTypes,
    subSearchTypes,
    validRelationSubSearchTypes
} from "./BaseSearchComponent";
import NonPresentingPathwaysContainingEntrySearchComp from "./NonPresentingPathwaysContainingEntrySearchComp";
import NonPresentingEntitiesWithinComplexSearchComp from "./NonPresentingEntitiesWithinComplexSearchComp";

/**
 * TODO
 *
 * @callback PresentingQueryBasedSearchComp~entrySelectCb
 * @param {(number|string)} selectedResID
 */

/** @typedef PresentingQueryBasedSearchComp~facetInfoObj
 * @type {Map<string, {facetName: string, facetTypes: Array<{value: string, isDefaultQ: boolean, isInteractableQ: boolean}>, custChipSetComp: *, userSelectionAllowed: boolean}>}
 */

/**
 * TODO
 *
 * @augments BaseSearchComponent
 */
class PresentingQueryBasedSearchComp extends BaseSearchComponent {
    // /** @description Gets called when a result (resulting a DB entry) is selected in {@link SimpleSearchPresComponent}
    //  * @type {PresentingQueryBasedSearchComp~selectDBEntryHandler} */
    // #selectDBEntryHandler;

    /** @type {Map<(string|number), {stId: string}>}*/
    liveResults;
    /** @description A map of the promises returned by {@link BaseSearchComponent#userQueryParameters} of subsearches
     * @type {Map<(string|number), Promise<Map<(string|number), *>>>}*/
    subSearches = new Map();
    /** @type {{entryNameUserQueryString: string, type: Set<string>, species: Set<string>, keyword: Set<string>, compartment: Set<string>}} */
    userQueryParameters;
    /** @description {@link QueryBasedSearchPresManager}
     * @type {QueryBasedSearchPresManager}
     */
    presManager;
    /** @description Information about Reactome facets and their values in the context of being used for search filtering
     * @type {PresentingQueryBasedSearchComp~facetInfoObj} */
    facetInfo;
    /** @description Promise that returns when the class has finished its "initialization"
     * (the async code from the constructor is finished)
     * @type {Promise<void>}
     */
    init;
    /**
     * @description The search component that constraints that further containers the results of this search
     * @type {BaseSearchComponent} */
    relationSC;

    /**
     * TODO
     *
     * @param {ReactomeRequestProcessor} reactomeRequestProcessor - TODO
     * @param {d3.Selection} viewportSel - {@link BaseSearchComponent#viewportSel}
     * @param {d3.Selection} containerSel - {@link BaseSearchComponent#containerSel}
     * @param {BaseSearchComponent~subSearchEnum} subSearchType - {@link BaseSearchComponent#subSearchType}
     * @param {PresentingQueryBasedSearchComp~entrySelectCb} entrySelectCb - {@link PresentingQueryBasedSearchComp~entrySelectCb}
     */
    constructor(reactomeRequestProcessor, viewportSel, containerSel, subSearchType, entrySelectCb = () => {
    }) {
        super(reactomeRequestProcessor, viewportSel, containerSel, resultsConstraintModeTypes.OWN_RES_ONLY, subSearchType);

        this.init = PresentingQueryBasedSearchComp.getReactomeFacetOptions().then(async (facetInfo) => {
            this.facetInfo = facetInfo;
            this.presManager = new QueryBasedSearchPresManager(
                (selectedResID) => {
                    this.liveResults.forEach((res) => {
                        res["selected"] = res.stId === selectedResID
                    });
                    entrySelectCb(selectedResID);
                },
                this.viewportSel,
                this.viewportSel,
                this.updateQueryResults.bind(this),
                this.setResultsConstraint.bind(this),
                this.facetInfo,
                validRelationSubSearchTypes(this.subSearchType));

            await this.setResultsConstraint(resultsConstraintModeTypes.OWN_RES_ONLY, subSearchTypes.NONE);

            // this.presManager.renderCollapsibleSectionsComp();
        })
    }


    /**
     * TODO
     *
     * @returns {Promise<Map<(string|number), *>>}
     */
    async updateQueryResults() {
        this.presManager.clearResultsDisplay();
        return await super.updateQueryResults();
    }

    /** @returns {{entryNameUserQueryString: string, type: Set<string>, species: Set<string>, keyword: Set<string>, compartment: Set<string>}} */
    gatherQueryParameters() {
        return this.presManager.getAllUserQueryParams();
    }

    validateQueryParams() {
        return this.userQueryParameters.entryNameUserQueryString.length >= 3;
    }

    async makeQueryRequest() {
        // return this.reactomeRequestProcessor.searchForLLPathway(this.userQueryParameters.pathwayNameSearchString);
        return await ReactomeRequestProcessor.getEntrySearchResults(
            this.userQueryParameters.entryNameUserQueryString,
            this.userQueryParameters.species,
            this.userQueryParameters.type,
            this.userQueryParameters.compartment,
            this.userQueryParameters.keyword,
        )
    }

    queryResult2liveResForm() {
        const preliminaryResults = new Map();
        this.rawResults.results[0].entries.forEach((dbEntryRawResult) => {
            preliminaryResults.set(dbEntryRawResult.stId, dbEntryRawResult)
        });
        return preliminaryResults;
    }

    /**
     * TODO mention how promise returns when subSC from single entry finishes its life cycle and its liveRes populated
     *
     * @param DbEntryResult
     * @returns {Promise<void>}
     */
    async handlePreliminaryResult(DbEntryResult) {
        this.presManager.addResultToDisplay(DbEntryResult);

        const resultId = DbEntryResult.stId;
        let subSC;
        switch (this.subSearchType) {
            case(subSearchTypes.NONE):
                return;
            case(subSearchTypes.GET_PATHWAYS_CONTAINING_ENTRY):
                subSC = new NonPresentingPathwaysContainingEntrySearchComp(this.reactomeRequestProcessor, resultId);
                break;
            case(subSearchTypes.GET_ENTITIES_CONTAINED_BY_COMPLEX):
                subSC = new NonPresentingEntitiesWithinComplexSearchComp(this.reactomeRequestProcessor, resultId);
                break;
            default:
                throw Error("handlePreliminaryResult");
        }
        this.subSearches.set(resultId, await subSC.updateQueryResults());
    }

    async handlePreliminaryResults() {
        this.subSearches = new Map();
        super.handlePreliminaryResults();
    }

    /**
     * TODO
     *
     * @param {BaseSearchComponent~resultsConstraintModeEnum} resultsConstraintMode
     * @param {BaseSearchComponent~subSearchEnum} newSearchSubSearch
     */
    async setResultsConstraint(resultsConstraintMode, newSearchSubSearch) {

        if (this.relationSC) this.relationSC.destroy();
        this.resultsConstraintMode = resultsConstraintMode;
        const allowableTypeFacetOptions = getTypeFacetOptionsForSearch(this.subSearchType, newSearchSubSearch);
        const allowedQFunc = (typeOption) =>  !allowableTypeFacetOptions || allowableTypeFacetOptions.has(typeOption);
        if (this.resultsConstraintMode === resultsConstraintModeTypes.CONSTRAINT_RES_ONLY) {
            this.facetInfo.get("type").facetTypes.forEach(option => {option.isDefaultQ = allowedQFunc(option.value); option.isInteractableQ = false;});
            this.presManager.toggleAllQueryInput(false);
            // return;
        }
        else {
            this.facetInfo.get("type").facetTypes.forEach(option => {
                option.isDefaultQ = !!allowableTypeFacetOptions && allowedQFunc(option.value);
                option.isInteractableQ = allowedQFunc(option.value);
                this.presManager.toggleAllQueryInput(true);
            })
        }


        if (this.resultsConstraintMode === resultsConstraintModeTypes.OWN_RES_ONLY) {
            return;
        }
        // TODO

        this.presManager.renderCollapsibleSectionsComp();
        switch (newSearchSubSearch) {
            case(subSearchTypes.GET_ENTITIES_CONTAINED_BY_COMPLEX):
            case(subSearchTypes.GET_PATHWAYS_CONTAINING_ENTRY):
                this.relationSC = new PresentingQueryBasedSearchComp(this.reactomeRequestProcessor, this.viewportSel, this.viewportSel, newSearchSubSearch, this.updateQueryResults.bind(this));
                await this.relationSC.init;
                // TODO should change based on whether mode is to get all results or just sub results of one clicked
                this.getConstrainedRelationLiveResults = async () => {
                    const results = new Map();
                    await Promise.all(this.relationSC.subSearches.values()).then((liveResultsOfAllSubSearches) => liveResultsOfAllSubSearches.forEach((liveResults) => {
                        liveResults.forEach((value, key) => results.set(key, value))
                    }));
                    return results;
                };
                this.relationSC.presManager.renderCollapsibleSectionsComp();
                this.relationSC.presManager.openDisplay();
                break;
            case (subSearchTypes.NONE) :
                return;
            case (subSearchTypes.DUMMY):
            default:
                throw Error("setResultsConstraint");
        }
        this.updateQueryResults();
    }

    /**
     * TODO rename ??
     *
     * @returns {PresentingQueryBasedSearchComp~facetInfoObj}
     */
    static async getReactomeFacetOptions() {
        const mapFacet2Types = await ReactomeRequestProcessor.getMapFacet2Types();
        const facetInfo = new Map(["type", "species", "keyword", "compartment"].map((facetName) => {
            return [
                facetName,
                {
                    facetName,
                    facetTypes: mapFacet2Types.get(facetName)
                        .sort(({count: count1}, {count: count2}) => count2 > count1)
                        .map(({name, count}) => ({value: name, isDefaultQ: false, isInteractableQ: true})),
                    //TODO detlete the {} ?
                    custChipSetComp: {},
                    userSelectionAllowed: true
                }]
        }));

        const typeFacetInfo = facetInfo.get("type");
        typeFacetInfo.sectionTitle = "Type ( limited subset of Reactome DB Entry Types )";

        const speciesFacetInfo = facetInfo.get("species");
        speciesFacetInfo.sectionTitle = "Species";
        speciesFacetInfo.facetTypes.forEach((speciesOption) => {
            speciesOption.isDefaultQ = (speciesOption.value === "Homo sapiens")
        });

        const keywordFacetInfo = facetInfo.get("keyword");
        keywordFacetInfo.sectionTitle = "Keyword";

        const compartmentFacetInfo = facetInfo.get("compartment");
        compartmentFacetInfo.sectionTitle = "Compartment";

        return facetInfo;
    }

    destroy() {
        this.presManager.destroy();
    }
}

export default PresentingQueryBasedSearchComp;