/* eslint-disable jsdoc/require-returns-check */
//An base class's method stubs don't have body's to return anything from

import * as d3 from "d3";

import ReactomeRequestProcessor from "./ReactomeRequestProcessor";

/** @typedef {{key: string, name: string, description: string}} BaseSearchComponent~resultsConstraintModeEnum */
/** @enum {BaseSearchComponent~resultsConstraintModeEnum} */
const resultsConstraintModeTypes = {
    OWN_RES_ONLY: {description: "Only display results from the current search", name: "Current Search Only"},
    CONSTRAINT_RES_ONLY: {description: "Only display results from the relational search created off of the current search", name: "Relational Search Only"},
    INTERSECTION: {description: "Display results from the relational search and further filter them based on the current search", name: "Intersection"},
};
Object.entries(resultsConstraintModeTypes).forEach(([key, val]) => {val.key = key});

const facetTypeAll = new Set(["Protein", "Complex", "Reaction", "Set", "Interactor", "Genes and Transcripts", "Chemical Compound", "Polymer", "DNA Sequence", "OtherEntity", "RNA Sequence",
    "ChemicalDrug", "ProteinDrug", "Pathway", "Icon", "Person"]);

/** @typedef {{key: string, name: string, description: string, facetTypeInputs: Set<string>, facetTypeOutputs: Set<string>}} BaseSearchComponent~subSearchEnum */
/** @enum {BaseSearchComponent~subSearchEnum} */
const subSearchTypes = {
    GET_PATHWAYS_CONTAINING_ENTRY: {
        name: "Pathways Containing Given Entry(ies)",
        description: "TODO Desc",
        // facetTypeInputs: new Set(["Reaction", "Complex"]),
        facetTypeInputs:  new Set([...facetTypeAll].filter((facetTypeOption) => !new Set(["Pathway", "Icon", "Person", "Interactor"]).has(facetTypeOption))),
        facetTypeOutputs: new Set(["Pathway"])
    },
    GET_ENTITIES_CONTAINED_BY_COMPLEX: {
        name: "Entities Contained By Complex(es)",
        description: "TODO Desc",
        facetTypeInputs: new Set(["Complex"]),
        facetTypeOutputs: new Set([...facetTypeAll].filter((facetTypeOption) => !new Set(["Pathway", "Icon", "Person"]).has(facetTypeOption)))
    },
    DUMMY: {name: "Dummy Name", description: "TODO Desc"},
    NONE: {name: "None", description: "TODO Desc"},
};
Object.entries(subSearchTypes).forEach(([key, val]) => {val.key = key});

//
// // TODO add all allowed types
// /** @type {Map<BaseSearchComponent~subSearchEnum, {inputs: Set<string>, outputs: Set<string>}>} */
// const subSearchTypeFacetMapping = new Map([
//     [
//         subSearchTypes.GET_PATHWAYS_CONTAINING_ENTRY,
//         {
//             facetTypeInputs: new Set(["Reaction", "Complex"]),
//             outputs: new Set(["Pathway"])
//         }
//     ],
//     [
//         subSearchTypes.GET_ENTITIES_CONTAINED_BY_COMPLEX,
//         {
//             facetTypeInputs: new Set(["Complex"]),
//             outputs: new Set([
//                 "Protein", "Complex", "Reaction", "Set", "Interactor", "Genes and Transcripts", "Chemical Compound", "Polymer", "DNA Sequence", "OtherEntity", "RNA Sequence",
//             "ChemicalDrug", "ProteinDrug"])
//         }
//     ]
// ]);

/**
 * Maps a pair of {@link subSearchTypes} to the set of type facet options that are
 * both in the inputs of the first and the outputs of the second.
 *
 * @type {Map<Array<BaseSearchComponent~subSearchEnum>, Set<string>>}
 */
// const subSearchIOTypeFacetMapping = new Map();
// subSearchTypeFacetMapping.forEach(({inputs: inputs1, outputs: outputs1}, subSearchType1) => {
//     subSearchTypeFacetMapping.forEach(({inputs: inputs2, outputs: outputs2}, subSearchType2) => {
//         subSearchIOTypeFacetMapping.set([subSearchType1, subSearchType2], new Set([...inputs1].filter(x => outputs2.has(x))));
//     });
// });

// /**
//  * Gets TODO
//  *
//  * @returns {Set<*>}
//  */
// const validRelationSubSearchTypes = (subSearchType) => {
//     if (subSearchType === subSearchTypes.NONE)
//         return new Set(Object.keys(subSearchTypes)
//             .filter((subSearchType) => !(new Set([subSearchTypes.NONE, subSearchTypes.DUMMY]).has(subSearchType))));
//     const validTypeOptions = new Set();
//
//     const subSearchInputs = subSearchTypeFacetMapping.get(subSearchType).inputs;
//     subSearchTypeFacetMapping.forEach(({inputs, outputs}, searchType) => {
//         if ([...outputs].some((typeOption) => subSearchInputs.has(typeOption))) validTypeOptions.add(searchType);
//     });
//     return validTypeOptions;
// };

/**
 * Gets an array of valid {@link subSearchTypes} that could be used as a relational constraint for a given {@link subSearchTypes}
 *
 * @returns {Array<BaseSearchComponent~subSearchEnum>}
 */
const validRelationSubSearchTypes = (subSearchType) => {
    /** @type {Array<BaseSearchComponent~subSearchEnum>} */
    const validRelationalSubSearchTypes = [];

    const subSearchTypeFacetInputs = subSearchType.facetTypeInputs;
    validRelationalSubSearchTypes.push(subSearchTypes.NONE);
    Object.values(subSearchTypes).forEach(
        /** @type {BaseSearchComponent~subSearchEnum} */
        (val) => {
        const facetTypeOutputs = val.facetTypeOutputs;
        if(subSearchType === subSearchTypes.NONE) {
            if (new Set([subSearchTypes.NONE, subSearchTypes.DUMMY]).has(val)) return;
        }
        else {
            if (!facetTypeOutputs) return;
            if (![...facetTypeOutputs].some((relationalFacetTypeOutput) => subSearchTypeFacetInputs.has(relationalFacetTypeOutput))) return;
        }
        validRelationalSubSearchTypes.push(val);
    });
    return validRelationalSubSearchTypes;
};

/**
 * TODO
 * Returns a set of options for the potentially selectable Reactome type facets of a search, given that the search
 * must have results must be both valid to supply to its {@link BaseSearchComponent#subSearchType} and have the same
 * type as the results returns from another related search that further constrains the results.
 *
 * @param {BaseSearchComponent~subSearchEnum} subSearchType
 * @param {BaseSearchComponent~subSearchEnum} relatedSubSearchType
 * @returns {?Set<string>} - The set of allowable options for type facet. Null if both are {@link subSearchTypes.NONE}
 */
const getTypeFacetOptionsForSearch = (subSearchType, relatedSubSearchType) => {
    const inputs = subSearchType.facetTypeInputs;
    // return subSearchTypeFacetMapping.get(relatedSubSearchType).outputs;
    const outputs = relatedSubSearchType.facetTypeOutputs;
    if (subSearchType === subSearchTypes.NONE) {
        if (relatedSubSearchType === subSearchTypes.NONE) return null;
        return outputs
    }
    else {
        if (relatedSubSearchType === subSearchTypes.NONE)
            return inputs
    }
    return new Set([...inputs].filter(input => outputs.has(input)));
};


/**
 * @classdesc An abstract base class for components (presentation and functionality) of multi-level search/query views.
 * Instances should be of implementations/sub-classes and many methods are intended to be overridden
 * A search not only involves displaying the results of a query, but making sub-searches for each result.
 * For description of this class's logic/intended-use @see
 * {@link BaseSearchComponent.updateQueryResults}, {@link BaseSearchComponent.handlePreliminaryResult},
 * and {@link BaseSearchComponent#liveResults}
 * <br> For example, a single-level search may involve creating multiple panes containing various forms
 * to produce a single query.
 * Alternatively, a 2-level search maybe involve just one pane is total in which the results of each sub-search
 * are displayed as a drop-down menu within the list element for each result of the first level
 */
class BaseSearchComponent {
    /** @see {@link ReactomeRequestProcessor}
     * @type {ReactomeRequestProcessor} */
    reactomeRequestProcessor;
    /** @description An element whose screen-space could be populated with new UI elements
     * @type {d3.Selection} */
    viewportSel;
    /** @description The primary element that displaying results for this (sub)search is intended for.
     * May be the same as {@link BaseSearchComponent#viewportSel} if this is a top-level search.
     * @type {d3.Selection} */
    containerSel;
    /** @description Object containing all parameters that a query request can draw from
     * @type {*} */
    userQueryParameters;
    /** @description The "raw"
     * (potentially after going through some processing by another class {@link ReactomeRequestProcessor})
     * response results of this search's query
     * @type {*} */
    rawResults;
    /** @description Maps from an ID to its corresponding result.
     * Contains not just the results of this query, but that of sub-searches in a tree-like structure.
     * A result that requires a sub-search will down pass its portion of this tree to a new instance (of subclass) of
     * {@link BaseSearchComponent} which may then be updated to contains more results or tree of results.
     * This object may be updated asynchronously as sub-searches are given their portion of this.
     * @type {Map<(string|number), *>} */
    liveResults;
    /** @description {@link BaseSearchComponent~resultsConstraintModeEnum} TODO
     * @type {BaseSearchComponent~resultsConstraintModeEnum} */
    resultsConstraintMode;
    /** @description A enum representing the of sub-search that this search is intended to perform. {@link BaseSearchComponent~subSearchEnum}.
     * @type {BaseSearchComponent~subSearchEnum}
     */
    subSearchType;


    /**
     * Intended to be overridden by subclass, but also called by subclass
     * It *MAY* instantiate UI components that allow users to specify query parameters and display results.
     * These components can do following:
     * <ul>
     *     <li> Provide methods to manage UI presentation logic (like opening and closing panes)
     *     <li> Provide access/methods to query parameters the user specifies via the UI
     *     <li> Provide methods to display given results
     * </ul>
     * These components *MAY* need to be constructed with the following arguments:
     * <ul>
     *     <li> {@link BaseSearchComponent#containerSel} and/or {@link BaseSearchComponent#viewportSel}
     *     <li> A callback function for when a result is clicked
     *     <li> {@link BaseSearchComponent.updateQueryResults} as a callback function
     *     <li> Information about how to interpret results in the layout of the UI
     * </ul>
     *
     * @param {ReactomeRequestProcessor} reactomeRequestProcessor - {@link BaseSearchComponent#reactomeRequestProcessor}
     * @param {d3.Selection} viewportSel - {@link BaseSearchComponent#viewportSel}
     * @param {d3.Selection} containerSel - {@link BaseSearchComponent#containerSel}
     // * @param {Map<(string|number), *>} liveResults - {@link BaseSearchComponent#liveResults}
     // * @param {*} constrainedRelationLiveResults - {@link BaseSearchComponent#constrainedRelationLiveResults}
     * @param {BaseSearchComponent~resultsConstraintModeEnum} resultsConstraintMode - {@link BaseSearchComponent#resultsConstraintMode}
     * @param {BaseSearchComponent~subSearchEnum} subSearchType - {@link subSearchType}
     *
     */
    constructor(reactomeRequestProcessor, viewportSel, containerSel,
                resultsConstraintMode= resultsConstraintModeTypes.OWN_RES_ONLY, subSearchType=subSearchTypes.NONE) {
        this.reactomeRequestProcessor = reactomeRequestProcessor;
        this.viewportSel = viewportSel;
        this.containerSel = containerSel;
        this.resultsConstraintMode = resultsConstraintMode;
        this.subSearchType = subSearchType;
    }

    /**
     * This is the main algorithm of functionality for this class and a subclass method overriding this method
     * should also call this rather than disturbing its functionality.
     * Returns promise that resolves to {@link BaseSearchComponent#liveResults}
     * TODO handling errors with invalid query params ?
     *
     * @returns {Promise<Map<(string|number), *>>} - See {@link BaseSearchComponent#liveResults}
     */
    async updateQueryResults() {
        if (this.resultsConstraintMode !== resultsConstraintModeTypes.CONSTRAINT_RES_ONLY) {
            this.userQueryParameters = this.gatherQueryParameters();
            if (!this.validateQueryParams()) return;
            this.rawResults = await this.makeQueryRequest();
        }
        this.liveResults = await this.getPreliminaryLiveResults();
        await this.handlePreliminaryResults();
        return this.liveResults;
    }


    /**
     * Gather query parameters that are
     * <br> user-entered in the UI components instantiated by the {@link BaseSearchComponent#constructor}
     * <br> and (if this is a sub-search) that are values stored in {@link BaseSearchComponent#liveResults}
     *
     * @returns {*}
     * @abstract
     */
    gatherQueryParameters () {}

    /**
     * Return whether or not query params are valid for initiating a new query request.
     * If not, it is also responsible for handling special presentation events now.
     * Only uses {@link BaseSearchComponent#userQueryParameters} and {@link BaseSearchComponent#liveResults}
     *
     * @returns {boolean}
     * @abstract
     */
    validateQueryParams() {}

    /**
     * Make a query request using {@link BaseSearchComponent#userQueryParameters} and {@link BaseSearchComponent#liveResults}
     * to generate a call to {@link BaseSearchComponent#reactomeRequestProcessor}
     * to return the raw request response
     *
     * @abstract
     */
    async makeQueryRequest () {}

    /**
     * Transform the request response into an array of response entries in a more usable (easily displayable) form.
     * May use {@link BaseSearchComponent#rawResults}, {@link BaseSearchComponent#userQueryParameters},
     * and {@link BaseSearchComponent#liveResults} to generate preliminary results before sub-searches
     *
     * @returns {Map<(string|number), *>}
     * @abstract
     */
    queryResult2liveResForm() {}

    // /**
    //  * Add a filtering function which get called in succession (orderless) during
    //  * {@link BaseSearchComponent.filterPreliminaryQueryResults}
    //  * TODO cant delete them but maybe null ??
    //  *
    //  * @param {Function} filterFunc - take in a given liveResult entry value as a parameter,
    //  * and returns a boolean as to whether it should stay (true) or be removed (false)
    //  */
    // addFilter(filterFunc) {
    //     this.filterFuncs.push(filterFunc);
    // }
    //
    // /**
    //  * Applies any added filters to the preliminary results. The removal of a result entry is performed with
    //  * {@link BaseSearchComponent#liveResults}.delete(unwantedKey);
    //  */
    // filterPreliminaryQueryResults() {
    //     this.filterFuncs.forEach((filterFunc) => {
    //         this.liveResults.forEach((pathwayResult, key) => {
    //             if (!filterFunc(pathwayResult)) this.liveResults.delete(key);
    //         })
    //     })
    // }


    /** TODO
     *
     * @returns {Promise<Map<(string|number), *>>}
     * */
    async getConstrainedRelationLiveResults () {}

    /**
     * TODO UPDATE FOR MODES
     * Can use {@link BaseSearchComponent.queryResult2liveResForm} and access to the liveResults of any new SC (but not sub-ones)
     * May be completely overridden (without super calls)
     *
     * @returns {Map<(string|number), *>}
     */
    async getPreliminaryLiveResults() {
        const constrainedRelationLiveResults = await this.getConstrainedRelationLiveResults();
        if(this.resultsConstraintMode === resultsConstraintModeTypes.CONSTRAINT_RES_ONLY) return constrainedRelationLiveResults;
        const ownResults = this.queryResult2liveResForm();
        if (this.resultsConstraintMode === resultsConstraintModeTypes.OWN_RES_ONLY) return ownResults;
        else if (this.resultsConstraintMode === resultsConstraintModeTypes.INTERSECTION) {
            const constraintResIds = new Set(constrainedRelationLiveResults.keys());
            Array.from(ownResults.keys()).forEach((ownResID) => {
                if(!constraintResIds.has(ownResID)) ownResults.delete(ownResID);
            });
            return ownResults;
        }
    }

    /**
     * Handle each response entry individually and do either
     * <li>
     * 1)Potentially start new sub-searches by constructing new instances (of subclasses) of this class for an individual preliminary result
     * using for arguments {@link BaseSearchComponent#reactomeRequestProcessor},
     * {@link BaseSearchComponent#viewportSel}, {@link BaseSearchComponent#containerSel}, and the argument "result"
     * (which, keep in mind,  is already part of the tree in {@link BaseSearchComponent#liveResults})
     * </li>
     * OR
     * <li>
     * 2)Perform presentation logic for this result either directly or with new result-displaying components
     * </li>
     * OR
     * <li>
     * a combination of the two in which presentation logic defines interactivity that
     * the updateQueryResults method in new class instances
     * or new class instances can trigger methods in this class that influence presentation
     * </li>
     *
     * @abstract
     */
    async handlePreliminaryResult(result) {}

    /**
     * TODO
     *
     */
    async handlePreliminaryResults() {
        const _this = this;
        const handleResultsPromises = Array.from(this.liveResults.values()).map((result) => _this.handlePreliminaryResult(result));
        await Promise.all(handleResultsPromises);
    }

    /**
     * Destroy
     *
     * @abstract
     */
    destroy() {}

}

export {resultsConstraintModeTypes, subSearchTypes, validRelationSubSearchTypes, getTypeFacetOptionsForSearch};
export default BaseSearchComponent;