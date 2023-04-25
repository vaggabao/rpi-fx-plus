/**
 * Collection factory
 */
(function () {
    'use strict';
    var factoryId = 'CameraFactory';

    function CameraFactory($q, $http) {

        function print(dataURL) {
            return $q(function(resolve) {
                var printPromise = printHttp(dataURL);
                printPromise
                    .then(function(result) {
                        if (result !== 0)
                            resolve(result);
                        else
                            resolve(0);
                    });
            });
        }

        // Print image API method
        function printHttp(dataURL) {
            return $q(function (resolve, reject) {
                var requestData = {
                    'dataURL': dataURL,
                    'source': "camera"
                };

                $http.post('http://localhost:5000/api/camera/print', requestData)
                    .success(function (result) {
                        resolve(result);
                    })
                    .error(function () {
                        reject(0);
                    })
            });
        }

        return {
            print: function (dataURL) {
                return print(dataURL);
            }
        }
    }

    angular
        .module('fxApp.factories')
        .factory(factoryId, ['$q', '$http', CameraFactory])
})();
