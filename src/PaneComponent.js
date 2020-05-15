import * as d3 from "d3";
import {event as currentEvent} from "d3-selection";

import {menuSurface} from "material-components-web";
const MDCMenuSurface = menuSurface.MDCMenuSurface;

/**
 * Gets called when a button is clicked. May also be responsible for updating a button's icon.
 *
 * @callback PaneComponent~buttonClickCb
 * @param {d3.Selection} elem - The element of the button itself
 * @returns void
 */

/**
 * A generic "pane" or "window" type component. Includes presentation and functionality for dragging and resizing.
 */
class PaneComponent {
    /** @description parent elem of the menu surface
     * @type {d3.Selection} */
    menuAnchor;
    /** @description The MDC component for the menu surface comprising the pane
     * @type {MDCMenuSurface} */
    menuSurfaceComp;
    /** @description Whether or not the Pane is a 'pinned' state meaning whether click outside will close it or not
     * @type {boolean} */
    isPinnedQ;
    /** @description Element with the contents of the pane
     * @type {d3.Selection} */
    paneBodySel;
    /** @description Whether or not the user is hovering over the drag button of the pane
     * @type {boolean} */
    isDragButtonHoveredOverQ;
    /** @description Element for the "end" section within the MDC top app bar
     * @type {d3.Selection} */
    headerRightSection;
    /** @description Whether the pane is in an open state (visible) or not
     * @type {boolean} */
    isOpenQ;

    /**
     *
     * @param {d3.Selection} containerElem - The parent elem of anything children this class creates
     * @param {string} paneTitle - Name display centrally on the header of the pane
     * @param {string} anchorElemStyleClass - Name of the css class that will applied to the anchor elem.
     * The css class may include rules that specify the initial position and size information.
     */
    constructor(containerElem, paneTitle, anchorElemStyleClass) {

        // Do not allow click and right-clicks to bubble-up
        this.menuAnchor = containerElem.append("div")
            .classed("mdc-menu-surface--anchor resize-interactjs general-interactjs search-pane", true)
            .on("click", () => {currentEvent.stopPropagation(); this.movePaneToForemost()})
            .on("contextmenu", () => {currentEvent.preventDefault();currentEvent.stopPropagation();})
            .on("dblclick", () => {currentEvent.preventDefault();currentEvent.stopPropagation();})
            .on("pointermove", () => {
                if (currentEvent.ctrlKey || this.isDragButtonHoveredOverQ) {
                    if (this.getAllowDragging()) return;
                    this.setAllowDragging(true);
                    return;
                }
                this.setAllowDragging(false);
            });

        this.menuAnchor.classed(anchorElemStyleClass, true);

        const menuSurfaceSel = this.menuAnchor.append("div")
            .classed("mdc-menu-surface search-pane-menu-surface", true);
        this.menuSurfaceComp = new MDCMenuSurface(menuSurfaceSel.node());

        /* The following block defines the header of the pane */
        const paneHeaderArea = menuSurfaceSel.append("header")
            .classed("mdc-top-app-bar", true);
        const paneHeaderAreaRow = paneHeaderArea.append("div")
            .classed("mdc-top-app-bar__row", true);
        const headerLeftSection = paneHeaderAreaRow.append("section")
            .classed("mdc-top-app-bar__section mdc-top-app-bar__section--align-start", true);
        headerLeftSection.append("i")
            .classed("material-icons mdc-top-app-bar__navigation-icon mdc-icon-button", true)
            .text("open_with")
            .on("mouseenter", () => {this.isDragButtonHoveredOverQ = true; this.movePaneToForemost()})
            .on("mouseleave", () => {this.isDragButtonHoveredOverQ = false});
        headerLeftSection.append("span")
            .classed("mdc-top-app-bar__title", true)
            .text(paneTitle);
        this.headerRightSection = paneHeaderAreaRow.append("section")
            .classed("mdc-top-app-bar__section mdc-top-app-bar__section--align-end", true);

        /* Block end */

        this.paneBodySel = menuSurfaceSel.append("div")
            .classed("search-pane-body-area mdc-top-app-bar--fixed-adjust", true);

        // Since the MDC Component initializes in a closed state anyways, call our close to be consistent (styling)
        this.close(true);
    }

    movePaneToForemost() {
        // if (!this.menuAnchor.node().nextSibling) return;
        const parentElem = d3.select(this.menuAnchor.node().parentNode);
        // parentElem.append(() => this.menuAnchor.remove().node());

        while (this.menuAnchor.node().nextSibling) {
            const nextSibling = d3.select(this.menuAnchor.node().nextSibling);
            parentElem.insert(() => nextSibling.remove().node(), ":first-child");
        }
    }

    /**
     * Destroy the pane's dom and components. If other components used dom within this dom, then they
     * should be destroyed too separately
     */
    destroy() {
        this.menuSurfaceComp.destroy();
        this.menuAnchor.remove();
    }

    /**
     * Add an "action button" on the right-side of the pane and give it functionality
     *
     * @param {string} matIconName - The mdc-icon name for the button's icon.
     * Of the button's icon can be changed later via the on-click callback function since it will have access
     * to the button's element
     * @param {PaneComponent~buttonClickCb} callbackFunc - {@link PaneComponent~buttonClickCb}
     */
    addActionButton(matIconName, callbackFunc) {
        const newButton = this.headerRightSection.append("i")
            .classed("material-icons mdc-top-app-bar__action-item mdc-icon-button", true)
            .text(matIconName);
        newButton.on("click", () => callbackFunc(newButton));
    }

    /**
     *
     * @returns {d3.Selection} {@link PaneComponent#paneBodySel} . Used by other classes to populate its contents
     */
    getPaneBodySel() {
        return this.paneBodySel;
    }

    setPanePinned(willBePinnedQ) {
        this.isPinnedQ = willBePinnedQ;
    }

    closeIfUnpinned() {
        if(!this.isPinnedQ) this.close();
    }

    /**
     * Close the pane (without destroying/modifying its contents).
     * But first change styling in addition to the automatic style changes triggered by {@link MDCMenuSurface.close}
     * and set it to non-pinned by convention (functionally not important)
     *
     * @param {boolean} force - skip check to see if menu is open first
     */
    close(force= false) {
        if(this.menuSurfaceComp.isOpen() || force) {
            this.menuSurfaceComp.close();
            this.menuAnchor.classed("search-pane-opened", false);
            this.menuAnchor.classed("search-pane-closed", true);
            this.isPinnedQ = false;
            this.isOpenQ = false;
        }
    }

    /**
     * Open the pane (contents have not been modified since last opened).
     * But first remove additional "close" styling @see {@link PaneComponent.close}
     */
    open() {
        if(this.menuSurfaceComp.isOpen()) return;
        this.menuAnchor.classed("search-pane-closed", false);
        this.menuAnchor.classed("search-pane-opened", true);
        this.menuSurfaceComp.open();
        this.isOpenQ = true;
    }


    /**
     * Sets whether or not dragging is enabled for the pane (drag can be initiated by drag-clicking anywhere on the pane)
     *
     * @param {boolean} allowedQ
     */
    setAllowDragging(allowedQ) {
        if(allowedQ) {
            this.paneBodySel.style("pointer-events", "none");
            this.menuAnchor.classed("drag-interactjs", true)
        } else {
            this.menuAnchor.classed("drag-interactjs", false);
            this.paneBodySel.style("pointer-events", "auto");
        }
    }

    /**
     * Returns whether dragging is allowed
     *
     * @returns {boolean}
     */
    getAllowDragging() {
        return this.menuAnchor.classed("drag-interactjs");
    }
}

export default PaneComponent;