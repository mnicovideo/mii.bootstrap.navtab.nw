'use strict';

angular.module('angularTabEditorApp')
  .controller('DemoTabCtrl', function($scope) {
    var arraypush = function(active) {
      var tabNo = new Date().valueOf();
      $scope.tabs.push({
        active: active,
        title:  'loooong title ' + tabNo,
        content: 'dynamic content of ' + tabNo
      });
    };
    $scope.addTab = function() {
      angular.forEach($scope.tabs, function(tab) {
        if (tab.active) {
          tab.active = false;
          return;
        }
      });
      arraypush(true);
    };
    //
    $scope.tabs = [];
    $scope.addTab(true);
  });
