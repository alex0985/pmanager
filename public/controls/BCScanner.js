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
                content: "<div id='" + this._sContainerId + "'> <div id='barcode-scanner'><video class='videoCapture' src=''></video><canvas class='drawingBuffer'></canvas></div> </div>"
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

            that.initCameraSelection();
            //that.checkCapabilities();

            Quagga.init({
                inputStream: {
                    name: "Live",
                    type: "LiveStream",
                    target: document.querySelector("#" + this._sContainerId),
                    constraints: {
                        width: {
                            min: 640
                        },
                        height: {
                            min: 480
                        },
                        aspectRatio: {
                            min: 1,
                            max: 100
                        },
                        facingMode: "environment"
                    },
                },
                locator: {
                    patchSize: "medium",
                    halfSample: true
                },
                numOfWorkers: 2,
                locate: true,
                decoder: {
                    readers: [
                        //  "code_128_reader",
                        "ean_reader"
                        //   "ean_8_reader",
                        //   "code_39_reader",
                        //     "code_39_vin_reader",
                        //    "codabar_reader",
                        //    "upc_reader",
                        //   "upc_e_reader",
                        //    "i2of5_reader"
                    ],
                    debug: {
                        showCanvas: false,
                        showPatches: false,
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
                            Quagga.ImageDebug.drawPath(box, {
                                x: 0,
                                y: 1
                            }, drawingCtx, {
                                color: "green",
                                lineWidth: 2
                            });
                        });
                    }

                    if (result.box) {
                        Quagga.ImageDebug.drawPath(result.box, {
                            x: 0,
                            y: 1
                        }, drawingCtx, {
                            color: "#00F",
                            lineWidth: 2
                        });
                    }

                    if (result.codeResult && result.codeResult.code) {
                        Quagga.ImageDebug.drawPath(result.line, {
                            x: 'x',
                            y: 'y'
                        }, drawingCtx, {
                            color: 'red',
                            lineWidth: 3
                        });
                    }
                }
            });

            var scans = [];
            Quagga.onDetected(function (result) {
                console.log("Barcode detected and processed : [" + result.codeResult.code + "]", result);
                var scanned = {};
                var found = false;
                for (var i = 0; i < scans.length; i++) {
                    if (scans[i].code && scans[i].code == result.codeResult.code) {
                        found = true;
                        scans[i].counter++;
                        break;
                    }
                }
                if (!found) {
                    scanned = {
                        code: result.codeResult.code,
                        counter: 1
                    };
                    scans.push(scanned);
                }
                // Erst nach 3 gleichen treffern
                for (var i = 0; i < scans.length; i++) {
                    if (scans[i].counter >= 3) {
                        that._scannerIsRunning = false;
                        Quagga.stop();
                        //getView setData
                        var oView = that.getParent().getParent();
                        var data = oView.getModel().getData();
                        data.eannr = result.codeResult.code;
                        oView.getModel().setData(data);
                        //Close Dialog
                        that.getParent().close();
                        break;
                    }
                }
            });
        },
        initCameraSelection: function () {
            var streamLabel = Quagga.CameraAccess.getActiveStreamLabel();

            return Quagga.CameraAccess.enumerateVideoDevices()
                .then(function (devices) {
                    function pruneText(text) {
                        return text.length > 30 ? text.substr(0, 30) : text;
                    }
                });
        }
    });
});