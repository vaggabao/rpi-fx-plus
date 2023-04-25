(function () {
    'use strict';
    var factoryId = 'AuthenticationFactory';

    function AuthenticationFactory($state, $cookies, $timeout) {
        AuthenticationFactory.loginData = {
            'status': 0,
            'instagram': {
                'auth': 0,
                'accessToken': ''
            },
            'twitter': {
                'auth': 0,
                'accessToken': ''
            }
        };

        AuthenticationFactory.login = function () {
            var loginData = $cookies.get('auth');
            if (typeof loginData !== "undefined" && loginData !== "" && loginData !== null) {
                AuthenticationFactory.loginData = JSON.parse(loginData);
                $timeout(function() {
                    var currentState = $state.current.name;
                    if (currentState !== "search" && currentState !== "404")
                        $state.go("search");
                }, 0);
            } else {
                $timeout(function() {
                    var currentState = $state.current.name;
                    if (currentState !== "authorize" && currentState !== "404")
                        $state.go("authorize");
                }, 0);
            }
        };

        return AuthenticationFactory;
    }

    angular
        .module('fxApp.factories', ['ngCookies'])
        .factory(factoryId, ['$state', '$cookies', '$timeout', AuthenticationFactory]);
})();