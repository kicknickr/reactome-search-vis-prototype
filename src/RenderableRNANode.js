/**
 * @module RenderableRNANode
 */

import * as d3 from "d3";
import RenderableNode from "./RenderableNode";


export default class RenderableRNANode extends RenderableNode{
    constructor(...args) {
        super(...args);
    }

    draw() {
        this.containerElemSel
            .classed("renderable-node renderable-node-RNA", true)
            .style("left", `${this.initialX}px`)
            .style("top", `${this.initialY}px`);

        this.containerElemSel.append("div")
            .classed("renderable-node-inset", true)
            .append("div")
            .text(this.displayName);
    }
}