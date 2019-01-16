sap.ui.define([
    "bApp/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "bApp/model/formatter",
    "sap/m/MessageToast"
], function (BaseController,JSONModel,formatter,Message) {
    "use strict";

    return BaseController.extend("bApp.controller.AppMenu", {

        formatter: formatter,

        onInit: function () {

            var oView = this.getView();
            var oModel = this.getOwnerComponent().getModel("menu");
            var oList = oView.byId("idMenuList");

            oList.setModel(oModel);

        },
        onItemPress: function (oEvent) {
            var header = oEvent.getParameters().listItem.getTitle();
            switch (header) {
                case "Fahrtenbuch":
                    this.getRouter().navTo("logbook");
                    break;
                case "Partner":
                    this.getRouter().navTo("ccustomer");
                    break;
                case "Belege":
                    this.getRouter().navTo("docs");
                    break;
                case "Belege auswerten":
                    this.getRouter().navTo("doceval");
                    break;
                case "Fahrtenbuch auswerten":
                    this.getRouter().navTo("logeval");
                    break;
                case "Zeiterfassung":
                    this.getRouter().navTo("timerec");
                    break;
                default:
                    Message.show("Not implemented!");
                    break;
            }
        },
        handleNavButtonPress: function () {
            var oSplitApp = this.getView().getParent().getParent();
            var oDetail = oSplitApp.getDetailPages()[0];
            oSplitApp.toDetail(oDetail, "flip");
        }
    });
});