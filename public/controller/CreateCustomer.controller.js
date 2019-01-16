sap.ui.define([
    "bApp/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "bApp/model/formatter",
    "sap/m/MessageToast"
], function (BaseController, JSONModel, formatter, Message) {
    "use strict";

    return BaseController.extend("bApp.controller.CreateCustomer", {

        formatter: formatter,

        onInit: function () {
            //View Models
            var oViewModel = new JSONModel();
            var oConditionsModel = new JSONModel();
            this.getView().setModel(oViewModel);
            this.getView().setModel(oConditionsModel, "conditions");

            //Selector
            initDocument(this.getView());
        },
        onPressPost: function (oEvent) {
            var oModel = this.getView().getModel();
            var oView = this.getView();
            var oData = oModel.getData();
            var resp = oData;
            //Ohne Name kein Geschäftspartner
            if (!resp.name) {
                Message.show("Name angeben");
                return;
            }
            //Land ist musseingabe
            if (!resp.country) {
                Message.show("Land angeben");
                return;
            }

            if (!resp.bpid) {
                //Get Next Number
                getNextNumber(oModel);
                resp.bpid = oModel.getData().bpid;

                jQuery.ajax({
                    type: "POST",
                    data: JSON.stringify(resp),
                    contentType: "application/json",
                    url: "/api/bpc/createBP",
                    dataType: "json",
                    async: false,
                    success: function (data, textStatus, jqXHR) {
                        Message.show("Business Partner " + oData.bpid + " wurde erfolgreich angelegt");
                    },
                    error: function (err) {}
                });
            } else {
                jQuery.ajax({
                    type: "POST",
                    data: JSON.stringify(resp),
                    contentType: "application/json",
                    url: "/api/bpc/updateBP",
                    dataType: "json",
                    async: false,
                    success: function (data, textStatus, jqXHR) {
                        Message.show("Business Partner " + oData.bpid + " wurde erfolgreich bearbeitet");
                    },
                    error: function (err) {}
                });
            }
            initDocument(oView);
        },
        onCatInput: function (oEvent) {
            var cat = oEvent.getParameter("selectedItem").getKey();
            var oData = this.getView().getModel().getData();
            oData.category = cat;

            if (cat == "0001") { //Kunde
                this.getView().byId("coditionTable").setVisible(true);
            } else {
                this.getView().byId("coditionTable").setVisible(false);
            }
        },
        _handleValueHelpSearch: function (evt) {
            var sValue = evt.getParameter("value");
            var oFilterCID = new sap.ui.model.Filter(
                "country",
                sap.ui.model.FilterOperator.Contains, sValue
            );
            var oFilterCName = new sap.ui.model.Filter(
                "country_name",
                sap.ui.model.FilterOperator.Contains, sValue
            );
            var oMainFilter = new sap.ui.model.Filter({
                filters: [oFilterCID, oFilterCName],
                and: false
            });
            evt.getSource().getBinding("items").filter([oMainFilter]);
        },
        _handleValueHelpClose: function (oEvent) {
            var oView = this.getView();
            var oSelectedItem = oEvent.getParameter("selectedItem");

            if (this.inputId.includes("idInCountry")) {
                var textCountryName = this.getView().byId("idCountryName");
                if (oSelectedItem) {
                    textCountryName.setText(oSelectedItem.getProperty("description"));
                    var category = this.byId(this.inputId);
                    category.setValue(oSelectedItem.getTitle());
                }
                oEvent.getSource().getBinding("items").filter([]);
            }

            if (this.inputId.includes("idBPId")) {

                if (oSelectedItem) {
                    var value = oSelectedItem.getProperty("info");
                    getBusinessPartner(value, oView, Message);
                }
            }
        },
        onSubmit: function (oEvent) {
            this.inputId = oEvent.oSource.sId;
            var oView = this.getView();
            var value = oEvent.getParameter("value");
            //*******************************/
            //Country
            //*******************************/
            if (this.inputId.includes("idInCountry")) {
                var textCountryName = this.getView().byId("idCountryName");
                //Get bp category number
                jQuery.ajax({
                    type: "GET",
                    contentType: "application/json",
                    url: "/api/bpc/getCountry",
                    dataType: "json",
                    async: false,
                    success: function (data, textStatus, jqXHR) {
                        for (var i = 0; i < data.length; i++) {
                            if (data[i].country == value || data[i].country_name == value) {
                                textCountryName.setText(data[i].country_name);
                                return;
                            }
                        }
                    },
                    error: function (err) {}
                });
            }
            if (this.inputId.includes("idBPId")) {
                //Get bp category number
                getBusinessPartner(value, oView, Message);
            }
        },
        handleValueHelp: function (oEvent) {
            this.inputId = oEvent.oSource.sId;
            //*******************************/
            //Country Dialog
            //*******************************/
            if (this.inputId.includes("idInCountry")) {
                // create value help dialog
                if (!this._valueHelpDialog) {
                    this._valueHelpDialog = sap.ui.xmlfragment(
                        "bApp.fragments.CountrySelect",
                        this
                    );
                    var oModelCat = new JSONModel();
                    this._valueHelpDialog.setModel(oModelCat);
                    //Get bp category number
                    jQuery.ajax({
                        type: "GET",
                        contentType: "application/json",
                        url: "/api/bpc/getCountry",
                        dataType: "json",
                        async: false,
                        success: function (data, textStatus, jqXHR) {
                            oModelCat.setData(data);
                        },
                        error: function (err) {}
                    });
                    this.getView().addDependent(this._valueHelpDialog);
                }
                // open value help dialog
                this._valueHelpDialog.open();
            }
            //****************************** */
            //Business Partner Dialog
            //****************************** */
            if (this.inputId.includes("idBPId")) {
                // create value help dialog
                if (!this._valueHelpDialogBP) {
                    this._valueHelpDialogBP = sap.ui.xmlfragment(
                        "bApp.fragments.CustomerSelect",
                        this
                    );
                    var oModelBP = new JSONModel();
                    this._valueHelpDialogBP.setModel(oModelBP);
                    //Get bp category number
                    jQuery.ajax({
                        type: "GET",
                        contentType: "application/json",
                        url: "/api/trip/getBP",
                        dataType: "json",
                        async: false,
                        success: function (data, textStatus, jqXHR) {
                            oModelBP.setData(data);
                        },
                        error: function (err) {}
                    });
                    this.getView().addDependent(this._valueHelpDialogBP);
                }
                // open value help dialog
                this._valueHelpDialogBP.open();
            }
        },
        onNavBack: function (oEvent) {
            var oView = this.getView();
            initDocument(oView);
            this.getRouter().navTo("menu", {}, true);
        }
    });
});

function getNextNumber(oModel) {
    var oData = oModel.getData();
    jQuery.ajax({
        type: "GET",
        contentType: "application/json",
        url: "/api/bpc/getNext",
        dataType: "json",
        async: false,
        success: function (data, textStatus, jqXHR) {
            oData.bpid = data;
        },
        error: function (err) {}
    });
}

function getBusinessPartner(value, oView, Message) {
    var oViewData = oView.getModel().getData();
    jQuery.ajax({
        type: "GET",
        contentType: "application/json",
        url: "/api/trip/getBP",
        dataType: "json",
        async: false,
        success: function (data, textStatus, jqXHR) {
            var custAv = false;
            for (var i = 0; i < data.length; i++) {
                if (data[i].bpid == value) {
                    custAv = true;
                    oViewData.bpid = data[i].bpid;
                    oViewData.category = data[i].category;
                    oViewData.name = data[i].name;
                    oViewData.email = data[i].email;
                    oViewData.phone = data[i].phone;
                    oViewData.ustid = data[i].ustid;
                    oViewData.street = data[i].street;
                    oViewData.city = data[i].city;
                    oViewData.postcode = data[i].postcode;
                    oViewData.country = data[i].country;
                    oViewData.distance = data[i].distance;
                }
            }
            //Business Partner not found
            if (!custAv) {
                oViewData.bpid = "";
                oViewData.name = "";
                oViewData.email = "";
                oViewData.phone = "";
                oViewData.ustid = "";
                oViewData.street = "";
                oViewData.city = "";
                oViewData.postcode = "";
                oViewData.country = "";
                oViewData.distance = "";
                Message.show("Business Partner nicht vorhanden.");
            } else {
                oView.getModel().setData(oViewData);
            }
        },
        error: function (err) {}
    });
}

function initDocument(oView) {
    var oViewData = oView.getModel().getData();
    oViewData.bpid = "";
    oViewData.name = "";
    oViewData.category = "0001";
    oViewData.shortname = "";
    oViewData.email = "";
    oViewData.phone = "";
    oViewData.ustid = "";
    oViewData.street = "";
    oViewData.city = "";
    oViewData.postcode = "";
    oViewData.country = "DE";
    oViewData.distance = "";
    oView.getModel().setData(oViewData);

    var oConditionData = oView.getModel("conditions").getData();
    for (var i = 0; i < oConditionData.length; i++) {
        oConditionData[i].bpid = "";
        oConditionData[i].price = 0;
        oConditionData[i].per = 0;
    }
    oView.getModel("conditions").setData(oConditionData);
}