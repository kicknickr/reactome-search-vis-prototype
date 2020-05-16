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
import RenderableRLENode from "./RenderableRLENode";

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

        /** @type {Map<number, number>} */
        const diagImportElemID2viewportElemID = new Map();
        /** @type {Map<number, RenderableNode>} */
        const viewportElemID2NodeComp = new Map();

        PEs.forEach((PE) => {
            const div = this.diagramEditorViewport.renderedHTMLContentContainer.append("div");
            const {x: newCanvasX, y: newCanvasY} = scaledXYValues(PE,
                (node) => node.initialX, (node) => node.initialY,
                pathwayLayoutRaw.minX, pathwayLayoutRaw.maxX, pathwayLayoutRaw.minY, pathwayLayoutRaw.maxY,
                0, this.diagramEditorViewport.diagramWidth, 0, this.diagramEditorViewport.diagramHeight);

            const renderableNodeIdCounter = this.renderableNodeIdCounter++;
            const args = [div, renderableNodeIdCounter, PE.displayName, PE.reactomeId, PE.rawSchemaClass, PE.rawRenderableClass,
                newCanvasX, newCanvasY];

            diagImportElemID2viewportElemID.set(PE.rawDiagramID, renderableNodeIdCounter)

            let newDiagramNode = null;
            switch (PE.rawRenderableClass) {
                case "Complex":
                    newDiagramNode = new RenderableComplexNode(...args);
                    break;
                case "EntitySet":
                    newDiagramNode = new RenderableEntitySetNode(...args);
                    break;
                case "Entity":
                    newDiagramNode =  new RenderableEntityNode(...args);
                    break;
                case "Protein":
                    newDiagramNode =  new RenderableProteinNode(...args);
                    break;
                case "Chemical":
                    newDiagramNode =  new RenderableChemicalNode(...args);
                    break;
                case "RNA":
                    newDiagramNode=  new RenderableRNANode(...args);
                    break;
                case "Gene":
                    newDiagramNode =  new RenderableGeneNode(...args);
                    break;
                case "ProcessNode":
                case "EncapsulatedNode":
                    newDiagramNode =  new RenderableProcessNodeNode(...args);
                    break;
                default:
                    newDiagramNode = new RenderableNode(...args);
            }

            viewportElemID2NodeComp.set(renderableNodeIdCounter, newDiagramNode);
        })

        /** @type {Array<{reactionNodeID: number, relatedPEID: number, edgeType: string}>} */
        const edgesData = [];

        RLEs.forEach((RLE) => {
            const div = this.diagramEditorViewport.renderedHTMLContentContainer.append("div");
            const {x: newCanvasX, y: newCanvasY} = scaledXYValues(RLE,
                (node) => node.initialX, (node) => node.initialY,
                pathwayLayoutRaw.minX, pathwayLayoutRaw.maxX, pathwayLayoutRaw.minY, pathwayLayoutRaw.maxY,
                0, this.diagramEditorViewport.diagramWidth, 0, this.diagramEditorViewport.diagramHeight);
            // if (RLE.rawRenderableClass !== "Reaction") {
            //     throw Error("New rawRenderableClass type found")
            // }
            //
            // if (!new Set(["Reaction", "BlackBoxEvent", "Depolymerisation", "FailedReaction", "Polymerisation"]).has(RLE.rawSchemaClass)) {
            //     throw Error("New rawSchemaClass type found")
            // }
            //
            // if (RLE.reactionType) {
            //     // console.log(RLE.reactionType);
            //     if (!new Set(["Association", "Omitted Process"]).has(RLE.reactionType)) {
            //         throw Error("New reactionType type found");
            //     }
            // }
            const renderableNodeIdCounter = this.renderableNodeIdCounter++;

            const args = [div, renderableNodeIdCounter, RLE.displayName, RLE.reactomeId, RLE.reactionType, RLE.rawSchemaClass, newCanvasX, newCanvasY];

            RLE.inputs.forEach((importDiagIDRLEInput) => {
                edgesData.push({reactionNodeID: renderableNodeIdCounter, relatedPEID: diagImportElemID2viewportElemID.get(importDiagIDRLEInput.id), edgeType: "RLEInput"})})
            RLE.outputs.forEach((importDiagIDRLEOutput) => {
                edgesData.push({reactionNodeID: renderableNodeIdCounter, relatedPEID: diagImportElemID2viewportElemID.get(importDiagIDRLEOutput.id), edgeType: "RLEOutput"})})
            if (RLE.activators) {
            RLE.activators.forEach((importDiagIDRLEActivator) => {
                edgesData.push({reactionNodeID: renderableNodeIdCounter, relatedPEID: diagImportElemID2viewportElemID.get(importDiagIDRLEActivator.id), edgeType: "RLEOutput"})})
            }
            if (RLE.catalysts) {
                RLE.catalysts.forEach((importDiagIDRLECatalyst) => {
                edgesData.push({reactionNodeID: renderableNodeIdCounter, relatedPEID: diagImportElemID2viewportElemID.get(importDiagIDRLECatalyst.id), edgeType: "RLEOutput"})})
            }

            let newDiagramNode = null;
            switch (RLE.rawSchemaClass) {
                case "BlackBoxEvent":
                    newDiagramNode = new RenderableRLENode(...args);
                    break;
                case "Polymerisation":
                case "Depolymerisation":
                    newDiagramNode = new RenderableRLENode(...args);
                    break;
                case "FailedReaction":
                    newDiagramNode =  new RenderableRLENode(...args);
                    break;
                case "Reaction":
                default:
                    newDiagramNode =  new RenderableRLENode(...args);
                    break;
            }

            viewportElemID2NodeComp.set(renderableNodeIdCounter, newDiagramNode);
        })

        const edgesSelection = this.diagramEditorViewport.renderedSVGContentContainer.append("g").attr("name", "edgeContainer")
            .selectAll("line").data(edgesData)
            .join("line")
            .attr("stroke", "grey")
            .attr("stroke-opacity", 0.3)
            .attr("stroke-width", 3)
            .attr("x1", d => viewportElemID2NodeComp.get(d.reactionNodeID).initialX)
            .attr("y1", d => viewportElemID2NodeComp.get(d.reactionNodeID).initialY)
            .attr("x2", d => viewportElemID2NodeComp.get(d.relatedPEID).initialX)
            .attr("y2", d => viewportElemID2NodeComp.get(d.relatedPEID).initialY);

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