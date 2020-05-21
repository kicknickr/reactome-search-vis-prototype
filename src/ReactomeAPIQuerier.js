// import request from "request-promise-native";
import superagent from 'superagent';
/** @typedef xy_
 * @property {number} x
 * @property {number} y
 * */

/** @typedef edgeSegmentToNode_
 * @property {number} id
 * @property {Array<xy_>} points
 * @property {?number} stoichiometry
 * */

/** @typedef shape_
 * @property {xy_} centre
 * @property {string} type
 * @property {?xy_} a
 * @property {?xy_} b
 * @property {?xy_} c
 * @property {?boolean} empty
 * @property {?string} s
 * @property {?number} r
 * */

/** @typedef segment_
 * @property {xy_} from
 * @property {xy_} to
 * */

/** @typedef rgbColor_
 * @property {number} r
 * @property {number} g
 * @property {number} b
 * */

/** @typedef compartment_
 *
 * @property {rgbColor_} bgColor
 * @property {Array<number>} componentIds
 * @property {string} displayName
 * @property {number} id
 * @property {{height: number, width: number, x: number, y: number}} insets
 * @property {number} maxX
 * @property {number} maxY
 * @property {number} minX
 * @property {number} minY
 * @property {xy_} position
 * @property {xy_} prop
 * @property {number} reactomeId
 * @property {string} renderableClass
 * @property {string} schemaClass
 * @property {xy_} textPosition
 * */

/** @typedef edge_
 *
 * @property {Array<edgeSegmentToNode_>} activators
 * @property {Array<edgeSegmentToNode_>} catalysts,
 * @property {string} displayName:
 * @property {?shape_} endShape
 * @property {number} id
 * @property {Array<edgeSegmentToNode_>} inhibitors
 * @property {Array<edgeSegmentToNode_>} inputs
 * @property {number} maxX
 * @property {number} maxY
 * @property {number} minX
 * @property {number} minY
 * @property {Array<edgeSegmentToNode_>} outputs
 * @property {xy_} position
 * @property {shape_} reactionShape
 * @property {string} reactionType
 * @property {number} reactomeId
 * @property {string} renderableClass
 * @property {string} schemaClass
 * @property {Array<segment_>} segments
 * */

/** @typedef node_
 *
 * @property {?rgbColor_} bgColor
 * @property {Array<{edgeId: number, endShape: ?shape_, segments: Array<segment_>, stoichiometry: {value: number}, type: string}>} connectors
 * @property {string} displayName
 * @property {shape_} endShape
 * @property {number} id
 * @property {{shape: shape_, type: string}} interactorsSummary
 * @property {Array<{description: string, label: string, reactomeId: number, shape: shape_}>} nodeAttachments
 * @property {number} maxX
 * @property {number} maxY
 * @property {number} minX
 * @property {number} minY
 * @property {xy_} position
 * @property {{height: number, width: number, x: number, y: number}} prop
 * @property {number} reactomeId
 * @property {string} renderableClass
 * @property {string} schemaClass
 * @property {xy_} textPosition
 * @property {boolean} trivial
 * */

/** @typedef shadow_
 *
 * @property {string} colour
 * @property {string} displayName
 * @property {number} id
 * @property {number} maxX
 * @property {number} maxY
 * @property {number} minX
 * @property {number} minY
 * @property {Array<xy_>} points
 * @property {xy_} position
 * @property {{height: number, width: number, x: number, y: number}} prop
 * @property {number} reactomeId
 * @property {string} renderableClass
 * @property {string} schemaClass
 */

/** @typedef rawPathwayLayout_
 *
 * @property {Array<compartment_>} compartments
 * @property {number} dbId
 * @property {boolean} disease
 * @property {string} displayName
 * @property {Array<edge_>} edges
 * @property {Array<edge_>} links
 * @property {number} maxX
 * @property {number} maxY
 * @property {number} minX
 * @property {number} minY
 * @property {Array<node_>} nodes
 * @property {Array} notes
 * @property {Array<shadow_>} shadows
 * @property {string} stableId
 */

/**
 * Performs query requests to Reactome's API
 */
class ReactomeAPIQuerier {

    constructor() {

    }

    /**
     * Gets all valid types of each facet in the Reactome db
     *
     * @returns {Promise<object>}
     */
    static async getFacetTypes() {
        return superagent.get("https://reactome.org/ContentService/search/facet").then(res => res.body)
    }
    /**
     * Gets all regular info associated with the a given DB entry.
     * See {@link https://reactome.org/ContentService/#/query/findByIdUsingGET_1}
     *
     * @param {string} databaseEntryID - either a stableID or dbID from the reactome knowledge base
     * @returns {Promise<object>}
     */
    static async getDBEntryInfoRegular(databaseEntryID) {
        return superagent.get(`https://reactome.org/ContentService/data/query/${databaseEntryID}`, options).then(res => res.body)
    }

    /**
     * Returns the query results of a search performed in the Reactome knowledge base from
     * search term and entry type TODO what kind of type
     * See {@link https://reactome.org/ContentService/#/search/getResultUsingGET}
     *
     * @param {string} queryString - the query string
     * @param {Set<string>} speciesSet - TODO
     * @param {Set<string>} typeSet - a set of types of entries that the entry search will recognize TODO
     * @param {Set<string>} compartmentSet - TODO
     * @param {Set<string>} keywordSet - TODO
     * @returns {Promise<*>}
     */
    static async getEntrySearchResults(queryString, speciesSet, typeSet, compartmentSet, keywordSet) {
        const maxRowsReturned = 100;
        const options = {
            cluster: false,
            "Start row": 0,
            rows: maxRowsReturned
        };
        if (queryString) options.query = queryString; else throw Error("bad api request params");
        if (speciesSet) options.species = [...speciesSet].toString();
        if (typeSet) options.types = [...typeSet].toString();
        if (compartmentSet) options.compartments = [...compartmentSet].toString();
        if (keywordSet) options.keywords = [...keywordSet].toString();
        if (speciesSet) options.species = [...speciesSet].toString();
        console.log(options);

        return superagent.get("https://reactome.org/ContentService/search/query", options).then(res => res.body)
    }

    /**
     *
     * Returns results listing pathways (and some of their info) that are low-level and have diagrams and contain
     * the specified database entry
     * <br> See {@link https://reactome.org/ContentService/#/pathways/getPathwaysWithDiagramForUsingGET}
     *
     * @param {string} databaseEntryID - either a stableID or dbID from the reactome knowledge base
     */
    static async getLLDPathwaysContainingEntry(databaseEntryID) {
        return superagent.get("https://reactome.org/ContentService/data/pathways/low/diagram/entity/").then(res => res.body)
    }

    /**
     *
     * @param {string} pathwayNameID
     * @returns {Promise<rawPathwayLayout_>}
     */
    static async getPathwayDiagramLayout(pathwayNameID) {
        return superagent.get(`https://reactome.org/download/current/diagram/${pathwayNameID}`).then(res => res.body).catch( (error) =>
            {
                if (error.status === 404) {
                    return null;
                }
                else console.log(error);
            }
        )
    }


    static async getPathwayDiagramInfo(pathwayNameID) {
        return superagent.get(`https://reactome.org/download/current/diagram/${pathwayNameID}.graph`).then(res => res.body).catch( (error) =>
            {
                if (error.status === 404) {
                    return null;
                }
                else console.log(error);
            }
        )
    }


    static async getHumanPathwayHierarchy() {
        return superagent.get("https://reactome.org/ContentService/data/eventsHierarchy/9606").then(res => res.body)
    }

    /**
     * Query for pathways with diagrams that contain the given dbEntryId
     * <br> See {https://reactome.org/ContentService/#/pathways/getPathwaysWithDiagramForUsingGET}
     *
     * @param {(number|string)} dbEntryId - TODO
     * @param {Set<string>} speciesSet - The set of species to limit the search to
     * @returns {Promise<{stId: string}>}
     */
    static async getPathwaysHavingDiagContainingEntry(dbEntryId, speciesSet) {
        const options = {};
        if (speciesSet) options.species = [...speciesSet].toString();
        return await superagent.get("https://reactome.org/ContentService/data/pathways/low/diagram/entity/", options).then(res => res.body).catch((error) => {
            if (error.error.code === 404) {
                if (error.response.body.messages[0].startsWith("No result for")) {
                    return [];
                }
            }
            console.log(error);
            throw error;
        });
    }

    /**
     * Query to get entities contained in a complex
     * <br> See {@link https://reactome.org/ContentService/#/entities/getComplexSubunitsUsingGET}
     *
     * @param {(number|string)} dbEntryId
     * @param {boolean} excludeStructures
     * @returns {Promise<{stId: string}>}
     */
    static async getEntitiesWithinComplex(dbEntryId, excludeStructures) {
        return await superagent.get("https://reactome.org/ContentService/data/complex/", options).then(res => res.body).catch((error) => {
            if (error.status === 404) {
                const errorMessage = error.response.body.messages[0];
                if (errorMessage.startsWith("No result for") || errorMessage.endsWith("has not been found in the System")) {
                    return [];
                }
            }
            console.log(error);
            throw error;
        });
    }

}

export default ReactomeAPIQuerier;