'use strict';

describe('Directive: showtab', function () {

  // load the directive's module
  beforeEach(module('angularTabeditorApp'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<showtab></showtab>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('this is the showtab directive');
  }));
});
