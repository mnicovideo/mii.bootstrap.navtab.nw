'use strict';

angular.module('angularTabEditorApp')
  .controller('SortableCtrl', function($scope) {
    $scope.items = ['One', 'Two', 'Three'];
    $scope.sortableOptions = {
      update: function(e, ui) {
        console.log(e, ui);
      },
      axis: 'x'
    };
  });
