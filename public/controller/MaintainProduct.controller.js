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
        initDocument: function () {
            var oModel = this.getView().getModel();
            var viewData = oModel.getData();
            viewData = {};
            oModel.setData(viewData);
        },
        onEANInput: function (oEvent) {
            var ean = oEvent.getSource().getValue();

            if (!ean || ean == "") {
                Message.show("EAN Nummer eingeben!");
            }

            var oModel = this.oView.getModel();
            var viewData = oModel.getData();
            viewData = {};

            jQuery.ajax({
                type: "GET",
                contentType: "application/json",
                url: "/api/products/getProduct",
                dataType: "json",
                data: {
                    eannr: ean
                },
                async: false,
                success: function (data, textStatus, jqXHR) {
                    if (data[0]) {
                        viewData = data[0];
                    } else {
                        viewData.eannr = ean;
                    }

                    oModel.setData(viewData);
                    if (!viewData.id || viewData.id == "") {
                        Message.show("Neuer Artikel");
                    }

                },
                error: function (err) {}
            });
        },
        onClickScan: function (oEvent) {
            if (!this._scanDialog) {
                this._scanDialog = sap.ui.xmlfragment(
                    "bApp.fragments.BarcodeScanner",
                    this
                );
                this.getView().addDependent(this._scanDialog);
            }
            /*          // Content width
                        var width = window.innerWidth + "px";
                        var height = window.innerWidth + "px";
                        this._scanDialog.setContentWidth(width);
                        this._scanDialog.setContentHeight(height); */
            // open value help dialog
            this._scanDialog.open();
        },
        onPressCloseDialog: function (oEvent) {
            oEvent.getSource().getParent().close();
        },
        onPressAmazon: function (oEvent) {
            var ean = this.getView().byId("idEAN").getValue();

            var oModel = this.getView().getModel();
            var viewData = oModel.getData();
            if (!ean || ean == "") {
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
                    if (data.name) {
                        viewData.amazonName = data.name;
                    }
                    if (data.price) {
                        viewData.amazonPrice = data.price;
                    }

                    if (!viewData.amazonName || viewData.amazonName == "") {
                        Message.show("Kein Treffer zur EAN bei Amazon.de");
                    }
                    oModel.setData(viewData);
                },
                error: function (err) {}
            });
        },
        handleLinkPress: function () {
            var viewData = this.oView.getModel().getData();
            if (viewData.amazonName && viewData.amazonName != "") {

                if (viewData.eannr) {
                    ean = viewData.eannr;
                }

                if (ean && ean != "") {
                    var requetLink = "https://www.amazon.de/s/ref=nb_sb_noss?__mk_de_DE=%C3%85M%C3%85%C5%BD%C3%95%C3%91&url=search-alias%3Daps&field-keywords=" + ean;
                    window.open(requetLink);
                }
            }
        },
        onPressSave: function () {
            var viewData = this.oView.getModel().getData();
            var that = this;
            if (!viewData.eannr || viewData.eannr == "") {
                Message.show("EAN Nummer eingeben!");
                return;
            }

            var post = {
                id: viewData.id,
                eannr: viewData.eannr,
                name: viewData.name,
                amazonName: viewData.amazonName,
                amazonPrice: viewData.amazonPrice,
                stock: viewData.stock,
                ekprice: viewData.ekprice,
                text: viewData.text
            };

            // Create or Update?
            if (!viewData.id || viewData.id == "") { //Create new product

                jQuery.ajax({
                    type: "POST",
                    data: JSON.stringify(post),
                    contentType: "application/json",
                    url: "/api/products/createProduct",
                    dataType: "json",
                    async: false,
                    success: function (data, textStatus, jqXHR) {
                        Message.show("Produkt " + data.insertId + " wurde erfolgreich angelegt");
                        that.initDocument();
                    },
                    error: function (err) {}
                });

            } else { //Update existing product

                jQuery.ajax({
                    type: "POST",
                    data: JSON.stringify(post),
                    contentType: "application/json",
                    url: "/api/products/updateProduct",
                    dataType: "json",
                    async: false,
                    success: function (data, textStatus, jqXHR) {
                        Message.show("Produkt " + post.id + " wurde erfolgreich bearbeitet");
                        that.initDocument();
                    },
                    error: function (err) {}
                });
            }
        }
    });
});