(function() {
    function locationPicker() {
        function link ($scope, $element, $attributes, $ctrl) {
            var latitude = $attributes.latitude;
            var longitude = $attributes.longitude;
            var radius = $attributes.radius;
            
            $element.find('#map-canvas').locationpicker({
                location: {latitude: latitude, longitude: longitude},
                radius: radius,
                inputBinding: {
                    latitudeInput: $('#location-picker #latitude'),
                    longitudeInput: $('#location-picker #longitude'),
                    radiusInput: $('#location-picker #radius'),
                    locationNameInput: $('#location-picker #location-name')
                },
                enableAutocomplete: true
            });
        }

        return {
            restrict: 'E',
            template: template,
            scope: '=',
            controllerAs: 'ctrl',
            link: link
        };
    }

    function template() {
        var template = "\
            <div id='location-picker'>\
                <div class='row'>\
                    <div class='col-sm-5' style='padding-left: 0;'>\
                        <div class='form-group'>\
                            <label for='location-name' class='form-label'>Search</label>\
                            <input type='text' id='location-name' class='form-control' placeholder=''>\
                        </div>\
                        <div class='form-group'>\
                            <label for='radius' class='form-label'>Radius(meters)</label>\
                            <input type='text' id='radius' class='form-control' placeholder='max: 5000' ng-model='ctrl.search.criteria.location.radius'>\
                        </div>\
                        <div class='form-group'>\
                            <label for='latitude' class='form-label'>Latitude</label>\
                            <input type='text' id='latitude' class='form-control' ng-model='ctrl.search.criteria.location.latitude'>\
                        </div>\
                        <div class='form-group'>\
                            <label for='longitude' class='form-label'>Longitude</label>\
                            <input type='text' id='longitude' class='form-control' ng-model='ctrl.search.criteria.location.longitude'>\
                        </div>\
                        <button type='button' class='btn btn-success btn-block' ng-click='ctrl.selectLocation()'>OK</button>\
                    </div>\
                    <div class='col-sm-7' style='padding-right: 0;'>\
                        <div id='map-canvas' style='width: 100%; height: 280px;'></div>\
                    </div>\
                </div>\
            </div>\
        ";

        return template;
    }

    angular
        .module('fxApp.directives')
        .directive('locationPicker', locationPicker);
})();
