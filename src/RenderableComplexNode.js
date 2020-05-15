/**
 * @module RenderableComplexNode
 */

import * as d3 from "d3";
import RenderableNode from "./RenderableNode";


export default class RenderableComplexNode extends RenderableNode{
    constructor(...args) {
        super(...args);
    }

    draw() {
        this.containerElemSel
            .classed("renderable-node renderable-node-wo-inset renderable-node-rounded renderable-node-complex", true)
            .style("left", `${this.initialX}px`)
            .style("top", `${this.initialY}px`);

        this.containerElemSel.append("div")
            .text(this.displayName);
    }
}