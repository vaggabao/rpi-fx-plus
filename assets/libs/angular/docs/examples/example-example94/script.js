(function(angular) {
  'use strict';
angular.module('switchExample', ['ngAnimate'])
  .controller('ExampleController', ['$scope', function($scope) {
    $scope.items = ['settings', 'search', 'other'];
    $scope.selection = $scope.items[0];
  }]);
})(window.angular);