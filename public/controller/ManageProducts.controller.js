sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"bApp/controller/BaseController",
	'sap/m/MessageToast',
	'bApp/model/formatter',
	'sap/ui/core/util/Export',
	'sap/ui/core/util/ExportTypeCSV',
], function (JSONModel, BaseController, MessageBox, formatter, Export, ExportTypeCSV) {
	"use strict";

	return BaseController.extend("bApp.controller.TimeRecEval", {

		formatter: formatter,

		onInit: function () {
			this.oView = this.getView();
			this._bDescendingSort = false;
			this.oProductTable = this.oView.byId("productTable");

			var oProductsModel = new sap.ui.model.json.JSONModel();
			var oTotalModels = new sap.ui.model.json.JSONModel();

			var oDBData = this.getData();
			oProductsModel.setData(oDBData);
			oTotalModels.setData(this.calcTotals(oDBData));


			this.getView().setModel(oProductsModel, 'products');
			this.getView().setModel(oTotalModels, 'totals');
		},
		getData: function () {
			var oDBData;
			jQuery.ajax({
				type: "GET",
				contentType: "application/json",
				url: "/api/products/getProducts",
				dataType: "json",
				async: false,
				success: function (data, textStatus, jqXHR) {
					oDBData = data;
				},
				error: function (err) {}
			});
			return oDBData;
		},
		calcTotals: function (data) {
			var totals = {
				count: 0,
				stock: 0,
				nostock: 0
			};
			data.forEach(element => {
				++totals.count;
				if (element.stock > 0) {
					++totals.stock;
				} else {
					++totals.nostock;
				}
			});
			return totals;
		},
		onChangeDateRange: function (oEvent) {
			var newFromDate = oEvent.getParameter("from");
			var newToDate = oEvent.getParameter("to");
			var oDBData = this.getData(newFromDate, newToDate);

			//aktualisiere Daten
			this.oView.getModel("timerecords").setData(oDBData);
		},
		onSearch: function (oEvent) {
			var sQuery = oEvent.getParameter("query");
			var aFullFilter = [];
			if (sQuery && sQuery.length > 0) {
				//create Filter Object
				var oFilterName = new sap.ui.model.Filter("name", sap.ui.model.FilterOperator.Contains, sQuery);
				var oFilterAmaz = new sap.ui.model.Filter("amazonName", sap.ui.model.FilterOperator.Contains, sQuery);
				var oFilterDate = new sap.ui.model.Filter("eannr", sap.ui.model.FilterOperator.Contains, sQuery);

				var oMainFilter = new sap.ui.model.Filter({
					filters: [oFilterName,oFilterAmaz,oFilterDate],
					and: false
				});
				//Create Array for FIlter
				aFullFilter = [oMainFilter];
			}

			this.oProductTable.getBinding("items").filter(aFullFilter);
		},
		onNavBack: function (oEvent) {
			this.getRouter().navTo("menu", {}, true);
		},
		onSort: function () {
			this._bDescendingSort = !this._bDescendingSort;
			var oBinding = this.oProductTable.getBinding("items"),
				oSorter = new Sorter("stock", this._bDescendingSort);
			oBinding.sort(oSorter);
		},
		onListItemPress: function (oEvent) {

			var oBindingContext = oEvent.getSource().getBindingContext("products");
			// create value help dialog
			if (!this._maintainProductDialog) {
				this._maintainProductDialog = sap.ui.xmlfragment(
					"bApp.fragments.MaintainProductDialog",
					this
				);
				var oModelCat = new JSONModel();
				this._maintainProductDialog.setModel(oModelCat);
				this.getView().addDependent(this._maintainProductDialog);
			}

			this._maintainProductDialog.getModel().setData(oBindingContext.getObject());

			// open value help dialog
			this._maintainProductDialog.open();
		},
		onPressCloseDialog: function (oEvent) {
			oEvent.getSource().getParent().close();
		},
		refreshProducts: function () {
			var oDBData = this.getData();
			this.getView().getModel('products').setData(oDBData);
			this.getView().getModel('totals').setData(this.calcTotals(oDBData));
		},
		onPressSaveDialog: function (oEvent) {
			var viewData = this._maintainProductDialog.getModel().getData();
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
						MessageBox.show("Produkt " + data.insertId + " wurde erfolgreich angelegt");
						that.refreshProducts();
						that._maintainProductDialog.close();
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
						MessageBox.show("Produkt " + post.id + " wurde erfolgreich bearbeitet");
						that.refreshProducts();
						that._maintainProductDialog.close();
					},
					error: function (err) {}
				});
			}
		},
		onPressDeleteDialog: function (oEvent) {
			var data = this._maintainProductDialog.getModel().getData();
			var that = this;
            var dialog = new sap.m.Dialog({
                title: 'Löschen?',
                type: 'Message',
                content: new sap.m.Text({
                    text: 'Soll der Artikel wirklich gelöscht werden?'
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
                            url: "/api/products/deleteProduct",
                            dataType: "json",
                            async: false,
                            success: function (data, textStatus, jqXHR) {
                                MessageBox.show("Artikel wurde erfolgreich gelöscht");
                                that._maintainProductDialog.close();
                                that.refreshProducts();
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
		handleIconTabBarSelect: function (oEvent) {
			var key = oEvent.getParameter("key");
			//create Filter Object

			var aFullFilter = [];
			switch (key) {
				case "stock":
					var oFilter = new sap.ui.model.Filter("stock", sap.ui.model.FilterOperator.GT, 0);
					aFullFilter.push(oFilter);
					break;
				case "nostock":
					var oFilterNull = new sap.ui.model.Filter("stock", sap.ui.model.FilterOperator.EQ, null);

					var oFilter0 = new sap.ui.model.Filter("stock", sap.ui.model.FilterOperator.EQ, 0);

					var oMainFilter = new sap.ui.model.Filter({
						filters: [oFilterNull, oFilter0],
						and: false
					});

					aFullFilter.push(oMainFilter);
					break;
				case "all":

					break;
				default:
					break;
			}
			this.oProductTable.getBinding("items").filter(aFullFilter);
		},
		handleLinkPress: function (oEvent) {
			var viewData = this._maintainProductDialog.getModel().getData();
			var ean = "";
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
		onDataExport: sap.m.Table.prototype.exportData || function (oEvent) {
			var data = this.getView().getModel('products').getData();

			var oExportModel = new JSONModel();
			oExportModel.setData(data);

			var oExport = new Export({

				// Type that will be used to generate the content. Own ExportType's can be created to support other formats
				exportType: new ExportTypeCSV({
					separatorChar: ";"
				}),

				// Pass in the model created above
				models: oExportModel,

				// binding information for the rows aggregation
				rows: {
					path: "/"
				},

				// column definitions with column name and binding info for the content
				columns: [{
					name: "ID",
					template: {
						content: "{id}"
					}
				}, {
					name: "EAN Nummer",
					template: {
						content: "{eannr}"
					}
				}, {
					name: "Name",
					template: {
						content: "{name}"
					}
				}, {
					name: "Amazon Name",
					template: {
						content: "{amazonName}"
					}
				}, {
					name: "Amazon Preis",
					template: {
						content: "{amazonPrice}"
					}
				}, {
					name: "EK Preis",
					template: {
						content: "{ekprice}"
					}
				}, {
					name: "Bestand",
					template: {
						content: "{stock}"
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