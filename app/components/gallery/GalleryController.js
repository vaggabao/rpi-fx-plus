(function () {
    'use strict';
    var controllerId = 'GalleryController';

    function GalleryController(GalleryFactory) {

        var vm = this;

        vm.scrollbar = {
            'config': {
                autoHideScrollbar: true,
                theme: 'rounded',
                advanced:{
                    updateOnContentResize: true
                },
            }
        }
        
        vm.gallery = {
            'loading': true
        }
        vm.cameraRoll = [];
        vm.selectedPhoto = "";
            
        var cameraRollPromise = GalleryFactory.cameraRoll();
        cameraRollPromise.then(function (response) {
            vm.gallery.loading = false;
            if (response !== 0) {
                vm.cameraRoll = response;
                vm.selectedPhoto = response[0];
            }
        });

        vm.selectPhoto = function(photo) {
            vm.selectedPhoto = photo;
        }
    }

    angular
        .module('fxApp.controllers')
        .controller(controllerId, ['GalleryFactory', GalleryController]);
})();