sap.ui.define([
    "bApp/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "bApp/model/formatter",
    "sap/m/MessageToast",
    'sap/ui/core/util/Export',
    'sap/ui/core/util/ExportTypeCSV',
], function (BaseController, JSONModel, formatter, Message, Export, ExportTypeCSV) {
    "use strict";

    return BaseController.extend("bApp.controller.LogBookEval", {

        formatter: formatter,

        onInit: function () {
            //Bind view to controller
            this.oView = this.getView();

            //Set Default Selection Date (Current Year)
            var date = new Date();
            var year = date.getFullYear();

            var oModelSelection = new JSONModel();
            oModelSelection.setData({
                "datab": new Date(year + "-01-01"),
                "datbi": new Date(year + "-12-31")
            });
            this.oView.setModel(oModelSelection, "selection");
            //Select corresponding Data
            var oModelLogs = new JSONModel();
            oModelLogs.setData(this.selectData());
            this.oView.byId("logTable").setModel(oModelLogs, "logs");

        },
        onNavBack: function (oEvent) {
            this.getRouter().navTo("menu", {}, true);
        },
        selectData: function () {
            var selection = this.oView.getModel("selection").getData();
            var oDBData;

            jQuery.ajax({
                type: "GET",
                contentType: "application/json",
                url: "/api/trip/getLogs",
                dataType: "json",
                async: false,
                data: {
                    datab: selection.datab,
                    datbi: selection.datbi
                },
                success: function (data, textStatus, jqXHR) {
                    oDBData = data;
                },
                error: function (err) {
                    Message.show(err);
                }
            });
            return this.prepareOutput(oDBData);
        },
        prepareOutput: function (data) {
/*             var home = false;
            for (var i = 0; i < data.length; i++) {
                if (data[i].bpid == "80000" || data[i].bpid == "10000") {
                    home = true;
                } else {
                    home = false;
                }

                if (data[i].reason == "0002") {
                    if (!home) {
                        data[i].reasonName = "Beratung " + data[i].buPaName;
                    } else {
                        data[i].reasonName = "Geschäflich Heimfahrt";
                    }
                }
            } */
            return data;
        },
        refreshData: function () {
            var oModelLogs = this.oView.byId("logTable").getModel("logs");
            oModelLogs.setData(this.selectData());
        },
        onChangeDateRange: function (oEvent) {
            var newFromDate = oEvent.getParameter("from");
            var newToDate = oEvent.getParameter("to");
            this.oView.getModel("selection").setData({
                "datab": newFromDate,
                "datbi": newToDate
            });
            this.refreshData();
        },
        onListItemPress: function (oEvent) {
            var bindingContext = oEvent.getSource().getBindingContext("logs");
            var viewData = {
                "id": bindingContext.getProperty("id"),
                "bpid": bindingContext.getProperty("bpid"),
                "city": bindingContext.getProperty("city"),
                "name": bindingContext.getProperty("buPaName"),
                "start_date": bindingContext.getProperty("start_date"),
                "end_date": bindingContext.getProperty("end_date"),
                "km_end": bindingContext.getProperty("km_end"),
                "km_traveled": bindingContext.getProperty("km_traveled"),
                "reason": bindingContext.getProperty("reason"),
                "reasonName": bindingContext.getProperty("reasonName"),
                "text": bindingContext.getProperty("text"),
            };

            // create value help dialog
            if (!this._EditTripDialog) {
                this._EditTripDialog = sap.ui.xmlfragment(
                    "bApp.fragments.EditTrip",
                    this
                );

                this._EditTripDialog.setModel(new JSONModel());

                this.getView().addDependent(this._EditTripDialog);
            }
            this._EditTripDialog.getModel().setData(viewData);
            // open value help dialog
            this._EditTripDialog.open();

        },
        onPressSaveDialog: function (oEvent) {
            var data = this._EditTripDialog.getModel().getData();
            var postData = {
                id: data.id,
                start_date: data.start_date,
                end_date: data.end_date,
                km_traveled: data.km_traveled,
                km_end: data.km_end,
                reason: data.reason,
                bpid: data.bpid,
                text: data.text
            };

            jQuery.ajax({
                type: "POST",
                data: JSON.stringify(postData),
                contentType: "application/json",
                url: "/api/trip/updateTrip",
                dataType: "json",
                async: false,
                success: function (data, textStatus, jqXHR) {
                    Message.show("Beleg wurde erfolgreich bearbeitet");
                },
                error: function (err) {}
            });
            this.refreshData();
            oEvent.getSource().getParent().close();
        },
        onPressDeleteDialog: function (oEvent) {
            var data = this._EditTripDialog.getModel().getData();
            var that = this;
            var dialog = new sap.m.Dialog({
                title: 'Löschen?',
                type: 'Message',
                content: new sap.m.Text({
                    text: 'Soll der Beleg wirklich gelöscht werden?'
                }),
                beginButton: new sap.m.Button({
                    text: 'Löschen',
                    press: function () {
                        jQuery.ajax({
                            type: "POST",
                            data: JSON.stringify({
                                "id": data.id
                            }),
                            contentType: "application/json",
                            url: "/api/trip/deleteTrip",
                            dataType: "json",
                            async: false,
                            success: function (data, textStatus, jqXHR) {
                                Message.show("Beleg wurde erfolgreich gelöscht");
                                that._EditTripDialog.close();
                                that.refreshData();
                            },
                            error: function (err) {}
                        });
                        dialog.close();
                    }
                }),
                endButton: new sap.m.Button({
                    text: 'Cancel',
                    press: function () {
                        dialog.close();
                    }
                }),
                afterClose: function () {
                    dialog.destroy();
                }
            });

            dialog.open();
        },
        onPressCloseDialog: function (oEvent) {
            oEvent.getSource().getParent().close();
        },
        handleValueHelp: function (oEvent) {
            this.inputId = oEvent.oSource.sId;
            //*******************************/
            //Country Dialog
            //*******************************/
            if (this.inputId.includes("idReason")) {
                // create value help dialog
                if (!this._valueHelpDialogReason) {
                    this._valueHelpDialogReason = sap.ui.xmlfragment(
                        "bApp.fragments.TripReasonSelect",
                        this
                    );
                    var oModelCat = new JSONModel();
                    this._valueHelpDialogReason.setModel(oModelCat);
                    //Get bp category number
                    jQuery.ajax({
                        type: "GET",
                        contentType: "application/json",
                        url: "/api/trip/getReasons",
                        dataType: "json",
                        async: false,
                        success: function (data, textStatus, jqXHR) {
                            oModelCat.setData(data);
                        },
                        error: function (err) {}
                    });
                    this.getView().addDependent(this._valueHelpDialogReason);
                }
                // open value help dialog
                this._valueHelpDialogReason.open();
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
        _handleValueHelpClose: function (oEvent) {
            var oSelectedItem = oEvent.getParameter("selectedItem");
            if (oSelectedItem) {
                var data = this._EditTripDialog.getModel().getData();
                if (this.inputId.includes("idReason")) {
                    data.reason = oSelectedItem.getProperty("info");
                    data.reasonName = oSelectedItem.getProperty("title");
                }
                if (this.inputId.includes("idBPId")) {
                    data.bpid = oSelectedItem.getProperty("info");
                    data.city = oSelectedItem.getProperty("description");
                }
                this._EditTripDialog.getModel().setData(data);
            }
        },
        handleDateChange: function (oEvent) {
            var newDate = oEvent.getSource().getProperty("dateValue")

            var id = oEvent.getSource().getId();
            var data = this._EditTripDialog.getModel().getData();

            if (id.includes("startDate")) {
                data.start_date = newDate;
            }

            if (id.includes("endDate")) {
                data.end_date = newDate;
            }
            this._EditTripDialog.getModel().setData(data);
        },
        onDownload: function () {
            var data = this.oView.byId("logTable").getModel("logs").getData();
            var myTestXML = new myExcelXML(data);
            myTestXML.downLoad();
        },
        onDataExport: sap.m.Table.prototype.exportData || function (oEvent) {

            var data = this.oView.byId("logTable").getModel("logs").getData();
            for(var i = 0; i< data.length;i++){
                data[i].start_date_ex = formatter.formatDate(data[i].start_date);
                data[i].end_date_ex = formatter.formatDate(data[i].end_date);
            }
            this.oView.byId("logTable").getModel("logs").setData(data);

            var oExport = new Export({

                // Type that will be used to generate the content. Own ExportType's can be created to support other formats
                exportType: new ExportTypeCSV({
                    separatorChar: ";"
                }),

                // Pass in the model created above
                models: this.oView.byId("logTable").getModel("logs"),

                // binding information for the rows aggregation
                rows: {
                    path: "/"
                },

                // column definitions with column name and binding info for the content

                columns: [ {
                    name: "Datum",
                    template: {
                        content: "{end_date_ex}"
                    }
                }, {
                    name: "Gefahrene KM",
                    template: {
                        content: "{km_traveled}"
                    }
                },  {
                    name: "Ziel",
                    template: {
                        content: "{buPaName}"
                    }
                }, {
                    name: "Ort",
                    template: {
                        content: "{city}"
                    }
                }, {
                    name: "Straße",
                    template: {
                        content: "{street}"
                    }
                }, {
                    name: "Bemerkung",
                    template: {
                        content: "{text}"
                    }
                }]
            });

            // download exported file
            oExport.saveFile().catch(function (oError) {
                MessageBox.error("Error when downloading data. Browser might not be supported!\n\n" + oError);
            }).then(function () {
                oExport.destroy();
            });
        }

    });
});