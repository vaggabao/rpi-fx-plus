/**
 * Collection factory
 */
(function () {
    'use strict';
    var factoryId = 'CollectionFactory';

    function CollectionFactory($q, $http, APIHOST) {
        /**
         * Save search data and result
         */
        function save(name, searchData, searchResult) {
            var status = 0;
            var instagram_count = searchResult.instagram.data.length;
            var twitter_count = searchResult.twitter.data.length;
            var total_count = instagram_count + twitter_count;

            return $q(function (resolve) {
                var savePromise = saveHttp(name, searchData.hashtag, searchData.date, searchData.geoLocation, searchResult, instagram_count, twitter_count, total_count);
                savePromise.then(function(result) {
                    resolve(result);
                });
            });
        }

        /**
         * Print image
         */
        function print(img) {
            return $q(function(resolve) {
                imageToData(img, function(dataURI) {
                    var resultSet = {
                        'success': 0,
                        'error': ""
                    };

                    var printPromise = printHttp(dataURI);
                    printPromise.then(function(result) {
                        resultSet.success = result.success;
                        resultSet.error = result.message;
                        resolve(resultSet);
                    }).catch(function() {
                        resultSet.success = 0;
                        resultSet.error = "500 error";
                        resolve(resultSet);
                    });
                });
            });
        }
        
        /**
         * Convert image URL to data URI
         */
        function imageToData(url, callback){
            var img = new Image();
            img.crossOrigin = 'Anonymous';
            img.onload = function(){
                var canvas = document.createElement('CANVAS');
                var ctx = canvas.getContext('2d');
                var dataURL;
                canvas.height = this.height;
                canvas.width = this.width;
                ctx.drawImage(this, 0, 0);
                
                dataURL = canvas.toDataURL('image/png').replace(/^data:image\/(png|jpg);base64,/, '');
                callback(dataURL);
                canvas = null; 
            };
            img.src = url;
        }

        // Save collection API method
        function saveHttp(name, q, date, geoLocation, data, instagram_count, twitter_count, total_count) {
            return $q(function (resolve, reject) {
                var requestData = {
                    'name': name,
                    'q': q,
                    'date': date,
                    'geoLocation': geoLocation,
                    'data': data,
                    'instagram_count': instagram_count,
                    'twitter_count': twitter_count,
                    'total_count': total_count
                };

                $http.post(APIHOST + '/api/collections/save', requestData)
                    .success(function (result) {
                        resolve(result);
                    })
                    .error(function () {
                        reject(0);
                    })
            });
        }

        // Print image API method
        function printHttp(img) {
            return $q(function (resolve, reject) {
                var requestData = {
                    'dataURL': img,
                    'source': "search"
                };
                
                $http.post(APIHOST + '/api/print', requestData)
                    .success(function (result) {
                        resolve(result);
                    })
                    .error(function () {
                        reject(0);
                    })
            });
        }

        return {
            save: function (name, searchData, searchResult) {
                return save(name, searchData, searchResult);
            },
            print: function (img) {
                return print(img);
            }
        }
    }

    angular
        .module('fxApp.factories')
        .factory(factoryId, ['$q', '$http', 'APIHOST', CollectionFactory])
})();