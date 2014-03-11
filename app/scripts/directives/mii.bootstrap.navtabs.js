'use strict';

angular.module('mii.bootstrap.navtab', [])
  .value('NavTabsBaseController', {
    duration: 200,
    resetTime: 500,
    browser: {
      msie: /msie/.test(navigator.userAgent.toLowerCase()),
      firefox: /firefox/.test(navigator.userAgent.toLowerCase()),
      webkit: /webkit/.test(navigator.userAgent.toLowerCase()),
      safari: /safari/.test(navigator.userAgent.toLowerCase()) && /Apple Computer/.test(navigator.vendor),
      chrome: /chrome/.test(navigator.userAgent.toLowerCase()) && /Google Inc/.test(navigator.vendor)
    },
    ngRepeatExpressionObject: function(expression) {
      var match = expression.match(/^\s*(.+)\s+in\s+([\r\n\s\S]*?)\s*(\s+track\s+by\s+(.+)\s*)?$/);
      var lhs, rhs, trackByExp, valueIdentifier, keyIdentifier;
      if (!match) {
        throw 'no match. expression:' + expression;
      }
      lhs = match[1];
      rhs = match[2];
      trackByExp = match[4];
      match = lhs.match(/^(?:([\$\w]+)|\(([\$\w]+)\s*,\s*([\$\w]+)\))$/);
      if (!match) {
        throw 'no match. lhs:' + lhs;
      }
      valueIdentifier = match[3] || match[1];
      keyIdentifier = match[2];
      return {
        tabName: lhs,
        tabsName: rhs,
        trackByExp: trackByExp,
        valueIdentifier: valueIdentifier,
        keyIdentifier: keyIdentifier
      };
    },
    activeTabPosition: function(activeTabIndex, tabElements) {
      var position = 0;
      for (var i = 0; i < activeTabIndex; i++) {
        var width = tabElements.eq(i).width();
        console.log('this.browser.firefox ? ', this.browser.firefox);
        position += width - (this.browser.firefox ? 0.5 : 0); // firefoxでは0.5ポイント引くと意図した動きになる
      }
      return position;
    },
    scrollPosition: function(activeTabIndex, navTabsElement) {
      var tabElements = navTabsElement.find('li[ng-repeat]');
      var activeTabPosition = this.activeTabPosition(activeTabIndex, tabElements);
      var scrollLeftPosition = navTabsElement.scrollLeft();
      var navTabsWidth = navTabsElement.width();
      var activeTabWidth = tabElements.eq(activeTabIndex).width();
      if (scrollLeftPosition < activeTabPosition) {
        if (activeTabPosition - scrollLeftPosition < navTabsWidth - activeTabWidth) {
          return;
        }
        activeTabPosition = activeTabPosition - (navTabsWidth - activeTabWidth);
      }
      return activeTabPosition;
    },
    showTabAnimate: function(tab, tabs, navTabsElement) {
      var activeTabIndex = tabs.indexOf(tab);
      var position = this.scrollPosition(activeTabIndex, navTabsElement);
      navTabsElement.animate({
        scrollLeft: position
      }, this.duration);
    },
    navTabsElements: function(element) {
      var selectedElement = element.find('[navtabs-scrollable].nav.nav-tabs');
      if (selectedElement.length) {
        return selectedElement;
      } else {
        return element.find('.nav.nav-tabs');
      }
    }
  })
  .controller('NavTabsController', function(NavTabsBaseController) {
    return {
      duration: NavTabsBaseController.duration,
      resetTime: NavTabsBaseController.resetTime,
      activeTabIndex: function(tabs) {
        for (var i in tabs) {
          if (tabs[i].active) {
            return Number(i);
          }
        }
        return -1;
      },
      ngRepeatObject: function(element) {
        var expression = element.closest('li[ng-repeat]').attr('ng-repeat');
        var expressionObject = NavTabsBaseController.ngRepeatExpressionObject(expression);
        return expressionObject;
      },
      navTabsElement: function(element, directiveValue) {
        var controllerElement = element.closest('[ng-controller]');
        var navTabsElements = NavTabsBaseController.navTabsElements(controllerElement);
        var aNavTabsElement;
        if (directiveValue) {
          angular.forEach(navTabsElements, function(navTabsElement) {
            navTabsElement = angular.element(navTabsElement);
            var tabElement = navTabsElement.find('li[ng-repeat]').eq(0);
            if (tabElement.length === 0) {
              return;
            }
            var expression = tabElement.attr('ng-repeat');
            var expressionObject = NavTabsBaseController.ngRepeatExpressionObject(expression);
            if (expressionObject.tabsName === directiveValue) {
              aNavTabsElement = angular.element(navTabsElement);
              return;
            }
          });
        } else {
          aNavTabsElement = navTabsElements.eq(0);
        }
        if (!aNavTabsElement) {
          throw '[warning] there is no .nav-tab, array name: ' + directiveValue;
        }
        return aNavTabsElement;
      },
      showTabElement: function(scope, element, type, index) {
        var ngRepeatObject = type === 'prevew' || type === 'next' ? { tabsName:element.closest('[navtabs-model]').attr('navtabs-model') } : this.ngRepeatObject(element);
        var tabs = scope[ngRepeatObject.tabsName];
        var activeTabIndex = this.activeTabIndex(tabs);
        var oldIndex = activeTabIndex;
        var newIndex;
        var updateModel = function() {
          tabs[oldIndex].active = false;
          tabs[newIndex].active = true;
        };
        if (type === 'prevew') {
          newIndex = oldIndex - 1;
          if (newIndex > -1) {
            scope.$apply(function() {
              updateModel();
            });
          }
        }
        if (type === 'next') {
          newIndex = oldIndex + 1;
          if (newIndex < tabs.length) {
            scope.$apply(function() {
              updateModel();
            });
          }
        }
        if (type === 'at') {
          newIndex = index;
          scope.$apply(function() {
            updateModel();
          });
        }
      },
      removeTabElement: function(scope, currentTabElement, tabElements) {
        var obj = this.ngRepeatObject(currentTabElement);
        var tabs = scope[obj.tabsName];
        var currentTabIndex = tabElements.index(currentTabElement);
        var currentTab = tabs[currentTabIndex];
        var activeTabIndex = this.activeTabIndex(tabs);
        if (currentTab.active) {
          if (currentTabIndex <= 0) {
            activeTabIndex = 0;
          } else if (currentTabIndex >= tabs.length - 1) {
            activeTabIndex = tabs.length - 2;
          }
        } else {
          if (currentTabIndex < activeTabIndex) {
            activeTabIndex -= 1;
          }
        }
        var updateModel = function() {
          tabs.splice(currentTabIndex, 1);
          if (tabs.length > 0) {
            tabs[activeTabIndex].active = true;
          }
        };
        var controllerElement = currentTabElement.closest('[ng-controller]');
        var navTabsElements = NavTabsBaseController.navTabsElements(controllerElement);
        var updateFlag = true;
        angular.forEach(navTabsElements, function(navTabsElement) {
          navTabsElement = angular.element(navTabsElement);
          var removeTabElement = navTabsElement.find('li[ng-repeat]').eq(currentTabIndex);
          var attr = navTabsElement.attr('navtabs-scrollable');
          if (typeof attr === 'string') {
            removeTabElement.animate({
              width: 'toggle',
              opacity: 'toggle'
            }, {
              duration: NavTabsBaseController.duration,
              start: function() {
                removeTabElement.find('[navtabs-show]').hide();
              },
              complete: function() {
                if (updateFlag) {
                  scope.$apply(function() {
                    updateModel();
                  });
                  updateFlag = false;
                }
              }
            });
          } else {
            scope.$apply(function() {
              updateModel();
            });
          }
        });
      },
      navtabsScroll: function(attr, navTabsElements, type) {
        angular.forEach(navTabsElements, function(navTabsElement) {
          navTabsElement = angular.element(navTabsElement);
          var tabElement = navTabsElement.find('li[ng-repeat]').eq(0);
          if (!tabElement.length) {
            return;
          }
          var expression = tabElement.attr('ng-repeat');
          var expressionObject = NavTabsBaseController.ngRepeatExpressionObject(expression);
          if (!attr.navtabsModel || expressionObject.tabsName !== attr.navtabsModel) {
            return;
          }
          var position;
          if (type === 'preview') {
            position = navTabsElement.scrollLeft() - navTabsElement.width();
          } else if (type === 'next') {
            position = navTabsElement.scrollLeft() + navTabsElement.width();
          } else if (type === 'begin') {
            position = 0;
          } else if (type === 'end') {
            position = navTabsElement.prop('scrollWidth');
          }
          navTabsElement.animate({
            scrollLeft: position
          }, NavTabsBaseController.duration);
        });
      },
      watchTabElementClass: function(scope, element) {
        var navTabsElement = element.closest('.nav.nav-tabs');
        var tabElements = navTabsElement.find('li[ng-repeat]');
        var currentTabElement = element.closest('li[ng-repeat]');
        var currentTabIndex = tabElements.index(currentTabElement);
        var expression = element.closest('li[ng-repeat]').attr('ng-repeat');
        var expressionObject = NavTabsBaseController.ngRepeatExpressionObject(expression);
        var tabs = scope[expressionObject.tabsName];
        var tab = tabs[currentTabIndex];
        scope.$watch(function() {
          return element.closest('li[ng-repeat]').attr('class');
        }, function(classAttribute) {
          if (classAttribute.match(/active\b/)) {
            NavTabsBaseController.showTabAnimate(tab, tabs, navTabsElement);
          }
        });
      }
    };
  })
  /*
  .directive('navtabsScrollable', function() {
    return {
      link: function postLink(scope, element, attr, ctrl) {
      }
    };
  })
  */
  .directive('navtabsShow', function() {
    return {
      controller: 'NavTabsController',
      link: function postLink(scope, element, attr, ctrl) {
        ctrl.watchTabElementClass(scope, element);
        element.click(function(evt) {
          evt.preventDefault();
          var obj = ctrl.ngRepeatObject(element);
          var tab = scope[obj.tabName];
          var tabs = scope[obj.tabsName];
          var index = ctrl.activeTabIndex(tabs);
          scope.$apply(function() {
            tabs[index].active = false;
            tab.active = true;
          });
        });
      }
    };
  })
  .directive('navtabsRemove', function() {
    return {
      controller: 'NavTabsController',
      link: function postLink(scope, element, attr, ctrl) {
        element.click(function(evt) {
          evt.preventDefault();
          evt.stopPropagation();
          var currentTabElement = element.closest('li[ng-repeat]');
          var navTabsElement = element.closest('.nav.nav-tabs');
          var tabElements = navTabsElement.find('li[ng-repeat]');
          ctrl.removeTabElement(scope, currentTabElement, tabElements);
        });
      }
    };
  })
  .directive('navtabsPreview', function() {
    return {
      controller: 'NavTabsController',
      link: function postLink(scope, element, attr, ctrl) {
        element.click(function(evt) {
          evt.preventDefault();
          var navTabsElement = ctrl.navTabsElement(element, attr.navtabsModel);
          var activeTabElement = navTabsElement.find('li.active');
          if (activeTabElement.length) {
            ctrl.showTabElement(scope, activeTabElement, 'prevew');
          }
        });
      }
    };
  })
  .directive('navtabsNext', function() {
    return {
      controller: 'NavTabsController',
      link: function postLink(scope, element, attr, ctrl) {
        element.click(function(evt) {
          evt.preventDefault();
          var navTabsElement = ctrl.navTabsElement(element, attr.navtabsModel);
          var activeTabElement = navTabsElement.find('li.active');
          if (activeTabElement.length) {
            ctrl.showTabElement(scope, activeTabElement, 'next');
          }
        });
      }
    };
  })
  .directive('navtabsShowAt', function() {
    return {
      controller: 'NavTabsController',
      link: function postLink(scope, element, attr, ctrl) {
        element.change(function(evt) {
          evt.preventDefault();
          var navTabsElement = ctrl.navTabsElement(element, attr.navtabsModel);
          var activeTabElement = navTabsElement.find('li.active');
          var selectedIndex = element.prop('selectedIndex');
          if (activeTabElement.length) {
            ctrl.showTabElement(scope, activeTabElement, 'at', selectedIndex);
          }
        });
      }
    };
  })
  .directive('navtabsScrollBegin', function() {
    return {
      controller: 'NavTabsController',
      link: function postLink(scope, element, attr, ctrl) {
        element.click(function(evt) {
          evt.preventDefault();
          var controllerElement = element.closest('[ng-controller]');
          var navTabsElements = controllerElement.find('[navtabs-scrollable].nav.nav-tabs');
          ctrl.navtabsScroll(attr, navTabsElements, 'begin');
        });
      }
    };
  })
  .directive('navtabsScrollEnd', function() {
    return {
      controller: 'NavTabsController',
      link: function postLink(scope, element, attr, ctrl) {
        element.click(function(evt) {
          evt.preventDefault();
          var controllerElement = element.closest('[ng-controller]');
          var navTabsElements = controllerElement.find('[navtabs-scrollable].nav.nav-tabs');
          ctrl.navtabsScroll(attr, navTabsElements, 'end');
        });
      }
    };
  })
  .directive('navtabsScrollPreview', function() {
    return {
      controller: 'NavTabsController',
      link: function postLink(scope, element, attr, ctrl) {
        element.click(function(evt) {
          evt.preventDefault();
          var controllerElement = element.closest('[ng-controller]');
          var navTabsElements = controllerElement.find('[navtabs-scrollable].nav.nav-tabs');
          ctrl.navtabsScroll(attr, navTabsElements, 'preview');
        });
      }
    };
  })
  .directive('navtabsScrollNext', function() {
    return {
      controller: 'NavTabsController',
      link: function postLink(scope, element, attr, ctrl) {
        element.click(function(evt) {
          evt.preventDefault();
          var controllerElement = element.closest('[ng-controller]');
          var navTabsElements = controllerElement.find('[navtabs-scrollable].nav.nav-tabs');
          ctrl.navtabsScroll(attr, navTabsElements, 'next');
        });
      }
    };
  });
