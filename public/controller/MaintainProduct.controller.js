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
        onEANInput: function(oEvent){
            
        },
        onClickScan: function(oEvent){
            if (!this._scanDialog) {
                this._scanDialog = sap.ui.xmlfragment(
                    "bApp.fragments.BarcodeScanner",
                    this
                );
                this.getView().addDependent(this._scanDialog);
            }
/*             // Content width
            var width = window.innerWidth + "px";
            var height = window.innerWidth + "px";
            this._scanDialog.setContentWidth(width);
            this._scanDialog.setContentHeight(height); */
            // open value help dialog
            this._scanDialog.open();
        },
        onPressCloseDialog: function(oEvent){
            oEvent.getSource().getParent().close();
        },
        onPressAmazon: function(oEvent){
            var ean = this.getView().byId("idEAN").getValue();
            
            var oModel = this.getView().getModel();
            var viewData = oModel.getData();
            if(!ean || ean == ""){
                Message.show("EAN Nummer eingeben!");
                return;
            }

            jQuery.ajax({
                type: "GET",
                contentType: "application/json",
                url: "/api/webscrap/amazon",
                dataType: "json",
                data: {
                    eannr: ean
                },
                async: false,
                success: function (data, textStatus, jqXHR) {
                    viewData.amazonName = "";
                    viewData.amazonPrice = "";
                    if(data.name){
                        viewData.amazonName = data.name;
                    }
                    if(data.price){
                        viewData.amazonPrice = data.price;
                    }
                    oModel.setData(viewData);
                },
                error: function (err) {}
            });
        }
    });
});