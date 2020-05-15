import * as d3 from "d3";
import {event as currentEvent} from "d3";
import {list, ripple, menuSurface} from "material-components-web";
const MDCList = list.MDCList; const MDCRipple = ripple.MDCRipple; const MDCMenuSurface = menuSurface.MDCMenuSurface;

/** Creates a {@link MDCMenuSurface} at the location of the cursor's click,
 * containing a list of menu options derived from listEntries
 * Uses material design components throughout
 *
 * @param {d3.Selection} parentElem
 * @param {Array<{onClick: function(), iconName: string, text: string, divider: ?boolean}>} listEntries
 * @returns {MDCMenuSurface}
 * @memberof contextMenu
 */
const generateContextMenu = (parentElem, listEntries) => {
    const {pageX: mousePageX, pageY: mousePageY} = currentEvent;

    const menuSurfaceSel = parentElem;
    menuSurfaceSel
        .classed("mdc-menu mdc-menu-surface mdc-menu-surface--fixed", true)
        // .style("position", "fixed")
        .style("max-height", "")
        .on("click", () => {currentEvent.preventDefault();currentEvent.stopPropagation();});

    const menuSurfaceElem = menuSurfaceSel.node();
    const menuSurfaceComp = new MDCMenuSurface(menuSurfaceElem);
    menuSurfaceComp.setAbsolutePosition(currentEvent.pageX, currentEvent.pageY);

    const listSel = menuSurfaceSel.append("ul")
        .classed("mdc-list", true)
        .attr("role", "menu");
    const listComp = new MDCList(listSel.node());

    for (const listEntry of listEntries) {
        if (listEntry.divider) {
            listSel
                .append("li")
                .classed("mdc-list-divider", true)
                .attr("role", "divider");
            continue;
        }
        const li = listSel
            .append("li")
            .classed("mdc-list-item", true)
            .attr("role", "menuitem")
            .attr("tabindex", 0);
        if (listEntry.onClick) li.on("click", () => {
            listEntry.onClick();
            menuSurfaceComp.close();
        });
        else li.classed("mdc-list-item--disabled", true);
        if (listEntry.iconName) {
            li
                .append('i')
                .classed("material-icons mdc-list-item__graphic", true)
                .html(listEntry.iconName);
        }
        li
            .append("span")
            .classed("mdc-list-item__text", true)
            .html(listEntry.text);
    }
    listComp.listElements.forEach((listItemEl) => new MDCRipple(listItemEl));
    menuSurfaceComp.open();
    return menuSurfaceComp;
};

export {generateContextMenu};