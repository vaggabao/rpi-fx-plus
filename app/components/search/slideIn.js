function slideIn() {
    function link ($scope, element, attributes) {
        var expression = attributes.slideExp;
        var duration = (attributes.duration || "fast");
        
        if (!$scope.$eval(expression)) {
            element.hide();
        }
        
        $scope.$watch(expression, function(newValue, oldValue) {
            if (newValue === oldValue) {
                return;
            }
            
            if (newValue) {
                element
                    .stop(true, true)
                    .slideDown(duration);
            } else {
                element
                    .stop(true, true)
                    .slideUp(duration);
            }
        });
    }
    
    return {
        restrict: 'AE',
        link: link
    };
}

angular
    .module('fxApp.directives')
    .directive('slideIn', slideIn);