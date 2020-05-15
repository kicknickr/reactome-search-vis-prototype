import * as d3 from "d3";
import ReactomeRequestProcessor from './ReactomeRequestProcessor';
import DiagramEditorViewport from "./DiagramEditorViewport";
import RenderableNode from "./RenderableNode";
import RenderableComplexNode from "./RenderableComplexNode";
import RenderableEntitySetNode from "./RenderableEntitySetNode";
import RenderableEntityNode from "./RenderableEntityNode";
import RenderableProteinNode from "./RenderableProteinNode";
import RenderableChemicalNode from "./RenderableChemicalNode";
import RenderableProcessNodeNode from "./RenderableProcessNodeNode";
import RenderableRNANode from "./RenderableRNANode";
import RenderableGeneNode from "./RenderableGeneNode";

/**
 * Manages the state of diagram editor.
 * This includes keeping track of all classes associated with contents rendered within the diagram itself
 * and facilitating logic that involves more than one instance of these classes
 */
class DiagramEditorStateManager {
    /** @description (d3 selection of) the element containing the viewport
     * @type {d3.Selection} */
    editorViewportElem;
    /** @description {@link ReactomeRequestProcessor}
     * @type {ReactomeRequestProcessor} */
    reactomeRequestProcessor;
    /** @description {@link DiagramEditorViewport} TODO
     * @type {DiagramEditorViewport} */
    diagramEditorViewport;
    /** @description An incrementing counter for new uniques IDs belonging to renderable nodes
     * @type {number} */
    renderableNodeIdCounter;

    /**
     * @param {d3.Selection} editorViewportElem - {@link DiagramEditorStateManager#editorViewportElem}
     * @param {ReactomeRequestProcessor} reactomeRequestProcessor - {@link DiagramEditorStateManager#reactomeRequestProcessor}
     */
    constructor(editorViewportElem, reactomeRequestProcessor) {
        this.editorViewportElem = editorViewportElem;
        this.reactomeRequestProcessor = reactomeRequestProcessor;

        this.renderableNodeIdCounter = 0;
        this.diagramEditorViewport = new DiagramEditorViewport(
            this.editorViewportElem, this.reactomeRequestProcessor, this.importPathway.bind(this));

        this.diagramEditorViewport.initViewport();

        // This one has a subpathway
        // const testPathwayStId = "R-HSA-881907";
        // Lots of .links
        const testPathwayStId = "R-HSA-1474228";
        // RNA and DNA
        // const testPathwayStId = "R-HSA-6807070";

        this.importPathway(testPathwayStId);
    }

    importPathway(stIdPathway) {

        this.diagramEditorViewport.initCanvasForPathwayImport(stIdPathway);

        // TODO
        this.generateNodesForEntirePathwayImport(stIdPathway);

    }


    async addPETest(databaseEntryID) {
        await this.generateNodeForPE(databaseEntryID, 100, 100);
    }

    /**
     *
     * @param {number} databaseEntryID - dbID of the entry
     * @param {number} newCanvasX
     * @param {number} newCanvasY
     * @returns {Promise<void>}
     */
    async generateNodeForPE(databaseEntryID, newCanvasX, newCanvasY) {
        const PE = await this.reactomeRequestProcessor.getSampleDiagObj(databaseEntryID)
            .catch(() => console.log("fffff"));
        const div = this.diagramEditorViewport.renderedHTMLContentContainer.append("div");

        const args = [div, this.renderableNodeIdCounter++, PE.displayName, PE.reactomeId, PE.rawSchemaClass, PE.rawRenderableClass,
            newCanvasX, newCanvasY];

        switch (PE.rawRenderableClass) {
            case "Complex":
                new RenderableComplexNode(...args);
                break;
            case "EntitySet":
                new RenderableEntitySetNode(...args);
                break;
            case "Entity":
                new RenderableEntityNode(...args);
                break;
            case "Protein":
                new RenderableProteinNode(...args);
                break;
            case "Chemical":
                new RenderableChemicalNode(...args);
                break;
            case "RNA":
                new RenderableRNANode(...args);
                break;
            case "Gene":
                new RenderableGeneNode(...args);
                break;
            case "ProcessNode":
            case "EncapsulatedNode":
                new RenderableProcessNodeNode(...args);
                break;
            default:
                new RenderableNode(...args);
        }

    }

    /**
     * @param {string} stIdPathway - A reactome stable Id to the pathway entry
     * @returns {void}
     */
    async generateNodesForEntirePathwayImport(stIdPathway) {
        /** @type {rawPathwayLayout_} */
        const pathwayLayoutRaw = await ReactomeRequestProcessor.getPathwayDiagramLayout(stIdPathway);
        const {PEs, RLEs, miscLinkObjs} = this.reactomeRequestProcessor.rawPathwayLayout2diagObjs(pathwayLayoutRaw);

        PEs.forEach((PE) => {
            const div = this.diagramEditorViewport.renderedHTMLContentContainer.append("div");
            const {x: newCanvasX, y: newCanvasY} = scaledXYValues(PE,
                (node) => node.initialX, (node) => node.initialY,
                pathwayLayoutRaw.minX, pathwayLayoutRaw.maxX, pathwayLayoutRaw.minY, pathwayLayoutRaw.maxY,
                0, this.diagramEditorViewport.diagramWidth, 0, this.diagramEditorViewport.diagramHeight);

            const args = [div, this.renderableNodeIdCounter++, PE.displayName, PE.reactomeId, PE.rawSchemaClass, PE.rawRenderableClass,
                newCanvasX, newCanvasY];

            switch (PE.rawRenderableClass) {
                case "Complex":
                    return new RenderableComplexNode(...args);
                case "EntitySet":
                    return new RenderableEntitySetNode(...args);
                case "Entity":
                    return new RenderableEntityNode(...args);
                case "Protein":
                    return new RenderableProteinNode(...args);
                case "Chemical":
                    return new RenderableChemicalNode(...args);
                case "RNA":
                    return new RenderableRNANode(...args);
                case "Gene":
                    return new RenderableGeneNode(...args);
                case "ProcessNode":
                case "EncapsulatedNode":
                    return new RenderableProcessNodeNode(...args);
                default:
                    return new RenderableNode(...args);
            }
        })
    }

}

/**
 * @private
 * @returns {{x: number, y: number}}
 */
const scaledXYValues = (
    node, xGetterFunc, yGetterFunc,
    oldMinX, oldMaxX, oldMinY, oldMaxY, newMinX, newMaxX, newMinY, newMaxY) => ({
    x: newMinX + (xGetterFunc(node) - oldMinX) * (newMaxX - newMinX) / (oldMaxX - oldMinX),
    y: newMinY + (yGetterFunc(node) - oldMinY) * (newMaxY - newMinY) / (oldMaxY - oldMinY)
});

// const scaleXYValues = (
//     node, xGetterFunc, xSetterFunc, yGetterFunc, ySetterFunc,
//     oldMinX, oldMaxX, oldMinY, oldMaxY, newMinX, newMaxX, newMinY, newMaxY) => {
//         xSetterFunc(node, newMinX + (xGetterFunc(node) - oldMinX) * (newMaxX - newMinX) / (oldMaxX - oldMinX));
//         ySetterFunc(node, newMinY + (yGetterFunc(node) - oldMinY) * (newMaxY - newMinY) / (oldMaxY - oldMinY));
// };

export default DiagramEditorStateManager;