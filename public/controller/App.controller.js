sap.ui.define([
    "bApp/controller/BaseController",
    "sap/ui/model/json/JSONModel"
], function (BaseController, JSONModel) {
    "use strict";

    return BaseController.extend("bApp.controller.App", {

        onInit : function () {
            if(jQuery.device.is.phone){
                var app = this.getView().byId("app");
                app.setMode("PopoverMode");
            }

            var oViewModel,
                fnSetAppNotBusy,
                iOriginalBusyDelay = this.getView().getBusyIndicatorDelay();

            oViewModel = new JSONModel({
                busy : false,
                delay : 0
            });
            this.setModel(oViewModel, "appView");

            fnSetAppNotBusy = function() {
                oViewModel.setProperty("/busy", false);
                oViewModel.setProperty("/delay", iOriginalBusyDelay);
            };

            var model =  this.getOwnerComponent().getModel();
           // model.metadataLoaded().then(fnSetAppNotBusy);

            // apply content density mode to root view
            this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());
        }
    });

}
);