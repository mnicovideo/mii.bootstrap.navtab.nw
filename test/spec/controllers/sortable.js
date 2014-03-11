'use strict';

describe('Controller: SortableCtrl', function () {

  // load the controller's module
  beforeEach(module('angularTabeditorApp'));

  var SortableCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    SortableCtrl = $controller('SortableCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
