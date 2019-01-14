sap.ui.define([
    "bApp/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "bApp/model/formatter",
    "sap/m/MessageToast"
], function (BaseController,JSONModel,formatter,Message) {
    "use strict";

    return BaseController.extend("bApp.controller.AppMenu", {

        formatter: formatter,

        onInit : function () {

            var oView = this.getView();
            var oModel= this.getOwnerComponent().getModel("menu");
            var oList = oView.byId("idMenuList");

            oList.setModel(oModel);

        },
        onItemPress: function(oEvent){
            Message.show("Hallo");
        }


    });
}
);