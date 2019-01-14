sap.ui.define([
    "bApp/controller/BaseController"
], function (BaseController) {
    "use strict";

    return BaseController.extend("bApp.controller.NotFound", {

        /**
         * Navigates to the worklist when the link is pressed
         * @public
         */
        onLinkPressed : function () {
            this.getRouter().navTo("worklist");
        }

    });

}
);