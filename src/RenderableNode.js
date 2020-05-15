/**
 * @module RenderableNode
 */

import * as d3 from "d3";

/**
 * A base class for renderable nodes on the diagram including both
 * physical entities (PE) which are derived from
 * {@link rawPathwayLayout_#nodes}
 * and reaction like events (RLE) which are derived from
 * {@link rawPathwayLayout_#edges}
 *
 * @property {d3.Selection} containerElemSel - (d3 selection of) the containing element unique to this node
 * @property {number} id - Serves as a unique id among renderable nodes
 * @property {string} displayName - The main name that will be always visible on the node
 * @property {number} reactomeId - ID of the associated reactome database object
 * @property {string} rawSchemaClass
 * @property {string} rawRenderableClass
 * @property {number} initialX
 * @property {number} initialY
 *
 */
export default class RenderableNode {
    containerElemSel;
    id;
    displayName;
    reactomeId;
    rawSchemaClass;
    rawRenderableClass;
    initialX;
    initialY;
    /**
     *
     * @param {d3.Selection} containerElemSel - {@link RenderableNode#containerElemSel}
     * @param {number} id - {@link RenderableNode#id}
     * @param {string} displayName - {@link RenderableNode#displayName}
     * @param {number} reactomeId - {@link RenderableNode#reactomeId}
     * @param {string} rawSchemaClass - {@link RenderableNode#rawSchemaClass}
     * @param {string} rawRenderableClass - {@link RenderableNode#rawRenderableClass}
     * @param {number} initialX - {@link RenderableNode#initialX}
     * @param {number} initialY - {@link RenderableNode#initialY}
     */
    constructor(containerElemSel, id, displayName, reactomeId, rawSchemaClass, rawRenderableClass, initialX, initialY) {
        this.containerElemSel = containerElemSel;
        this.id = id;
        this.displayName = displayName;
        this.reactomeId = reactomeId;
        this.rawSchemaClass = rawSchemaClass;
        this.rawRenderableClass = rawRenderableClass;
        this.initialX = initialX;
        this.initialY = initialY;

        this.draw();
    }

    draw() {
        this.containerElemSel
            .classed("renderable-node renderable-node-rounded renderable-node-default", true)
            .style("left", `${this.initialX}px`)
            .style("top", `${this.initialY}px`);

        const inset = this.containerElemSel.append("div")
            .classed("renderable-node-inset", true);
        inset.append("div")
            .text(this.displayName);
        inset.append("div")
            .text(this.rawSchemaClass);
        inset.append("div")
            .text(this.rawRenderableClass);
    }
}