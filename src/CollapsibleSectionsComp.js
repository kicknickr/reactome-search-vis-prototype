import * as d3 from "d3";

import {toggleSectionExpansion} from "./ElementSmoothAutoCollapseToggleUtil"

/**
 * TODO
 *
 */
class CollapsibleSectionsComp {

    /**
     * TODO
     *
     * @param {d3.Selection} containerSel -
     * @param {Array<{title: string, callbackForSectionContent: function(d3.Selection)}>} tree - TODO
     */
    constructor(containerSel, tree) {
        const list = containerSel
            .classed("mdc-list", true);
        tree.forEach(({title, callbackForSectionContent}) => {

            list.append("div")
                .classed("mdc-list-item", true)
                .on("click", () => {toggleSectionExpansion(contentSectionSel.node(), "height 1s")})
                .append("span")
                .classed("mdc-list-item__text", true)
                .text(title);
            const contentSectionSel = list.append("div");
            callbackForSectionContent(contentSectionSel);
        })
    }
}

export default CollapsibleSectionsComp;