import * as d3 from "d3";
import {chips} from "material-components-web";
const MDCChipSet = chips.MDCChipSet;
/**
 * TODO
 */
class CustomMDCChipSetComp {
    /** @description TODO
     * @type {Map<(number|string), (number|string)>} */
    mapID2Value;
    /** @description TODO
     * @type {MDCChipSet} */
    chipSetComp;
    /** @description The element that the new chip set inhabits (not its parent)
     * @type {d3.Selection} */
    containerSel;

    /**
     * TODO
     *
     * @param {d3.Selection} containerSel - {@link CustomMDCChipSetComp#containerSel}
     * @param {function()} chipSetChoiceUpdate - callback for when there is a change in the chosen/filtered chips
     * @param {Array<{value: string, isDefaultQ: boolean, isInteractableQ: boolean}>} valueList -
     * An array of chip labels and whether they should be defaulted as selected/chosen
     */
    constructor(containerSel, chipSetChoiceUpdate, valueList) {
        this.containerSel = containerSel;
        this.mapID2Value = new Map();
        containerSel
            .classed("adv-search-chip-set", true)
            .on("MDCChip:selection", () => chipSetChoiceUpdate());
        const chipSet = containerSel
            .classed("mdc-chip-set mdc-chip-set--filter", true)
            .attr("role", "grid");
        this.chipSetComp = new MDCChipSet(chipSet.node());
        // const sampleValues = ["Hi", "Bye", "Cry", "Pie"];
        valueList.forEach(({value, isDefaultQ, isInteractableQ}) => {
            const chip = chipSet.append("div")
                .classed("interaction-blocked", !isInteractableQ)
                .classed("mdc-chip", true)
                .classed("mdc-chip--selected", isDefaultQ)
                .attr("role", "row");
            chip.append("div")
                .classed("mdc-chip__ripple", true);
            chip
                .append("span")
                .classed("mdc-chip__checkmark", true)
                .append("svg")
                .classed("mdc-chip__checkmark-svg", true)
                .attr("viewBox", "-2 -3 30 30")
                .append("path")
                .classed("mdc-chip__checkmark-path", true)
                .attr("fill", "none")
                .attr("stroke", "black")
                .attr("d", "M1.73,12.91 8.1,19.28 22.79,4.59");
            chip
                .append("span")
                .attr("role", "gridcell")
                .append("span")
                .classed("mdc-chip__primary-action", true)
                .attr("role", "checkbox")
                .attr("tabindex", 0)
                .attr("aria-checked", isDefaultQ)
                .append("mdc-chip__text")
                .classed("mdc-chip__text", true)
                .text(value);
            this.chipSetComp.addChip(chip.node());
            this.mapID2Value.set(chip.node().id, value)
        });

    }

    /**
     * Sets all chips selected state to the boolean param "selectedQ"
     *
     * @param {boolean} selectedQ
     * @returns {void}
     */
    setAllChipsSelected(selectedQ) {
            this.chipSetComp.chips.forEach((chipComp) => chipComp.selected = selectedQ)
    }

    /**
     * TODO
     *
     * @param {boolean} enabled
     */
    toggleUserInteractionAllowed(enabled) {
        this.containerSel.classed("interaction-blocked", !enabled);
    }

    /**
     *
     * @returns {Array<(string)>}
     */
    getSelectedValues() {
        const _this = this;
        return this.chipSetComp.chips.filter((chip) => chip.selected).map((chip) => chip.id).map((id) => _this.mapID2Value.get(id));
    }
}

export default CustomMDCChipSetComp;