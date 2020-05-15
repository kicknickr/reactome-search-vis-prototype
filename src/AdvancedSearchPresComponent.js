import * as d3 from "d3";

import BaseSearchComponent, {subSearchTypes} from "./BaseSearchComponent";
import CustomMDCChipSetComp from "./CustomMDCChipSetComp";
import CollapsibleSectionsComp from "./CollapsibleSectionsComp";
import {resultsConstraintModeTypes} from "./BaseSearchComponent";
import TabBarComponent from "./TabBarComponent";

import {select, radio, formField} from "material-components-web";
const MDCSelect = select.MDCSelect; const MDCRadio = radio.MDCRadio; const MDCFormField = formField.MDCFormField;

/** @typedef {number} AdvancedSearchPresComponent~advancedPaneTabEnum */
/** @enum {AdvancedSearchPresComponent~advancedPaneTabEnum} */
const advancedPaneTabTypes = {
    QUERY_FILTER: 0,
    RELATIONAL_CONSTRAINT: 1
};

/**
 * TODO
 */
class AdvancedSearchPresComponent {
    /** @description TODO
     * @type {d3.Selection} */
    tabBarAndBody;
    /** @type {function()} */
    updateQueryResultsFunc;
    /** @type {Array<{title: string, iconName: string, elem: d3.Selection}>} */
    tabBodyInfo;
    /** @description {@link BaseSearchComponent.setResultsConstraint}
     * @type {function(BaseSearchComponent~resultsConstraintModeEnum, BaseSearchComponent~subSearchEnum)} */
    setResultsConstraint;

    /**
     * TODO
     *
     * @param {d3.Selection} containerSel - TODO
     * @param {function()} updateQueryResultsFunc - {@link PresentingQueryBasedSearchComp.updateQueryResults}
     * @param {function(BaseSearchComponent~resultsConstraintModeEnum, BaseSearchComponent~subSearchEnum)} setResultsConstraint -
     * {@link AdvancedSearchPresComponent#setResultsConstraint}
     * @param {Array<BaseSearchComponent~subSearchEnum>} validRelationalSearchTypes -
     * An array of valid {@link subSearchTypes} that could be used as a relational constraint for the associated search component.
     */
    constructor(containerSel, updateQueryResultsFunc, setResultsConstraint, validRelationalSearchTypes) {
        this.updateQueryResultsFunc = updateQueryResultsFunc;
        this.setResultsConstraint = setResultsConstraint;
        containerSel.classed("", true);

        this.tabBarAndBody = containerSel.append("div")
            .classed("tab-bar-and-body", true);

        // const footerSel = containerSel.append("div")
        //     .classed("adv-search-footer", true)
        //     .text("TODO - Change to GET_PATHWAYS_CONTAINING_ENTRY")
        //     .on("click", () =>
        //         this.setResultsConstraint(resultsConstraintModeTypes.CONSTRAINT_RES_ONLY, subSearchTypes.GET_PATHWAYS_CONTAINING_ENTRY));

        this.tabBodyInfo = [
            {title: "Query Filters", iconName: "filter_list"},
            {title: "Relational Filters", iconName: "settings_ethernet"}
        ];

        const tabBarElem = this.tabBarAndBody.append("div");

        this.tabBodyInfo.forEach((tabBodyInfo) => tabBodyInfo.elem = this.tabBarAndBody.append("div"));

        const TabBarComp = new TabBarComponent(
            tabBarElem,
            this.tabBodyInfo,
            this.switchTab.bind(this),
            advancedPaneTabTypes.QUERY_FILTER);

        this.renderRelationalSearchChooserComp(validRelationalSearchTypes);

    }

    /**
     *
     * @param {Array<BaseSearchComponent~subSearchEnum>} validRelationalSearchTypes -
     */
    renderRelationalSearchChooserComp(validRelationalSearchTypes) {
        const relationalSearchTabParent = this.tabBodyInfo[1].elem;
        relationalSearchTabParent.selectAll("*").remove();
        const MDCSelectRelationalElem = relationalSearchTabParent
            .classed("mdc-select-custom", true)
            .append("div")
            .classed("mdc-select mdc-select--outlined", true);
        const selectAnchor = MDCSelectRelationalElem.append("div")
            .classed("mdc-select__anchor full-width ", true);
        selectAnchor.append("i").classed("mdc-select__dropdown-icon", true);
        selectAnchor.append("div").classed("mdc-select__selected-text", true);
        const notchedOutline = selectAnchor.append("span").classed("mdc-notched-outline", true);
        notchedOutline.append("span").classed("mdc-notched-outline__leading", true);
        notchedOutline.append("span").classed("mdc-notched-outline__notch", true)
            .append("span").classed("mdc-floating-label", true).text("Pick a Relational Search to further constrain results");
        notchedOutline.append("span").classed("mdc-notched-outline__trailing", true);


        const optionsList = MDCSelectRelationalElem.append("div").classed("mdc-select__menu mdc-menu mdc-menu-surface full-width", true)
            .append("ul").classed("mdc-list", true);

        validRelationalSearchTypes.forEach(/** @type {BaseSearchComponent~subSearchEnum} */(searchType) => {
            optionsList.append("li")
                .classed("mdc-list-item", true)
                .classed("mdc-list-item--selected", searchType === subSearchTypes.NONE)
                .attr("data-value", searchType.key)
                .append("span")
                .classed("mdc-list-item__text", true)
                .text(searchType.name)
        });
        const relationalSearchTypeSelectComp = new MDCSelect(MDCSelectRelationalElem.node());

        const radioForm = relationalSearchTabParent.append("form");
        const radioInputElems = [];
        Object.values(resultsConstraintModeTypes).forEach(
            /** @type {BaseSearchComponent~resultsConstraintModeEnum} */
            (constraintModeTypeInfo) => {
                const MDCFormFieldRelationalModeElem = radioForm.append("div").classed("mdc-form-field mdc-form-field--align-end", true);
                const MDCRadioRelationalModeElem = MDCFormFieldRelationalModeElem.append("div").classed("mdc-radio", true);

                const uniqueID = (Math.random() + "-elem-id").substring(2);
                const radioInputElem = MDCRadioRelationalModeElem.append("input").classed("mdc-radio__native-control", true)
                    .attr("id", uniqueID)
                    .attr("type", "radio")
                    .attr("checked", constraintModeTypeInfo === resultsConstraintModeTypes.OWN_RES_ONLY ? true : null)
                    .attr("name", "radios")
                    .attr("cust-data-value", constraintModeTypeInfo.key);
                const radioBackground = MDCRadioRelationalModeElem.append("div").classed("mdc-radio__background", true);
                radioBackground.append("div").classed("mdc-radio__outer-circle", true);
                radioBackground.append("div").classed("mdc-radio__inner-circle", true);
                MDCRadioRelationalModeElem.append("div").classed("mdc-radio__ripple", true);
                MDCFormFieldRelationalModeElem.append("label").text(constraintModeTypeInfo.name)
                    .attr("for", uniqueID);
                const radioComp = new MDCRadio(MDCRadioRelationalModeElem.node());
                const radioFormFieldComp = new MDCFormField(MDCFormFieldRelationalModeElem.node());
                radioFormFieldComp.input = radioComp;
                radioInputElems.push(radioInputElem);
            });


        const updateRelationalConstraints = () => {
            const relationConstraintMode = resultsConstraintModeTypes[radioInputElems.find((formFieldElem) => formFieldElem.property("checked")).attr("cust-data-value")]
            const relationType = subSearchTypes[relationalSearchTypeSelectComp.value];
            if (relationConstraintMode && relationType && relationType !== subSearchTypes.NONE) {
                this.setResultsConstraint(relationConstraintMode, relationType)
            }
        };
        radioForm.on("click", updateRelationalConstraints);
        MDCSelectRelationalElem.on("MDCSelect:change", updateRelationalConstraints);
    }


    /**
     * TODO
     *
     * @param {PresentingQueryBasedSearchComp~facetInfoObj} facetInfo
     */
    renderCollapsibleSectionsComp(facetInfo) {
        this.facetInfo = facetInfo;
        const collapsibleSectionsParent = this.tabBodyInfo[0].elem;
        collapsibleSectionsParent.classed("adv-search-collapsible-sections-list-parent", true);
        collapsibleSectionsParent.selectAll("*").remove();
        const collapsibleSectionsSel = collapsibleSectionsParent.append("div");
        new CollapsibleSectionsComp(
            collapsibleSectionsSel,
            Array.from(this.facetInfo.values()).map((facetInfo) => {
                const {sectionTitle, facetTypes, userSelectionAllowed} = facetInfo;
                return {
                    title: sectionTitle,
                    callbackForSectionContent: (sectionContentSel) => {
                        const chipSetSel = sectionContentSel.append("div")
                            .classed("interaction-blocked", !userSelectionAllowed);
                        facetInfo.custChipSetComp = new CustomMDCChipSetComp(chipSetSel, this.updateQueryResultsFunc, facetTypes);
                    }
                }
            })
        );
    }

    /**
     * @param {AdvancedSearchPresComponent~advancedPaneTabEnum} tabIndex
     */
    switchTab(tabIndex) {
        this.tabBodyInfo.forEach(({elem: tabBodyElem}, idx) =>
            tabBodyElem.classed("tab-body-unactivated", idx !== tabIndex));
    }

    /**
     *
     * @returns {{type: Set<string>, species: Set<string>, keyword: Set<string>, compartment: Set<string>}}
     */
    getQueryParams() {
        const params = {};
        this.facetInfo.forEach(({facetName, custChipSetComp}) => params[facetName] = new Set(custChipSetComp.getSelectedValues()));
        return params;
    }
}

export default AdvancedSearchPresComponent;