import 'easypz';
import * as d3 from "d3";

import initializeInteractJS from "./InitializeInteractJS";
import PageSwitcher from "./PageSwitcher";
import ReactomeRequestProcessor from "./ReactomeRequestProcessor";
import {event as currentEvent} from "d3-selection";

import * as mdc from "material-components-web";
// mdc.autoInit();

// const MDCMenuSurface = mdc.menuSurface.MDCMenuSurface;

import './styles/scss/app.scss';

// For debugging
window.d3 = d3;

// Place body in arrow function so this module contents are not exposed
(() => {
    initializeInteractJS();
    /** @type {d3.Selection} */
    const appRootElementSel = d3.select("#myAppRoot").on("click", () => {
        // currentEvent.preventDefault();
        // currentEvent.stopPropagation();
    });

    const reactomeRequestProcessor = new ReactomeRequestProcessor();

    const pageSwitcher = new PageSwitcher(appRootElementSel.node(), reactomeRequestProcessor);
    // pageSwitcher.switchPage("aboutPage");
    pageSwitcher.switchPage("DiagramEditorPage");

    console.log("");

})();