(function () {
    'use strict';
    
    function watermark() {
        function link ($scope, $element, $attrs) {
            var className = $attrs.waterMark;
            $element.css('position', 'relative');
            
            var eWatermark = document.createElement('div');
            $(eWatermark).addClass(className);
            $element.append(eWatermark);
        }

        return {
            restrict: 'A',
            link: link
        };
    }

    angular
        .module('fxApp.directives')
        .directive('waterMark', watermark);
})();