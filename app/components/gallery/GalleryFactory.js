/**
 * Gallery factory
 */
(function () {
    'use strict';
    var factoryId = 'GalleryFactory';

    function GalleryFactory($q, $http, APIHOST) {
        /**
         * Get photos from camera roll
         */
        function cameraRoll() {
            return $q(function (resolve) {
                var cameraPromise = cameraHTTP();
                cameraPromise.then(function(result) {
                    resolve(result);
                }).catch(function(result) {
                    resolve(result);
                });
            });
        }        

        // HTTP request to get camera roll
        function cameraHTTP() {
            return $q(function (resolve, reject) {
                $http.get(APIHOST + '/api/camera-roll/get')
                .success(function (result) {
                    resolve(result);
                })
                .error(function () {
                    reject(0);
                })
            });
        }

        return {
            cameraRoll: function () {
                return cameraRoll();
            }
        }
    }

    angular
        .module('fxApp.factories')
        .factory(factoryId, ['$q', '$http', 'APIHOST', GalleryFactory])
})();