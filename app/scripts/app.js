'use strict';

angular.module('angularTabEditorApp', [
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'ngRoute',
  'ui.sortable',
  'mii.bootstrap.navtab'
])
  .config(function($routeProvider) {
    $routeProvider
      .when('/main', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .when('/', {
        templateUrl: 'views/tabeditor.html'
      })
      .when('/sortable', {
        templateUrl: 'views/sortable.html',
        controller: 'SortableCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  });
