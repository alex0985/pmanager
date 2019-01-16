sap.ui.define([
] , function () {
    "use strict";

    return {

        /**
         * Rounds the number unit value to 2 digits
         * @public
         * @param {string} sValue the number string to be rounded
         * @returns {string} sValue with 2 digits rounded
         */
        numberUnit : function (sValue) {
            if (!sValue) {
                return "";
            }
            return parseFloat(sValue).toFixed(2);
        },
        formatDate: function(date) {
            if(date){
                var oDate = new Date(date);

                var dd      = oDate.getDate();
                var mm      = oDate.getMonth() + 1; //January is 0!
                var yyyy    = oDate.getFullYear();
                if (dd < 10) {
                    dd = '0' + dd;
                }
                if (mm < 10) {
                    mm = '0' + mm;
                }
                return dd + '.' + mm + '.' + yyyy;
            }
        }
    };

}
);