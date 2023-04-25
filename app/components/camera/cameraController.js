(function () {
    'use strict';
    var controllerId = 'CameraController';

    function CameraController(CameraFactory) {
        var vm = this;
        // Initialize printer
        vm.printer = {
            'status': 1,
            'printCount': 0,
            'spoolCount': 0,
            'failedCount': 0,
            'processedCount': 0,
            'data': []
        };
        vm.photoDataURL = "";
        
		var canvas = document.querySelector('#camera-stream');
		var ctx = canvas.getContext('2d');
		ctx.fillStyle = '#444';
		ctx.fillText('Loading...', canvas.width/2-30, canvas.height/3);

		// Setup the WebSocket connection and start the player
		var client = new WebSocket('ws://127.0.0.1:8084/');
		var player = new jsmpeg(client, {canvas:canvas});

        // capture photo
        vm.capture = function() {
            var photoCanvas = document.querySelector('#snapshot');
            if (!photoCanvas) return;

            photoCanvas.width = canvas.width;
            photoCanvas.height = canvas.height;
            var ctx = photoCanvas.getContext('2d');
            var idata = getVideoData(0, 0, photoCanvas.width, photoCanvas.height);
            ctx.putImageData(idata, 0, 0);
            vm.photoDataURL = photoCanvas.toDataURL().split(',')[1];
        };

        // print captured photo
        vm.print = function() {
            vm.printer.status = 0;
            var printPromise = CameraFactory.print(vm.photoDataURL);

            printPromise
                .then(function(result) {
                    if (result !== 0)
                        alert(result.message);                        
                    else
                        alert("Failed to add the image to printing queue.");
                });
        };

        // clear captured photo
        vm.clear = function() {
            vm.photoDataURL = "";
        };

        // get video data
        var getVideoData = function getVideoData(x, y, w, h) {
            var hiddenCanvas = document.createElement('canvas');
            hiddenCanvas.width = canvas.width;
            hiddenCanvas.height = canvas.height;
            var ctx = hiddenCanvas.getContext('2d');
            ctx.drawImage(canvas, 0, 0, canvas.width, canvas.height);
            return ctx.getImageData(x, y, w, h);
        };
    }

    angular
        .module('fxApp.controllers')
        .controller(controllerId, ['CameraFactory', CameraController]);
})();
