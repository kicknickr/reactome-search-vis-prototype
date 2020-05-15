import BaseSearchComponent, {resultsConstraintModeTypes, subSearchTypes} from "./BaseSearchComponent";
import ReactomeRequestProcessor from "./ReactomeRequestProcessor";

/**
 * Extends {@link BaseSearchComponent}. THe search is for finding all pathways that contain a provided entry id
 * that is either of the schema type entity or event.
 *
 * @augments BaseSearchComponent
 */
class NonPresentingPathwaysContainingEntrySearchComp extends BaseSearchComponent{
    /**
     *
     * @param {ReactomeRequestProcessor} reactomeRequestProcessor - {@link BaseSearchComponent#constructor}
     // * @param {Map<(string|number), *>} liveResults - {@link BaseSearchComponent#constructor}
     * @param {(number|string)} entryId -
     * The entry id that pathways will be queried for containing it.
     * May only include ids for entries that are entities and events
     *
     */
    constructor(reactomeRequestProcessor, entryId) {
        super(reactomeRequestProcessor, null, null, resultsConstraintModeTypes.OWN_RES_ONLY, subSearchTypes.NONE);
        this.entryId = entryId;
    }

    gatherQueryParameters() {
        return {entryId: this.entryId};
    }

    handlePreliminaryResult(result) {}

    async makeQueryRequest() {
        return await ReactomeRequestProcessor.getPathwaysHavingDiagContainingEntry(this.userQueryParameters.entryId, new Set(), true, false);
    }

    queryResult2liveResForm() {
        const preliminaryResults = new Map();
        this.rawResults.forEach((dbEntryRawResult) => {
            preliminaryResults.set(dbEntryRawResult.stId, dbEntryRawResult)
        });
        return preliminaryResults;
    }

    validateQueryParams() {
        return true;
    }

    destroy() {}
}

export default NonPresentingPathwaysContainingEntrySearchComp;