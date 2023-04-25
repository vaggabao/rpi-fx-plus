/**
 * Search factory
 */
(function () {
    'use strict';
    var factoryId = 'SearchFactory';

    function SearchFactory($q, InstagramFactory, TwitterFactory) {

        function search(searchData) {
            var resultSet = {
                'instagram': {
                    'lastId': [],
                    'data': []
                },
                'twitter': {
                    'lastId': "",
                    'data': []
                }
            };
            var status = 0;

            if (searchData.instagram === false)
                status++;

            if (searchData.twitter === false)
                status++;

            return $q(function (resolve) {
                if (searchData.instagram === true) {
                    var instagramPromise = InstagramFactory.search(searchData, resultSet.instagram);
                    instagramPromise
                        .then(function (result) {
                            status++;
                            if (result !== 0) {
                                resultSet.instagram = result;
                            }

                            if (status === 2) {
                                resolve(resultSet);
                            }
                        });
                }

                if (searchData.twitter === true) {
                    var twitterPromise = TwitterFactory.search(searchData);
                    twitterPromise
                        .then(function (result) {
                            status++;
                            if (result !== 0) {
                                resultSet.twitter = result;
                            }

                            if (status === 2) {
                                resolve(resultSet);
                            }
                        });
                }

                if (status === 2) {
                    resolve(resultSet);
                }
            });
        }

        return {
            search: function (searchData) {
                return search(searchData);
            }
        }
    }

    angular
        .module('fxApp.factories')
        .factory(factoryId, ['$q', 'InstagramFactory', 'TwitterFactory', SearchFactory])
})();

/**
 * Instagram factory
 */
(function () {
    'use strict';
    var factoryId = 'InstagramFactory';

    function InstagramFactory($http, $q, APIHOST, LocationFactory) {
        // search entry point
        function search(searchData) {
            return $q(function (resolve, reject) {
                // remove extra spaces from the hashtag string
                var hashtagString = searchData.hashtag;
                hashtagString = hashtagString.replace(/([\s]+)/g, ' ');
                hashtagString = hashtagString.trim();
                // handle date and geolocation search strings
                var date = searchData.date;
                var geoLocation = searchData.geoLocation;
                
                // initialize arguments value
                var query = "";
                var min_timestamp = "";
                var max_timestamp = "";
                var latitude = "";
                var longitude = "";
                var distance = "";
                var search_type = "";
                var startSearch = 0;

                // get date today and timezone offset to obtain the UTC date
                var today = new Date();
                var timezoneOffset = today.getTimezoneOffset() * 60 * 1000;

                // search by hashtag
                if (hashtagString !== "" && (date === null || date === "") && geoLocation === "") {
                    query = hashtagString;
                    search_type = "tag";

                    startSearch = 1;
                }
                // search by location
                else if (hashtagString === "" && (date === null || date === "") && geoLocation !== "") {
                    // handle geolocation
                    var geoLocationArr = geoLocation.split(',');
                    latitude = geoLocationArr[0].trim();
                    longitude = geoLocationArr[1].trim();
                    distance = geoLocationArr[2].trim();
                    
                    search_type = "media";
                    startSearch = 1;
                }
                // search by hashtag and location
                else if (hashtagString !== "" && (date === null || date === "") && geoLocation !== "") {
                    // handle query
                    query = hashtagString;

                    // handle geolocation
                    var geoLocationArr = geoLocation.split(',');
                    latitude = geoLocationArr[0].trim();
                    longitude = geoLocationArr[1].trim();
                    distance = geoLocationArr[2].trim();
                    
                    search_type = "media";
                    startSearch = 1;
                }
                // search by date and location
                else if (hashtagString === "" && (date !== null && date !== "") && geoLocation !== "") {
                    // handle min and max timestamp
                    min_timestamp = new Date(date);
                    min_timestamp.setHours(0, 0, 0, 0);
                    max_timestamp = new Date(date);
                    max_timestamp.setHours(23, 59, 59, 59);
                    // convert to UTC
                    min_timestamp.setTime(min_timestamp.getTime() - timezoneOffset);
                    max_timestamp.setTime(max_timestamp.getTime() - timezoneOffset);
                    // convert to seconds
                    min_timestamp = min_timestamp.getTime() / 1000;
                    max_timestamp = max_timestamp.getTime() / 1000;

                    // handle geolocation
                    var geoLocationArr = geoLocation.split(',');
                    latitude = geoLocationArr[0].trim();
                    longitude = geoLocationArr[1].trim();
                    distance = geoLocationArr[2].trim();
                    
                    search_type = "media";
                    startSearch = 1;
                }
                // search by hashtag, date and location
                else if (hashtagString !== "" && (date !== null && date !== "") && geoLocation !== "") {
                    // handle query
                    query = hashtagString;

                    // handle min and max timestamp
                    min_timestamp = new Date(date);
                    min_timestamp.setHours(0, 0, 0, 0);
                    max_timestamp = new Date(date);
                    max_timestamp.setHours(23, 59, 59, 59);
                    // convert to UTC
                    min_timestamp.setTime(min_timestamp.getTime() - timezoneOffset);
                    max_timestamp.setTime(max_timestamp.getTime() - timezoneOffset);
                    // convert to seconds
                    min_timestamp = min_timestamp.getTime() / 1000;
                    max_timestamp = max_timestamp.getTime() / 1000;

                    // handle geolocation
                    var geoLocationArr = geoLocation.split(',');
                    latitude = geoLocationArr[0].trim();
                    longitude = geoLocationArr[1].trim();
                    distance = geoLocationArr[2].trim();
                    
                    search_type = "media";
                    startSearch = 1;
                }
                // fallback: does not meet any of the search combinations, no search execution
                else {
                    resolve(0);
                    startSearch = 0;
                }

                if (startSearch === 1) {
                    var searchPromise = searchHttp(query, min_timestamp, max_timestamp, latitude, longitude, distance, search_type, searchData.max_id.instagram);
                    searchPromise
                        .then(function (response) {
                            var result = {
                                'last_id': response.last_id,
                                'data': response.data
                            };
                            resolve(result);
                        })
                        .catch(function () {
                            reject(0);
                        });
                }
            });
        }

        // call search API method
        function searchHttp(query, min_timestamp, max_timestamp, latitude, longitude, distance, search_type, max_id) {
            return $q(function (resolve, reject) {
                var data = {
                    'q': query,
                    'min_timestamp': min_timestamp,
                    'max_timestamp': max_timestamp,
                    'distance': distance,
                    'lat': latitude,
                    'lng': longitude,
                    'search_type': search_type,
                    'max_id': max_id
                };

                $http.get(APIHOST + '/api/instagram/search', {params: data})
                .success(function (result) {
                    resolve(result);
                })
                .error(function () {
                    reject(0);
                })
            });
        }

        return {
            search: function (searchData, searchResult) {
                return search(searchData, searchResult);
            }
        };
    }

    angular
        .module('fxApp.factories')
        .factory(factoryId, ['$http', '$q', 'APIHOST', 'LocationFactory', InstagramFactory]);
})();

/**
 * Twitter factory
 */
(function () {
    'use strict';
    var factoryId = 'TwitterFactory';

    function TwitterFactory($http, $q, APIHOST) {
        // search entry point
        function search(searchData) {
            return $q(function (resolve, reject) {
                // handle search inputs
                // remove extra spaces
                var hashtagString = searchData.hashtag;
                hashtagString = hashtagString.replace(/([\s]+)/g, ' ');
                var hashtagsArray = hashtagString.split(' ');   // then split hashtag string using space
                // loop over the array to prepend # for every array value
                for (var i = 0; i < hashtagsArray.length; i++)
                    hashtagsArray[i] = "#" + hashtagsArray[i];
                // handle date and geolocation search strings
                var geoLocation = searchData.geoLocation;
                var date = searchData.date;
                
                // initialize arguments value
                var query = "";
                var since = "";
                var until = "";
                var latitude = "";
                var longitude = "";
                var distance = "";
                var startSearch = 0;

                // search by hashtag
                if (hashtagString !== "" && (date === null || date === "") && geoLocation === "") {
                    var hashtagQuery = hashtagsArray.join('+');
                    query = encodeURI(hashtagQuery);

                    startSearch = 1;
                }
                // search by date
//                else if (hashtagString === "" && (date !== "" && date !== null) && geoLocation === "") {
//                    since = new Date(date);
//                    until = new Date(date);
//                    since = since.getFullYear() + "-" + (since.getMonth() + 1) + "-" + since.getDate();
//                    until = until.getFullYear() + "-" + (until.getMonth() + 1) + "-" + (until.getDate() + 1);
//                    query = "since:" + since + " until:" + until;
//                    query = encodeURI(query);    // html encode URI query as per twitter's requirement for q
//                    since = "";
//                    until = "";
//                    startSearch = 1;
//                }
                // search by location
                else if (hashtagString === "" && (date === "" || date === null) && geoLocation !== "") {
                    // handle geolocation
                    var geoLocationArr = geoLocation.split(',');
                    latitude = geoLocationArr[0].trim();
                    longitude = geoLocationArr[1].trim();
                    distance = geoLocationArr[2].trim();
                    distance = parseFloat(distance) / 1000; // convert to km.

                    startSearch = 1;
                }
                // search by hashtag and location
                else if (hashtagString !== "" && (date === "" || date === null) && geoLocation !== "") {
                    var hashtagQuery = hashtagsArray.join('+');

                    // handle geolocation
                    var geoLocationArr = geoLocation.split(',');
                    latitude = geoLocationArr[0].trim();
                    longitude = geoLocationArr[1].trim();
                    distance = geoLocationArr[2].trim();
                    distance = parseFloat(distance) / 1000; // convert to km.

                    query = encodeURI(hashtagQuery);    // html encode URI query as per twitter's requirement for q

                    startSearch = 1;
                }
                // search by date and location
                else if (hashtagString === "" && (date !== "" && date !== null) && geoLocation !== "") {
                    since = new Date(date);
                    until = new Date(date);
                    since = since.getFullYear() + "-" + (since.getMonth() + 1) + "-" + since.getDate();
                    until = until.getFullYear() + "-" + (until.getMonth() + 1) + "-" + (until.getDate() + 1);

                    // handle geolocation
                    var geoLocationArr = geoLocation.split(',');
                    latitude = geoLocationArr[0].trim();
                    longitude = geoLocationArr[1].trim();
                    distance = geoLocationArr[2].trim();
                    distance = parseFloat(distance) / 1000; // convert to km.

                    startSearch = 1;
                }
                // search by hashtag, date and location
                else if (hashtagString !== "" && (date !== "" && date !== null) && geoLocation !== "") {
                    var hashtagQuery = hashtagsArray.join('+');
                    since = new Date(date);
                    until = new Date(date);
                    since = since.getFullYear() + "-" + (since.getMonth() + 1) + "-" + since.getDate();
                    until = until.getFullYear() + "-" + (until.getMonth() + 1) + "-" + (until.getDate() + 1);

                    // handle geolocation
                    var geoLocationArr = geoLocation.split(',');
                    latitude = geoLocationArr[0].trim();
                    longitude = geoLocationArr[1].trim();
                    distance = geoLocationArr[2].trim();
                    distance = parseFloat(distance) / 1000; // convert to km.
                    
                    query = encodeURI(hashtagQuery);    // html encode URI query as per twitter's requirement for q

                    startSearch = 1;
                }
                // fallback
                else {
                    resolve(0);

                    startSearch = 0;
                }

                if (startSearch === 1) {
                    var searchPromise = searchHttp(query, since, until, latitude, longitude, distance, searchData.max_id.twitter);
                    searchPromise
                        .then(function (response) {
                            var result = {
                                'last_id': response.last_id,
                                'data': response.data
                            }
                            resolve(result);
                        })
                        .catch(function (response) {
                            reject(0);
                        });
                }
            });
        }

        // call search API method
        function searchHttp(query, since, until, latitude, longitude, radius, max_id) {
            var data = {
                'q': query,
                'since': since,
                'until': until,
                'lat': latitude,
                'lng': longitude,
                'radius': radius,
                'max_id': max_id
            }
            return $q(function (resolve, reject) {
                $http.get(APIHOST + '/api/twitter/search', {params: data})
                    .success(function (result) {
                        resolve(result);
                    })
                    .error(function (result) {
                        reject(0);
                    })
            });
        }

        return {
            search: function (searchData, searchResult) {
                return search(searchData, searchResult);
            }
        };
    }

    angular
        .module('fxApp.factories')
        .factory(factoryId, ['$http', '$q', 'APIHOST', 'LocationFactory', TwitterFactory]);
})();

/**
 * Datepicker factory
 */
(function () {
    'use strict';
    var factoryId = 'DatePickerFactory';

    function DatePickerFactory() {
        DatePickerFactory.datePicker = {
            'showButtonBar': false,
            'showWeeks': false,
            'format': 'MMMM dd, yyyy',
        }
        var today = new Date();
        DatePickerFactory.datePicker.maxDate = "" + today + "";

        return DatePickerFactory;
    }

    angular
        .module('fxApp.factories')
        .factory(factoryId, ['$http', '$q', 'APIHOST', DatePickerFactory]);
})();

/**
 * Location factory
 */
(function () {
    'use strict';
    var factoryId = 'LocationFactory';

    function LocationFactory($geolocation, $q) {
        function getCurrentLocationCoord() {
            return $q(function (resolve, reject) {
                $geolocation
                    .getCurrentPosition({
                        timeout: 60000
                    })
                    .then(function (position) {
                        resolve(position.coords);
                    });
            })
        }


        return {
            getLocationCoord: function () {
                return getCurrentLocationCoord();
            }
        }
    }

    angular
        .module('fxApp.factories')
        .factory(factoryId, ['$geolocation', '$q', LocationFactory]);
})();
