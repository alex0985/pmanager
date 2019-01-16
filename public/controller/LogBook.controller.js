sap.ui.define([
    "bApp/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "bApp/model/formatter",
    "sap/m/MessageToast"
], function (BaseController, JSONModel, formatter, Message) {
    "use strict";

    return BaseController.extend("bApp.controller.LogBook", {

        formatter: formatter,

        onInit: function () {

            //Customer Selector
            var oCustSelector = this.getView().byId("idBPSelect");
            //Get Global Trip Model
            var oModel = this.getOwnerComponent().getModel("trip");
            this.getView().setModel(oModel);

            this.initDocument(oModel);

            jQuery.ajax({
                type: "GET",
                contentType: "application/json",
                url: "/api/trip/getBP",
                dataType: "json",
                async: false,
                success: function (data, textStatus, jqXHR) {
                    var oBPModel = new JSONModel();
                    oBPModel.setData(data);
                    oCustSelector.setModel(oBPModel);
                },
                error: function (err) {}
            });
        },
        onPressPost: function (oEvent) {
            var oModel = this.getView().getModel("trip");
            var oData = oModel.getData();
            var resp = oData.trip;
            var today = new Date();
            var that = this;
            //Datum in der Zukunft nicht möglich
/*             if (resp.end_date > today) {
                Message.show("Ende Datum ist in der Zukunft!");
                return;
            } */
            //Falls nicht berechnet...
            var km_traveled = parseInt(resp.km_traveled, 10);
            var last_trip = parseInt(resp.last_trip, 10);
            var km_end = parseInt(resp.km_end, 10);

            resp.reason = "0002";

            if ((km_traveled + last_trip) !== km_end) {
                resp.km_end = km_traveled + last_trip;
            }

            jQuery.ajax({
                type: "POST",
                data: JSON.stringify(resp),
                contentType: "application/json",
                url: "/api/trip/postTrip",
                dataType: "json",
                async: false,
                success: function (data, textStatus, jqXHR) {
                    Message.show("Beleg " + data.insertId + " wurde erfolgreich gebucht");
                    that.initDocument(oModel);
                },
                error: function (err) {}
            });
        },
        onKmInput: function (oEvent) {
            var oView = this.getView();
            var lastKM = parseInt(oView.byId("idLastKM").getValue(), 10);
            var KmTraveled = parseInt(oView.byId("idKmTraveled").getValue(), 10);
            var KmEnd = parseInt(oView.byId("idKmEnd").getValue(), 10);
            var sourceId = oEvent.getSource().getId();
            if (sourceId.includes("idKmEnd")) {
                KmTraveled = KmEnd - lastKM;
                oView.byId("idKmTraveled").setValue(KmTraveled);
                return;
            }
            if (sourceId.includes("idKmTraveled")) {
                KmEnd = lastKM + KmTraveled;
                oView.byId("idKmEnd").setValue(KmEnd);
                return;
            }
            if (sourceId.includes("idLastKM")) {
                KmEnd = lastKM + KmTraveled;
                oView.byId("idKmEnd").setValue(KmEnd);
                return;
            }
        },
        onSelectReason: function (oEvent) {
            var oData = this.getView().getModel().getData();
            var button = oEvent.getSource();
            oData.trip.reason = button.getProperty("selectedKey");
        },
        onSelectBP: function (oEvent) {
            var bp = oEvent.getParameter("selectedItem").getKey();
            var oData = this.getView().getModel().getData();
            oData.trip.bpid = bp;

            //Customer Selector
            var dCustomer = this.getView().byId("idBPSelect").getModel().getData();
            for (var i = 0; i < dCustomer.length; i++) {
                if (dCustomer[i].bpid == oData.trip.bpid) {
                    oData.trip.km_traveled = dCustomer[i].distance;

                    oData.trip.km_end = oData.trip.km_traveled + oData.trip.last_trip;

                }
            }
        },
        onNavBack: function (oEvent) {
            this.getRouter().navTo("menu", {}, true);
        },
        initDocument: function (oModel) {
            var today = new Date();
            var oData = oModel.getData();
            //Clear KM Traveled
            oData.trip.km_traveled = 0;
            //Set Default Date
            oData.trip.start_date = today;
            oData.trip.end_date = today;
            //Reason default => Private
            oData.trip.reason = '0002';
            //Default Partner
            oData.trip.bpid = '10000';
            this.getView().byId("idBPSelect").setSelectedKey("10000");
            //Default Time
            oData.trip.start_time = '00:00:00';
            oData.trip.end_time = '23:59:59';
            oData.trip.text = '';

            //Get Last Trip
            jQuery.ajax({
                type: "GET",
                contentType: "application/json",
                url: "/api/trip/getLastTrip",
                dataType: "json",
                async: false,
                success: function (data, textStatus, jqXHR) {
                    //oModel.setData(data[0]);
                    if (data.length === 0){
                        oData.trip.last_trip = 0;
                        oData.trip.km_end = 0;
                    } else {
                        oData.trip.last_trip = data[0].km_end;
                        oData.trip.km_end = data[0].km_end;
                    }
                },
                error: function (err) {}
            });
        }
    });
});