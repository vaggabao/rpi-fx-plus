/**
 * Load states for application
 * more info on UI-Router states can be found at
 * https://github.com/angular-ui/ui-router/wiki
 */
angular.module('fxApp.states', [])
    .config(['$stateProvider', '$urlRouterProvider', '$locationProvider', function ($stateProvider, $urlRouterProvider, $locationProvider) {
        // any unknown URLS go to 404
        $urlRouterProvider.otherwise('/404');

        // use a state provider for routing
        $stateProvider
            .state('home', {
                url: '/',
                templateUrl: 'app/components/home/homeView.html',
            })
            .state('search', {
                url: '/search',
                templateUrl: 'app/components/search/searchView.html',
                controller: 'SearchController',
                controllerAs: 'ctrl'
            })
            .state('camera', {
                url: '/camera',
                templateUrl: 'app/components/camera/cameraView.html',
                controller: 'CameraController',
                controllerAs: 'ctrl'
            })
           .state('gallery', {
               url: '/gallery',
               templateUrl: 'app/components/gallery/GalleryView.html',
               controller: 'GalleryController',
               controllerAs: 'ctrl'
           })
            .state('404', {
                url: '/404',
                templateUrl: 'app/shared/404.html'
            });

        $locationProvider.html5Mode(true);
    }]);
