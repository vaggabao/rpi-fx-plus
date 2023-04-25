/**
 * Load modules for application
 */

angular
    .module('fxApp.controllers', []);

angular
    .module('fxApp.factories', ['ngGeolocation']);

angular
    .module('fxApp.directives', []);

angular
    .module('fxApp', ['ui.router', 'ui.bootstrap', 'ngScrollbars', 'fxApp.controllers', 'fxApp.factories', 'fxApp.directives', 'fxApp.states'])
    // set our API host
    .constant('APIHOST', 'http://localhost:5000');