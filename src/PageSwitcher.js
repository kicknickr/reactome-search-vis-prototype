import * as d3 from "d3";

import ReactomeRequestProcessor from "./ReactomeRequestProcessor";
import DiagramEditorPage from "./DiagramEditorPage";

/**
 * Handles navigation between pages
 *
 */
class PageSwitcher {
  /** @description The container div for any page
   * @type {HTMLDivElement} */
  rootElem;
  /** @description TODO
   * @type {*} */
  pages;

  /**
   * @param {HTMLDivElement} rootElem - {@link PageSwitcher#rootElem}
   * @param {ReactomeRequestProcessor} reactomeRequestProcessor - {@link ReactomeRequestProcessor}
   */
  constructor(rootElem, reactomeRequestProcessor) {
    this.rootElem = rootElem;
    this.pages = Object.freeze({
      DiagramEditorPage: DiagramEditorPage.bind(null, this.rootElem, reactomeRequestProcessor, this.switchPage.bind(this)),
    })
  }
  /** Switches the contained elem to the given page.
   * This is accomplished by simply clearing the containing elem and calling the
   * constructor of the of class corresponding the provided name,
   * but already bound with arguments needed for its proper instantiation
   *
   * @param {string} pageName - TODO
   */
  switchPage(pageName) {
    // if (currentEvent) currentEvent.stopPropagation();
    d3.select(this.rootElem).selectAll("*").remove();
    new this.pages[pageName];
  }

}

export default PageSwitcher;