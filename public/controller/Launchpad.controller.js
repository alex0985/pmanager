sap.ui.define([
    "bApp/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "bApp/model/formatter",
    "sap/m/MessageToast"
], function (BaseController, JSONModel, formatter, Message) {
    "use strict";

    return BaseController.extend("bApp.controller.Launchpad", {
        formatter: formatter,
        onInit: function () {
/*             var oFlexMasterData = this.getView().byId("idBoxMasterData");
            var oFlexTransactionalData = this.getView().byId("idBoxMasterData"); */
            var panelMD = this.getView().byId("idPanelMD");
            var panelTD = this.getView().byId("idPanelTD");

            var oView = this.getView();
            var menuData = this.getOwnerComponent().getModel("menu").getData();
            menuData.Menu.forEach(function (element) {
                var title = oView.byId(element.TitlePos);
                if (title) {
                    switch (element.Panel) {
                        case 'MasterData':
                            if (!panelMD.getVisible()) {
                                panelMD.setVisible(true);
                            }
                            break;
                        case 'TransactionalData':
                            if (!panelTD.getVisible()) {
                                panelTD.setVisible(true);
                            }
                            break;
                        default:
                            break;
                    }

                    title.setVisible(true);
                    title.setHeader(element.title);
                    title.setSubheader(element.description);
                    title.addTileContent(new sap.m.TileContent().setContent(new sap.m.ImageContent({
                        src: element.icon
                    })));
                }
            });
        },
        onPress: function (oEvent) {
            var header = oEvent.getSource().getHeader();
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
        onPressLogout: function () {
            var aData = jQuery.ajax({
                type: "GET",
                contentType: "application/json",
                url: "/logout",
                dataType: "json",
                async: false,
                success: function (data, textStatus, jqXHR) {},
                error: function (err) {}
            }).done(window.location.assign('/'));
        }
    });
});