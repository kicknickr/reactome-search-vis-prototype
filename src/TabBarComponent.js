import * as d3 from "d3";
import {event as currentEvent} from "d3-selection";

import {tabBar} from "material-components-web";
const MDCTabBar = tabBar.MDCTabBar;

/**
 * Called when a tab is selected with the argument of the tab's index
 *
 * @callback TabBarComponent~onTabSelectionCb
 * @param {number} tabIndex - index of the selected tab
 * @returns {void}
 */
/**
 * A generic tab component TODO
 *
 */
class TabBarComponent {

    /**
     * TODO
     *
     * @param {d3.Selection} containerElem -
     * @param {Array<{title: string, iconName: ?string}>} tabHeadersInfo
     * @param {number} defaultActiveIndex -
     * @param {TabBarComponent~onTabSelectionCb} onTabSelectionCb - TODO
     */
    constructor(containerElem, tabHeadersInfo, onTabSelectionCb, defaultActiveIndex = 0) {
        const tabBar = containerElem.append("div")
            .classed("mdc-tab-bar", true)
            .attr("role", "tablist")
            .on("MDCTabBar:activated", () => onTabSelectionCb(currentEvent.detail.index));
        const   tabScroller = tabBar
            .append("div").classed("mdc-tab-scroller", true)
            .append("div").classed("mdc-tab-scroller__scroll-area", true)
            .append("div").classed("mdc-tab-scroller__scroll-content", true);
        tabHeadersInfo.forEach((tabHeaderInfo) => {
           const button = tabScroller.append("button")
               .classed("mdc-tab mdc-tab--min-width mdc-tab--stacked", true)
               .attr("role", "tab");
           const buttonContent = button.append("div")
               .classed("mdc-tab__content", true);
            buttonContent.append("span")
                .classed("mdc-tab__icon material-icons", true)
                .attr("aria-hidden", true)
                .text(tabHeaderInfo.iconName);
            buttonContent.append("span")
                .classed("mdc-tab__text-label", true)
                .text(tabHeaderInfo.title);
            button.append("span")
                .classed("mdc-tab-indicator", true)
                .append("span")
                .classed("mdc-tab-indicator__content mdc-tab-indicator__content--underline", true);
            button.append("span")
                .classed("mdc-tab__ripple", true);
        });

        const MDCTabBarComp = new MDCTabBar(tabBar.node());
        MDCTabBarComp.activateTab(defaultActiveIndex);
    }
}

export default TabBarComponent;