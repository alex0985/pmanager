sap.ui.define([
    "bApp/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "bApp/model/formatter",
    "sap/m/MessageToast"
], function (BaseController, JSONModel, formatter, Message) {
    "use strict";

    return BaseController.extend("bApp.controller.MaintainProduct", {

        formatter: formatter,

        onInit: function () {

        },
        onNavBack: function (oEvent) {
            this.getRouter().navTo("menu", {}, true);
        },
        initDocument: function (oModel) {

        },
        onClickScan: function(oEvent){
            if (!this._scanDialog) {
                this._scanDialog = sap.ui.xmlfragment(
                    "bApp.fragments.BarcodeScanner",
                    this
                );
                this.getView().addDependent(this._scanDialog);
            }
            // open value help dialog
            this._scanDialog.open();
        }

    });
});