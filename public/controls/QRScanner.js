// Add all JavaScript includes here
//jQuery.sap.registerModulePath('q', 'libs/quagga');
//jQuery.sap.declare("bApp/libs/quagga");

sap.ui.define([
    'sap/ui/core/Control',
    'QRScanner'
], function (Control, QRScanner) {
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
                content: "<div id='" + this._sContainerId + "'> <div id='barcode-scanner'><video class='videoCapture' src=''></video><canvas id='canvas' class='drawingBuffer'></canvas> </div> </div>" +
                         "<div id='output' hidden><div id='outputMessage'>No QR code detected.</div><div hidden><b>Data:</b> <span id='outputData'></span></div></div>"
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
            var video = document.createElement("video");
            var canvasElement = document.getElementById("canvas");
            var canvas = canvasElement.getContext("2d");
            var loadingMessage = document.getElementById(this._sContainerId);
            var outputContainer = document.getElementById("output");
            var outputMessage = document.getElementById("outputMessage");
            var outputData = document.getElementById("outputData");
        
            function drawLine(begin, end, color) {
              canvas.beginPath();
              canvas.moveTo(begin.x, begin.y);
              canvas.lineTo(end.x, end.y);
              canvas.lineWidth = 4;
              canvas.strokeStyle = color;
              canvas.stroke();
            }
        
            // Use facingMode: environment to attemt to get the front camera on phones
            navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } }).then(function(stream) {
              video.srcObject = stream;
              video.setAttribute("playsinline", true); // required to tell iOS safari we don't want fullscreen
              video.play();
              requestAnimationFrame(tick);
            });
        
            function tick() {
              loadingMessage.innerText = "⌛ Loading video..."
              if (video.readyState === video.HAVE_ENOUGH_DATA) {
                loadingMessage.hidden = true;
                canvasElement.hidden = false;
                outputContainer.hidden = false;
        
                canvasElement.height = video.videoHeight;
                canvasElement.width = video.videoWidth;
                canvas.drawImage(video, 0, 0, canvasElement.width, canvasElement.height);
                var imageData = canvas.getImageData(0, 0, canvasElement.width, canvasElement.height);
                var code = jsQR(imageData.data, imageData.width, imageData.height, {
                  inversionAttempts: "dontInvert",
                });
                if (code) {
                  //Close Dialog
                  var dialog = sap.ui.getCore().byId("codeScannerDialog");
                  dialog.close();
                  //Destroy Dialog
                  var oViewController = dialog.getParent().oController;
                  oViewController._scanDialog.destroy();
                  delete oViewController._scanDialog;

                  //Stop Video
                  video.srcObject.getTracks()[0].stop();
                } else {
                  outputMessage.hidden = false;
                  outputData.parentElement.hidden = true;
                }
              }
              requestAnimationFrame(tick);
            }
        }
    });
});