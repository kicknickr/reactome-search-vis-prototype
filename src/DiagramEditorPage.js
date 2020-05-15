import * as d3 from "d3";

import DiagramEditorStateManager from "./DiagramEditorStateManager";
import ReactomeRequestProcessor from "./ReactomeRequestProcessor";
/**
 * The page containing the Reactome Diagram Editor -- the main page
 */
class DiagramEditorPage {
    /** @description The container div for the about page
     * @type {HTMLDivElement} */
    rootElem;
    /** @see {@link ReactomeRequestProcessor}
     * @type {ReactomeRequestProcessor} */
    reactomeRequestProcessor;
    /**
     * @param {HTMLDivElement} rootElem - {@link DiagramEditorPage#rootElem}
     * @param {ReactomeRequestProcessor} reactomeRequestProcessor - {@link DiagramEditorPage#reactomeRequestProcessor}
     * @param {function(string)} switchPageFunc - {@link PageSwitcher#switchPage}
     */
    constructor(rootElem, reactomeRequestProcessor, switchPageFunc) {
        this.rootElem = rootElem;
        this.reactomeRequestProcessor = reactomeRequestProcessor;
        const rootElemSel = d3.select(this.rootElem);

        /** (d3 selection of the container of) the header diagram editor */
        const editorHeader = rootElemSel.append("div").classed("editor-header", true);
        /** (d3 selection of the container of) the viewport of the diagram editor */
        const editorViewport = rootElemSel.append("div").classed("editor-viewport", true);

        const diagramEditorViewport = new DiagramEditorStateManager(editorViewport, reactomeRequestProcessor);


    }
}
export default DiagramEditorPage;