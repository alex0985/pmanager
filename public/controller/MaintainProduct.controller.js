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
            var oModel = new JSONModel();  
            this.oView = this.getView();
            this.oView.setModel(oModel);
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
        },
        onPressCloseDialog: function(oEvent){
            oEvent.getSource().getParent().close();
        }
    });
});