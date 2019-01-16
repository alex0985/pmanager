// Add all JavaScript includes here
//jQuery.sap.registerModulePath('q', 'libs/quagga');
//jQuery.sap.declare("bApp/libs/quagga");

sap.ui.define([
    'sap/ui/core/Control',
    'Quagga'
], function (Control, Quagga) {
    'use strict';
    return Control.extend("bApp.controls.BCScanner", {
        metadata: {
            properties: {
                width: {
                    type: "sap.ui.core.CSSSize", //this is optional, but it helps prevent errors in your code by enforcing a type
                    defaultValue: "400px" //this is also optional, but recommended, as it prevents your properties being null
                }
            },
            aggregations: {
                _html: {
                    type: "sap.ui.core.HTML",
                    multiple: false,
                    visibility: "hidden"
                },
                data: {
                    type: "sap.ui.base.ManagedObject"
                }
            }
        },
        init: function () {
            this._sContainerId = this.getId() + "--container";
            this.setAggregation("_html", new sap.ui.core.HTML({
                content: "<div id='" + this._sContainerId + "'></div>"
            }));
        },
        renderer: function (oRm, oControl) {
            oRm.write("<div");
            oRm.writeControlData(oControl);
            oRm.write(">");
            oRm.renderControl(oControl.getAggregation("_html"));
            oRm.write("</div>");
        },
        onAfterRendering: function () {
            var that = this;
            Quagga.init({
                inputStream: {
                    name: "Live",
                    type: "LiveStream",
                    target: document.querySelector("#" + this._sContainerId),
                    constraints: {
                        width: 480,
                        height: 320,
                        facingMode: "environment"
                    },
                },
                decoder: {
                    readers: [
                        "code_128_reader",
                        "ean_reader",
                        "ean_8_reader",
                        "code_39_reader",
                        "code_39_vin_reader",
                        "codabar_reader",
                        "upc_reader",
                        "upc_e_reader",
                        "i2of5_reader"
                    ],
                    debug: {
                        showCanvas: true,
                        showPatches: true,
                        showFoundPatches: true,
                        showSkeleton: true,
                        showLabels: true,
                        showPatchLabels: true,
                        showRemainingPatchLabels: true,
                        boxFromPatches: {
                            showTransformed: true,
                            showTransformedBox: true,
                            showBB: true
                        }
                    }
                },
            }, function (err) {
                if (err) {
                    console.log(err);
                    return;
                }
                console.log("Initialization finished. Ready to start");
                Quagga.start();
                // Set flag to is running
                that._scannerIsRunning = true;
            });

            Quagga.onProcessed(function (result) {
                var drawingCtx = Quagga.canvas.ctx.overlay,
                drawingCanvas = Quagga.canvas.dom.overlay;

                if (result) {
                    if (result.boxes) {
                        drawingCtx.clearRect(0, 0, parseInt(drawingCanvas.getAttribute("width")), parseInt(drawingCanvas.getAttribute("height")));
                        result.boxes.filter(function (box) {
                            return box !== result.box;
                        }).forEach(function (box) {
                            Quagga.ImageDebug.drawPath(box, { x: 0, y: 1 }, drawingCtx, { color: "green", lineWidth: 2 });
                        });
                    }

                    if (result.box) {
                        Quagga.ImageDebug.drawPath(result.box, { x: 0, y: 1 }, drawingCtx, { color: "#00F", lineWidth: 2 });
                    }

                    if (result.codeResult && result.codeResult.code) {
                        Quagga.ImageDebug.drawPath(result.line, { x: 'x', y: 'y' }, drawingCtx, { color: 'red', lineWidth: 3 });
                    }
                }
            });

            Quagga.onDetected(function (result) {
                console.log("Barcode detected and processed : [" + result.codeResult.code + "]", result);
                that._scannerIsRunning = false;
                Quagga.stop();
            });


        }
    });
});