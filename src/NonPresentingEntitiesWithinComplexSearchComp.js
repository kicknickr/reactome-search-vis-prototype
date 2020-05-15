import BaseSearchComponent, {resultsConstraintModeTypes, subSearchTypes} from "./BaseSearchComponent";
import ReactomeRequestProcessor from "./ReactomeRequestProcessor";

/**
 * Extends {@link BaseSearchComponent}. The search is for finding all entities contained within a given complex.
 *
 * @augments BaseSearchComponent
 */
class NonPresentingEntitiesWithinComplexSearchComp extends BaseSearchComponent{
    /**
     *
     * @param {ReactomeRequestProcessor} reactomeRequestProcessor - {@link BaseSearchComponent#constructor}
     * @param {(number|string)} entryId -
     * The entry id of the complex that will be queried for entities within it.
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
        return await ReactomeRequestProcessor.getEntitiesWithinComplex(this.userQueryParameters.entryId, false);
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

export default NonPresentingEntitiesWithinComplexSearchComp;