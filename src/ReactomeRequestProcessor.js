import Fuse from "fuse.js";

import ReactomeAPIQuerier from "./ReactomeAPIQuerier";
import RenderableNode from "./RenderableNode";

// /** @typedef {module:ReactomeAPIQuerier.rawPathwayLayout_} rawPathwayLayout_ */
// /** @typedef {module:ReactomeAPIQuerier.compartment_} compartment_ */
// /** @typedef {module:ReactomeAPIQuerier.edge_} edge_ */
// /** @typedef {module:ReactomeAPIQuerier.node_} node_ */
// /** @typedef {module:RenderableNode.RenderableNode} RenderableNode */

/** TODO
 *
 * @typedef Pathway
 *
 * @property {string} stId -
 * @property {string} name -
 * @property {boolean} diagram -
 * @property {string} type -
 * @property {string} species -
 */

/** @typedef diagObjImport_
 * An object representing all relevant data from any diagram object imported from
 * {@link ReactomeRequestProcessor.getPathwayDiagramLayout}.
 * It represents the diagram object in the imported diagram
 * and not necessarily the entry in the DB it corresponds to (if it even has one).
 * It sufficiently represents physical entities but reaction-like-events and misc links are subclass-typed.
 * @property {number} rawDiagramID - ID of the diagram object in the original LL pathway diagram it was imported from
 * @property {?string} displayName - Display name of the object in the imported diagram
 * @property {?number} reactomeId - Reactome dbID of the object's entry
 * @property {?string} rawSchemaClass - Object's entry's type according to the reactomeKB schema
 * {@link https://reactome.org/content/schema/} TODO enumerate
 * @property {string} rawRenderableClass - Object's value for the class that determines
 * how an object should be rendered in the imported diagram TODO enumerate
 * @property {number} initialX - General location of the object, or its center, within the imported diagram -- X Val
 * @property {number} initialY - General location of the object, or its center, within the imported diagram -- Y Val
 */

/** @typedef {diagObjImport_} diagRLEImport_
 * A {@link diagObjImport_} for reaction-like-events
 * @property {string} reactionType -
 * @property {Array<{id: number}>} activators -
 * @property {Array<{id: number}>} catalysts -
 * @property {Array<{id: number}>} inputs -
 * @property {Array<{id: number}>} outputs -
 */

/** @typedef {diagObjImport_} diagMiscLinkObjImport_
 * A {@link diagObjImport_} for links between PEs that are not RLEs
 * @property {Array<{id: number}>} inputs -
 * @property {Array<{id: number}>} outputs -
 */

/**
 * Processes requests for information about the Reactome knowledge base.
 * Leverages the Reactome API ( see {@link ReactomeAPIQuerier} ).
 * Performs data transformations so that way UI logic can access data in a more convenient format.
 * Creates internal data-structures and lookup tables to speed-up subsequent/related requests.
 *
 // * @property {ReactomeAPIQuerier} reactomeAPIQuerier -
 // * The instance of the ReactomeAPIQuerier (see {@link ReactomeAPIQuerier})
 // * It is the only source of information about the Reactome knowledge base.

 * @property {Fuse} pathwayFuzzySearcher - A Fuse fuzzy search instance for all human pathways
 * @property {Set<string>} renderableClassEncounteredValueSet
 * <p> For debugging purposes
 * <br> The set of values that have been so far encountered in the "renderableClass" field of all objects returned by
 * all queries returned from {@link DiagramEditorStateManager#reactomeRequestProcessor.getPathwayDiagramLayout}
 * @property {{nodes: Set<string>, edges: Set<string>, links: Set<string>}} renderableClassEncounteredValueSetsGrouped
 * <p> For debugging purposes
 * <br> The set of values that have been so far encountered in the "renderableClass" field of the entries
 * (grouped by node, edge, and link) returned by all queries returned from
 * {@link DiagramEditorStateManager#reactomeRequestProcessor.getPathwayDiagramLayout}
 * @property {Set<string>} schemaClassEncounteredValueSet
 * <p> For debugging purposes
 * <br> The set of values that have been so far encountered in the "schemaClass" field of all objects returned by
 * all queries returned from {@link DiagramEditorStateManager#reactomeRequestProcessor.getPathwayDiagramLayout}
 * @property {{nodes: Set<string>, edges: Set<string>, links: Set<string>}} schemaClassEncounteredValueSetsGrouped
 * <p> For debugging purposes
 * <br> The set of values that have been so far encountered in the "schemaClass" field of the entries
 * (grouped by node, edge, and link) returned by all queries returned from
 * {@link DiagramEditorStateManager#reactomeRequestProcessor.getPathwayDiagramLayout}
 */
class ReactomeRequestProcessor {
    pathwayFuzzySearcher;
    renderableClassEncounteredValueSet;
    renderableClassEncounteredValueSetsGrouped;
    schemaClassEncounteredValueSet;
    schemaClassEncounteredValueSetsGrouped;

    constructor() {
        // this.reactomeAPIQuerier = new ReactomeAPIQuerier();
        //
        this.renderableClassEncounteredValueSetsGrouped = {nodes: new Set(), edges: new Set(), links: new Set()};
        this.schemaClassEncounteredValueSetsGrouped = {nodes: new Set(), edges: new Set(), links: new Set()};

        // this.setup();
        // this.test();
    }

    async test() {
        const res = await ReactomeRequestProcessor.getEntrySearchResults("DNA", new Set(), new Set(["Pathway"]), new Set(), new Set());
        console.log(res);
    }


    /**
     * @see {ReactomeAPIQuerier.getEntrySearchResults}
     *
     * @param {string} queryString - the query string
     * @param {Set<string>} speciesSet - TODO
     * @param {Set<string>} typeSet - a set of types of entries that the entry search will recognize TODO
     * @param {Set<string>} compartmentSet - TODO
     * @param {Set<string>} keywordSet - TODO
     * @returns {Promise<{stId: string, name: string}>}
     */
    static async getEntrySearchResults(queryString, speciesSet, typeSet, compartmentSet, keywordSet) {
        return await ReactomeAPIQuerier.getEntrySearchResults(queryString, speciesSet, typeSet, compartmentSet, keywordSet);
    }

    /**
     * TODO
     *
     * @returns {Map<string, Array<{name: string, count: number}>>}
     */
    static async getMapFacet2Types() {
        const facetTypesResponse = await ReactomeAPIQuerier.getFacetTypes();

        return new Map(Object.entries(facetTypesResponse)
            .map(([key, value]) => {
                const facet = key.substring(0, key.indexOf("Facet"));
                if (facet) {
                    const validTypes = value["available"];
                    return [facet, validTypes];
                }
            })
            .filter((a) => a)
        );
    }

    /**
     * TODO DEsc
     *
     * @param {rawPathwayLayout_} pathwayLayoutRaw - See {@link ReactomeRequestProcessor.getPathwayDiagramLayout}
     * @returns {{PEs: Array<diagObjImport_>, RLEs: Array<diagRLEImport_>, miscLinkObjs: Array<diagMiscLinkObjImport_>}}
     */
    rawPathwayLayout2diagObjs(pathwayLayoutRaw) {

        const PEs = pathwayLayoutRaw.nodes.map(PE => ({
            rawDiagramID: PE.id,
            displayName: PE.displayName,
            reactomeId: PE.reactomeId,
            rawSchemaClass: PE.schemaClass,
            rawRenderableClass: PE.renderableClass,
            initialX: PE.position.x,
            initialY: PE.position.y,
        }));

        const RLEs = pathwayLayoutRaw.edges.map(RLE => ({
            rawDiagramID: RLE.id,
            displayName: RLE.displayName,
            reactomeId: RLE.reactomeId,
            rawSchemaClass: RLE.schemaClass,
            rawRenderableClass: RLE.renderableClass,
            initialX: RLE.position.x,
            initialY: RLE.position.y,
            activators: RLE.activators,
            catalysts: RLE.catalysts,
            inhibitors: RLE.inhibitors,
            inputs: RLE.inputs,
            outputs: RLE.outputs,
            reactionType: RLE.reactionType
        }));

        const miscLinkObjs = pathwayLayoutRaw.links.map((link) => ({
            rawDiagramID: link.id,
            displayName: link.displayName,
            reactomeId: link.reactomeId,
            rawSchemaClass: link.schemaClass,
            rawRenderableClass: link.renderableClass,
            initialX: link.position.x,
            initialY: link.position.y,
            inputs: link.inputs,
            outputs: link.outputs,
        }));

        /* The following block updates some values maintained for debugging. See property docs */
        PEs.forEach((graphObject) => {
            this.renderableClassEncounteredValueSetsGrouped.nodes.add(graphObject.rawRenderableClass);
            this.schemaClassEncounteredValueSetsGrouped.nodes.add(graphObject.rawSchemaClass);
        });
        RLEs.forEach((graphObject) => {
            this.renderableClassEncounteredValueSetsGrouped.edges.add(graphObject.rawRenderableClass);
            this.schemaClassEncounteredValueSetsGrouped.edges.add(graphObject.rawSchemaClass);
        });
        miscLinkObjs.forEach((graphObject) => {
            this.renderableClassEncounteredValueSetsGrouped.links.add(graphObject.rawRenderableClass);
            this.schemaClassEncounteredValueSetsGrouped.links.add(graphObject.rawSchemaClass);
        });
        // console.log(this.renderableClassEncounteredValueSetsGrouped);
        // console.log(this.schemaClassEncounteredValueSetsGrouped);
        this.renderableClassEncounteredValueSet = (({nodes, edges, links}) =>
            new Set([...nodes, ...edges, ...links]))(this.renderableClassEncounteredValueSetsGrouped);
        this.schemaClassEncounteredValueSet = (({nodes, edges, links}) =>
            new Set([...nodes, ...edges, ...links]))(this.schemaClassEncounteredValueSetsGrouped);
        /* Block over */

        return {PEs, RLEs, miscLinkObjs};
    }

    // /**
    //  * Return the {@link rawPathwayLayout_} of the first LL pathway w/ diagram that contains the given entry
    //  *
    //  * @param {number} databaseEntryID - dbID of the entry
    //  * @returns {Promise<rawPathwayLayout_>}
    //  */
    // static async OLDgetFirstPathwayForEntry(databaseEntryID) {
    //     const pathwayResultsWithEntry = await ReactomeAPIQuerier.getLLDPathwaysContainingEntry(databaseEntryID.toString());
    //     const firstPathwayResultDbId = pathwayResultsWithEntry[0].dbId;
    //     const pathwayLayoutRaw = await ReactomeAPIQuerier.getPathwayDiagramLayout(firstPathwayResultDbId);
    //     return pathwayLayoutRaw;
    // }

    /**
     * Return the first {@link diagObjImport_} corresponding to the desired entry
     * while transversing through LL pathways w/ diagram that contain the given entry
     *
     * @param {number} databaseEntryID - dbID of the entry
     * @returns {Promise<rawPathwayLayout_>}
     */
    async getSampleDiagObj(databaseEntryID) {
        const pathwayResultsWithEntry = await ReactomeAPIQuerier.getLLDPathwaysContainingEntry(databaseEntryID.toString());
        const pathwayDbIds = pathwayResultsWithEntry.map((pathwayResult) => pathwayResult.dbId);
        for (const pathwayDbId of pathwayDbIds) {
            const rawPathwayLayout = await ReactomeAPIQuerier.getPathwayDiagramLayout(pathwayDbId);
            const {PEs, RLEs, miscLinkObjs} = await this.rawPathwayLayout2diagObjs(rawPathwayLayout);
            const targetDiagObjImportPE = [...PEs, ...RLEs, ...miscLinkObjs]
                .find((diagObjImport) => diagObjImport.reactomeId === databaseEntryID);
            if (targetDiagObjImportPE !== null) return targetDiagObjImportPE;
        }
    }

    /**
     * See {@link ReactomeAPIQuerier.getEntrySearchResults}
     * This formatted version only contains certain information TODO
     *
     * @returns {Array<{dbId: number, stId: string, displayNameSearchHighlighted: string}>}
     */
    static async getEntrySearchResultsFormatted(queryString, entrySearchTypeSet) {
        const res = await ReactomeAPIQuerier.getEntrySearchResults(queryString, entrySearchTypeSet);
        //TODO
        if (res.results.length !== 1) throw Error("getEntrySearchResultsFormatted");
        return res.results[0].entries.map(({dbId, stId, name}) => ({
            dbId: parseInt(dbId),
            stId,
            displayNameSearchHighlighted: name
        }))
    }

    /** Search for Low-Level Pathways using the query string
     *
     * @param {string} query
     * @returns {Array<Pathway>}
     */
    searchForLLPathway(query) {
        /** @type {Array<Pathway>} */
        const results = this.pathwayFuzzySearcher.search(query);
        return results.filter((pathway) =>
            pathway.diagram && pathway.type === "Pathway");
    }

    /**
     *
     * @returns {Promise<Array<Pathway>>}
     */
    static async getHumanPathwayList() {
        const trees = await ReactomeAPIQuerier.getHumanPathwayHierarchy();
        /** @type {Array<Pathway>} */
        let pathwaysFlattened = [];
        const reduceTree = ((pathwayTree) => {
            const {children, ...pathway} = pathwayTree;
            pathwaysFlattened.push(pathway);
            if (children) {
                children.forEach(childTree => reduceTree(childTree));
            }
        });
        trees.forEach(topLevelTree => reduceTree(topLevelTree));

        return pathwaysFlattened;
    }

    /**
     *
     * @param {string} pathwayNameID
     * @returns {Promise<rawPathwayLayout_>}
     */
    static async getPathwayDiagramLayout(pathwayNameID) {
        const pathwayLayoutRaw = await ReactomeAPIQuerier.getPathwayDiagramLayout(pathwayNameID);
        // const pathwayLayoutRaw = await ReactomeAPIQuerier.getPathwayDiagramInfo(pathwayNameID);
        return pathwayLayoutRaw;
    }

    /**
     * Query for pathways that contain the given dbEntryId
     *
     * @param {(number|string)} dbEntryId - TODO
     * @param {Set<string>} speciesSet - The set of species to limit the search to
     * @param {boolean} onlyWithDiag - Whether to only include pathways with diagrams
     * @param {boolean} entryAllForms - Whether to include all forms of that entry
     * (can also be used if that entry is of an entity type ? TODO)
     * @returns {Promise<{stId: string}>}
     */
    static async getPathwaysHavingDiagContainingEntry(dbEntryId, speciesSet, onlyWithDiag=true, entryAllForms=false) {
        // TODO call logic bools
        const test = await ReactomeAPIQuerier.getPathwaysHavingDiagContainingEntry(dbEntryId, speciesSet);
        // console.log(test);
        return test;
    }

    /**
     * @see {@link ReactomeAPIQuerier.getEntitiesWithinComplex}
     *
     * @param {(number|string)} dbEntryId
     * @param {boolean} excludeStructures
     * @returns {Promise<{stId: string}>}
     */
    static async getEntitiesWithinComplex(dbEntryId, excludeStructures) {
        return await ReactomeAPIQuerier.getEntitiesWithinComplex(dbEntryId, excludeStructures);
    }
}

// const pathwayFuzzySearchOptions = {
//     shouldSort: true,
//     threshold: 0.5,
//     location: 0,
//     distance: 100,
//     maxPatternLength: 32,
//     minMatchCharLength: 1,
//     keys: [
//         "name",
//         "stId"
//     ]
// };

export default ReactomeRequestProcessor;