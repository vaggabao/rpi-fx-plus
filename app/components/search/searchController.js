(function () {
    'use strict';
    var controllerId = 'SearchController';

    function SearchController($q, SearchFactory, CollectionFactory, DatePickerFactory, LocationFactory) {

        var vm = this;
        
        /**
         * Variable initialization
         */
        
        // Initialize search
        vm.search = {
            'status': {
                'ready': 1,
                'counter': 0
            },
            'criteria': {
                'hashtag': "",
                'geoLocation': "",
                'location': {
                    'radius': 1000,
                    'latitude': null,
                    'longitude': null
                },
                'date': "",
                'instagram': true,
                'twitter': true,
                'max_id': {
                    'instagram': null,
                    'twitter': null
                }
            },
            'previous': {
                'hashtag': "",
                'geoLocation': "",
                'location': {
                    'radius': 1000,
                    'latitude': null,
                    'longitude': null
                },
                'date': "",
                'instagram': true,
                'twitter': true,
                'max_id': {
                    'instagram': null,
                    'twitter': null
                }
            },
            'result': {
                'instagram': {
                    'last_id': null,
                    'data': []
                },
                'twitter': {
                    'last_id': null,
                    'data': []
                },
                'all': []
            }
        }
        // Initialize save
        vm.save = {
            'name': "",
            'status': 0
        };      
        // Initialize printer
        vm.printer = {
            'status': {
                'ready': 1,
                'printCount': 0,
                'spoolCount': 0,
                'failedCount': 0,
                'processedCount': 0
            },
            'data': [],
            'indexes': []
        };
        // Initialize error
        vm.error = {
            'show': false,
            'type': null,
            'message': null
        }
        
        vm.pagination = {
            'rpp': 20,
            'rppOptions': [{"value": 10, "label": "10"},{"value": 20, "label": "20"},{"value": 50, "label": "50"}],
            'pages': 1,
            'currentPage': 1,
            'currentContent': []
        };

        vm.pagination.rpp = vm.pagination.rppOptions[1];
        
        /**
         * Confirm location picked from location picker
         */
        vm.selectLocation = function() {
            var location = vm.search.criteria.location;
            vm.search.criteria.geoLocation = location.latitude + "," + location.longitude + "," + location.radius;
            vm.locationPickerPopover.isOpen = false;
        };
        
        /**
         * Get geocode for location picker's initial value
         */
        var locationPromise = LocationFactory.getLocationCoord();
        locationPromise.then(function (response) {
            vm.search.criteria.location.latitude = response.latitude;
            vm.search.criteria.location.longitude = response.longitude;
        });
        
        /**
         * Perform search
         */
        vm.submitSearch = function () {
            if (vm.search.criteria.hashtag !== "" || vm.search.criteria.geoLocation !== "" || vm.search.criteria.date !== "" && (vm.search.criteria.instagram === true || vm.search.criteria.twitter === true)) {
                vm.search.status.ready = 0;
                vm.search.status.counter++;

                var searchPromise = SearchFactory.search(vm.search.criteria);    
                searchPromise.then(function(result) {
                    if (vm.search.status.counter === 1) {
                        vm.search.result = result;
                    } else {
                        vm.search.result.instagram.data = vm.search.result.instagram.data.concat(result.instagram.data);
                        vm.search.result.twitter.data = vm.search.result.twitter.data.concat(result.twitter.data);
                        vm.search.result.instagram.data = removeDuplicates(vm.search.result.instagram.data);
                        vm.search.result.twitter.data = removeDuplicates(vm.search.result.twitter.data);
                    }

                    // get max_ids from results
                    if (vm.search.criteria.instagram === true && vm.search.result.instagram.last_id.length > 0)
                        vm.search.criteria.max_id.instagram = result.instagram.last_id.join(',');
                    if (vm.search.criteria.twitter === true)
                        vm.search.criteria.max_id.twitter = result.twitter.last_id;
                   
                    // check if more result is needed
                    var igLength = vm.search.result.instagram.data.length;
                    var twLength = vm.search.result.twitter.data.length;
                    if (igLength + twLength < 50 && vm.search.status.counter < 3 && vm.search.status.ready !== -1) {
                        vm.submitSearch();
                    } else {
                        vm.search.status.ready = 1;
                        vm.search.status.counter = 0;
                        vm.search.previous = JSON.parse(JSON.stringify(vm.search.criteria));
                        vm.search.result.all = vm.search.result.instagram.data;
                        vm.search.result.all = vm.search.result.all.concat(vm.search.result.twitter.data);

                        // count pages
                        var resultCount = vm.search.result.all.length;
                        vm.pagination.pages = Math.ceil(resultCount / vm.pagination.rpp.value);
                        vm.pagination.currentPage = 1;
                        switchPage();

                        vm.search.criteria.max_id.instagram = null;
                        vm.search.criteria.max_id.twitter = null;
                    }
                });
            }
        };

        function switchPage() {
            var max = vm.pagination.rpp.value * vm.pagination.currentPage;
            var min = max - vm.pagination.rpp.value;
            vm.pagination.currentContent = vm.search.result.all.slice(min, max);
        }

        vm.nextPage = function () {
            vm.pagination.currentPage++;
            switchPage();
        }

        vm.previousPage = function () {
            vm.pagination.currentPage--;
            switchPage();
        }

        vm.setRpp = function () {
            var resultCount = vm.search.result.all.length;
            vm.pagination.pages = Math.ceil(resultCount / vm.pagination.rpp.value);
            if (vm.pagination.currentPage > vm.pagination.pages) {
                vm.pagination.currentPage = vm.pagination.pages;
            }
            switchPage();
        }
        
        /**
         * Stop search
         */
        vm.stopSearch = function () {
            vm.search.status.ready = -1;
        };

        /**
         * Load more result
         */
        vm.loadMore = function () {
            vm.search.status.ready = 0;

            if (vm.search.previous.max_id.instagram.length === 0)
                vm.search.previous.instagram = false;

            if (vm.search.previous.max_id.twitter === "")
                vm.search.previous.twitter = false;

            var searchPromise = SearchFactory.search(vm.search.previous);    
            searchPromise.then(function(result) {
                vm.search.result.instagram.data = vm.search.result.instagram.data.concat(result.instagram.data);
                vm.search.result.twitter.data = vm.search.result.twitter.data.concat(result.twitter.data);
                vm.search.result.instagram.data = removeDuplicates(vm.search.result.instagram.data);
                vm.search.result.twitter.data = removeDuplicates(vm.search.result.twitter.data);

                // get max_ids from results
                if (vm.search.previous.instagram === true)
                    vm.search.previous.max_id.instagram = result.instagram.last_id.join(',');
                if (vm.search.previous.twitter === true)
                    vm.search.previous.max_id.twitter = result.twitter.last_id;
               
                vm.search.status.ready = 1;
                vm.search.result.all = vm.search.result.instagram.data;
                vm.search.result.all = vm.search.result.all.concat(vm.search.result.twitter.data);

                // count pages
                var resultCount = vm.search.result.all.length;
                vm.pagination.pages = Math.ceil(resultCount / vm.pagination.rpp.value);
                switchPage();
            });
        }
        
        /**
         * Save search results
         */
        vm.saveCollection = function() {
            if (vm.save.status === 0) {
                vm.save.status = 1;
            } else {
                vm.save.status = 2;
                if (isEmpty(vm.save.name) !== true) {
                    var savePromise = CollectionFactory.save(vm.save.name, vm.search.criteria, vm.search.result);
                    savePromise
                        .then(function(result) {
                            // vm.saveResult = result;
                            vm.save.status = 0;
                        });
                } else {
                    vm.error.show = true;
                    vm.error.type = "success";
                    vm.error.message = "Search saved successfully.";
                }
            }
        };
        
        /**
         * Initiate printing job
         */
        vm.initiatePrint = function() {
            vm.printer.status.ready = 0;
            vm.printer.status.printCount = vm.printer.data.length;
            
            var promise = print(0);
            promise.then(function(response) {
                vm.error.show = true;
                vm.error.type = "success";
                vm.error.message = vm.printer.status.spoolCount + " out of " + vm.printer.status.processedCount + " images were queued to the printer successfully.";
                vm.printer = {
                    'status': {
                        'ready': 1,
                        'printCount': 0,
                        'spoolCount': 0,
                        'failedCount': 0,
                        'processedCount': 0
                    },
                    'data': [],
                    'indexes': []
                };
            });
        };
        
        /**
         * Print selected images
         */
        function print(index) {
            var img = vm.printer.data[index];

            return $q(function(resolve) {
                var printPromise = CollectionFactory.print(img);
                printPromise.then(function(result) {
                    if (result.success === 1) {
                        vm.printer.status.spoolCount++;
                    } else {
                        vm.printer.status.failedCount++;
                    }
                    vm.printer.status.processedCount++;

                    if (vm.printer.status.processedCount < vm.printer.status.printCount) {
                        index++;
                        resolve(print(index));
                    } else {
                        resolve(true);
                    }
                });
            });
        }
        
        /**
         * Print all retrieved images
         */
        vm.printAll = function() {
            var igDataCount = vm.search.result.instagram.data.length;
            var twDataCount = vm.search.result.twitter.data.length;
            
            vm.printer.data = [];

            // Push all data from instagram search result to printer data
            for (var i = 0; i < igDataCount; i++) {
                vm.printer.indexes.push(vm.search.result.instagram.data[i].media_id);
                vm.printer.data.push(vm.search.result.instagram.data[i].media_url);
            }

            // Push all data from twitter search result to printer data
            for (var i = 0; i < twDataCount; i++) {
                vm.printer.indexes.push(vm.search.result.twitter.data[i].media_id);
                vm.printer.data.push(vm.search.result.twitter.data[i].media_url);
            }
            
            // Initiate print
            vm.initiatePrint();
        };
        

        /**
         * Toggle printing selection
         */
        vm.toggleSelection = function(media_id, media_url) {
            var printerDataIndex = null;
            var exists = false;
            var printerDataLength = vm.printer.data.length;
            for (var i = 0; i < printerDataLength; i++) {
                if (media_id === vm.printer.indexes[i]) {
                    exists = true;
                    printerDataIndex = i;
                    break;
                }
            }
            
            if (exists === true) {
                vm.printer.indexes.splice(printerDataIndex, 1);
                vm.printer.data.splice(printerDataIndex, 1);
            } else {
                vm.printer.indexes.push(media_id);
                vm.printer.data.push(media_url);
            }
        };
        
        
        /**
         * Check if media_id exists on the to be printed medias
         */
        vm.checkSelection = function(media_id) {
            var printerDataLength = vm.printer.data.length;
            for (var i = 0; i < printerDataLength; i++) {
                if (media_id === vm.printer.indexes[i]) {
                    return true;
                }
            }
            
            return false;
        }
        
        
        /**
         * Helper
         */
        function isEmpty(string) {
            var isEmpty = false;

            if (string === "")
                isEmpty = true;

            if (typeof string === "undefined")
                isEmpty = true;

            return isEmpty;
        }
        
        /**
         * Remove duplicate values of returned search results using media_id
         */
        function removeDuplicates(data) {
            var arr = data;
            for(var i = 0; i < arr.length; i++) {
                for(var j = i + 1; j < arr.length; j++) {
                    if(arr[i].media_id === arr[j].media_id)
                        arr.splice(j, 1);
                }
            }
            return arr;
        }
        
        
        /**
         * DOM releated functions
         */
        
        // Bind events to pull menu
        vm.pullMenu = {
            'isShown': true,
            'toggle': null
        };
        vm.pullMenu.toggle = function() {
            vm.pullMenu.isShown = !vm.pullMenu.isShown;
        };

        // Initialize date picker
        vm.datePickerOptions = DatePickerFactory.datePicker;
        vm.datePickerOptions.opened = false;

        vm.openDatePicker = function () {
            vm.datePickerOptions.opened = true;
        };
        
        // Initialize location picker popover
        vm.locationPickerPopover = {
            isOpen: false,
            templateUrl: 'locationPicker.html'
        };
    }

    angular
        .module('fxApp.controllers')
        .controller(controllerId, ['$q', 'SearchFactory', 'CollectionFactory', 'DatePickerFactory', 'LocationFactory', SearchController]);
})();