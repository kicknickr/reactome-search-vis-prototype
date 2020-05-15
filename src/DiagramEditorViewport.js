import * as d3 from "d3";
import {default as panzoom} from "panzoom";
import {menuSurface} from "material-components-web";
const MDCMenuSurface = menuSurface.MDCMenuSurface;

import ReactomeRequestProcessor from "./ReactomeRequestProcessor";
import {generateContextMenu} from "./contextMenu";
import {event as currentEvent} from "d3";
import PresentingQueryBasedSearchComp from "./PresentingQueryBasedSearchComp";
import QueryBasedSearchPresManager from "./QueryBasedSearchPresManager";
import {subSearchTypes} from "./BaseSearchComponent";

/**
 * @callback DiagramEditorViewport~importPathwayFunc
 * @param {(number|string)} id - Reactome DB entry ID (stID or just database id) for the pathway to be imported
 * @returns void
 */

/**
 * The reactome diagram editor viewport.
 * A region where the user can modify the presentation of and move around entities that
 * are found in Reactome's low-level pathway diagrams.
 * TODO
 */
class DiagramEditorViewport {
    /** @description Element containing the viewport
     * @type {d3.Selection} */
    editorViewportSel;
    /** @description {@link PresentingQueryBasedSearchComp}
     * @type {PresentingQueryBasedSearchComp} */
    pathwaySearchComp;
    /** @description Element containing the active tooltip
     * @type {d3.Selection} */
    toolTipContainerElem;
    /** @description MDC component for the active tooltip
     * @type {MDCMenuSurface} */
    toolTipMenuSurfaceComp;
    /** @description Element containing rendered SVG diagram contents
     * @type {d3.Selection} */
    renderedSVGContentContainer;
    /** @description {@link ReactomeRequestProcessor}
     * @type {ReactomeRequestProcessor} */
    reactomeRequestProcessor;
    /** @description Element containing rendered HTML diagram contents
     * @type {d3.Selection} */
    renderedHTMLContentContainer;
    /** @description TODO
     * @type {number} */
    diagramWidth;
    /** @description TODO
     * @type {number} */
    diagramHeight;

    /**
     * @param {d3.Selection} editorViewportElem - {@link DiagramEditorViewport#editorViewportSel}
     * @param {ReactomeRequestProcessor} reactomeRequestProcessor - {@link DiagramEditorViewport#reactomeRequestProcessor}
     * @param {DiagramEditorViewport~importPathwayFunc} importPathwayFunc - {@link DiagramEditorStateManager#importPathway} TODO
     */
    constructor(editorViewportElem, reactomeRequestProcessor, importPathwayFunc) {
        this.editorViewportSel = editorViewportElem;
        this.editorViewportSel.selectAll("*").remove();

        this.reactomeRequestProcessor = reactomeRequestProcessor;

        this.pathwaySearchComp = new PresentingQueryBasedSearchComp(
            this.reactomeRequestProcessor, this.editorViewportSel, this.editorViewportSel, subSearchTypes.NONE, importPathwayFunc);

    }

    displayPathwayPane() {
        this.pathwaySearchComp.presManager.openDisplay();
    }

    displayPEPane() {
        // this.pathwaySearchComp.pathwayAdvancedSearchPaneComponent.open();
    }

    cleanCanvas() {
        if (this.renderedSVGContentContainer) this.renderedSVGContentContainer.selectAll("*").remove();
        if (this.renderedHTMLContentContainer) this.renderedHTMLContentContainer.selectAll("*").remove();
    }

    initViewport() {
        const createViewPortContextMenu = () => {
            /** @type {Array<{text: string, iconName: ?string, onClick: function()}>} */
            const textIconAction = [
                {
                    text: "Open Pathway Search Pane",
                    // iconName: "play_arrow",
                    onClick: () => {
                        this.displayPathwayPane();
                    }
                },
                {
                    text: "Open Physical Entity Search Pane",
                    onClick: () => {
                        this.displayPEPane();
                    }
                }];
            if (!this.toolTipMenuSurfaceComp) {
                this.toolTipMenuSurfaceComp = generateContextMenu(this.toolTipContainerElem, textIconAction);
            }

            // console.log([currentEvent.pageX, currentEvent.pageY]);
            if (this.toolTipMenuSurfaceComp.isOpen()) {
                this.toolTipMenuSurfaceComp.getDefaultFoundation().setQuickOpen(true);
                this.toolTipMenuSurfaceComp.close();
            }
            this.toolTipMenuSurfaceComp.setAbsolutePosition(currentEvent.pageX, currentEvent.pageY);
            this.toolTipMenuSurfaceComp.getDefaultFoundation().setQuickOpen(false);
            this.toolTipMenuSurfaceComp.open();
        };

        const closeToolTip = () => {
            if(this.toolTipMenuSurfaceComp) this.toolTipMenuSurfaceComp.close();
        };
        const closeUnneededPanes = () => {
            this.pathwaySearchComp.presManager.closeUnneededPanesIntent();
        };

        // /**
        //  * @see {@link PaneComponent.setAllowDragging}
        //  * @param {boolean} allowQ
        //  */
        // const setAllPanesDraggable = (allowQ) => {
        //     [this.pathwaySearchComp.pathwaySimpleSearchPaneComponent,
        //         this.pathwaySearchComp.pathwayAdvancedSearchPaneComponent]
        //         .forEach((paneComp) => paneComp.setAllowDragging(allowQ));
        // };

        const viewportClickHandler = () => {
            currentEvent.preventDefault();
            currentEvent.stopPropagation();
            closeToolTip();
            closeUnneededPanes();
        };

        const viewportContextMenuHandler = () => {
            currentEvent.preventDefault();
            currentEvent.stopPropagation();
            closeUnneededPanes();
            createViewPortContextMenu();
        };

        // const viewportKeyDownHandler = () => {
        //     if(currentEvent.key === "Control") setAllPanesDraggable(true);
        // };
        //
        // const viewportKeyUpHandler = () => {
        //     if(currentEvent.key === "Control") setAllPanesDraggable(false);
        // };


        this.cleanCanvas();
        this.editorViewportSel.on("click", viewportClickHandler);
        this.editorViewportSel.on("contextmenu", viewportContextMenuHandler);
        // this.editorViewportSel.on("keydown", viewportKeyDownHandler);
        // this.editorViewportSel.on("keyup", viewportKeyUpHandler);

        const zoomPanAble = this.editorViewportSel.append('div')
            .style('width', '100%')
            .style('height', '100%')
            .style("position", "absolute")
            .style("z-index", 0);
        const panzoomOptions = {
            smoothScroll: false,
            beforeWheel: (e) => !e.shiftKey,
            beforeMouseDown: (e) => !e.shiftKey
        };
        panzoom(zoomPanAble.node(), panzoomOptions);
        // this.editorViewportElem
        //     .attr('easypz', '{"applyTransformTo":"svg, div > *","modes":["SIMPLE_PAN","WHEEL_ZOOM"]}');

        this.toolTipContainerElem = this.editorViewportSel.append("div");
        this.renderedSVGContentContainer = zoomPanAble.append('svg:svg')
            .style("position", "absolute")
            .attr('width', '100%')
            .attr('height', '100%');
        this.renderedHTMLContentContainer = zoomPanAble.append('div')
            .style("position", "absolute")
            .style('width', '100%')
            .style('height', '100%');
        // this.editorViewportElem.on('contextmenu', createViewPortContextMenu);
        //Get the width and height of the containing element
        this.diagramWidth = this.editorViewportSel.node().getBoundingClientRect().width;
        this.diagramHeight = this.editorViewportSel.node().getBoundingClientRect().height;
    }

    /**
     * Prepare the canvas for importing a new pathway TODO
     *
     * @param stIdPathway
     */
    initCanvasForPathwayImport(stIdPathway) {

        this.cleanCanvas();

        // Border Rectangle
        this.renderedSVGContentContainer.append('g').attr("name", "VisBorderRectContainer").append("rect")
            .attr('width', '100%')
            .attr('height', '100%')
            .style('stroke', 'grey')
            .style('fill', 'none')
            .style('stroke-width', '1')
            // Since this element covers diagram, prevent pointer events
            .style("pointer-events", "none");

    }

}

export default DiagramEditorViewport;