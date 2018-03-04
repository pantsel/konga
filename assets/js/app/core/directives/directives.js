// Generic models angular module initialize.
(function () {
  'use strict';

  angular.module('frontend.core.directives', [])
    .directive('onKeyEnter', function () {
      return function (scope, element, attrs) {
        element.bind("keydown keypress", function (event) {
          if (event.which === 13) {
            scope.$apply(function () {
              scope.$eval(attrs.onKeyEnter);
            });

            event.preventDefault();
          }
        });
      };
    })

    .directive('googleChart', [function () {

      return {
        link: link,
        // template: '<div id="chart_{{chart.id}}" style="width: 100%; height: 500px;"></div>',
        restrict: 'A',
        scope: {
          chart: '=',
          url: '='
        }
      };

      function link(scope, element, attrs) {

        // console.log("!!!!!!!!!!!!!!!!!!!!!!", scope.chart, scope.url, element);
        console.log("!!!!!!!!!!!!!!!!!!!!!!", scope.url + scope.chart.data_url + '&after=-120&format=datasource&options=nonzero')

        // google.charts.load('current', {'packages':['corechart']});
        // google.charts.setOnLoadCallback(drawChart);

        function drawChart() {
          var query = new google.visualization.Query(scope.url + scope.chart.data_url + '&after=-120&format=datasource&options=nonzero');
          var chart = new google.visualization.AreaChart( angular.element(element)[0]);
          var options = {
            title:  chart.title,
            isStacked: 'false',
            vAxis: {minValue: 100},
            selectionMode: 'multiple',
            displayAnnotations: true
          };

          setInterval(function() {
            query.send(function(data) {
              chart.draw(data.getDataTable(), options);
            });
          }, 1000);
        }


        drawChart();




      }

    }])

    .directive('sidenav', ['$window', '$rootScope', function ($window, $rootScope) {

      return {
        link: link,
        restrict: 'A'
      };

      function link(scope, element, attrs) {

        var sideNavEl = document.querySelector('.js-side-nav');
        var bodyEl = document.querySelector('.body');
        var mainContainerEl = document.querySelector('.main-container-wrapper');
        var sideNavContentEl = document.querySelector('.side-nav__content')
        scope.width = $window.innerWidth;
        var isSideNavShown = false;

        sideNavEl.addEventListener('click', function (e) {
          if (e.offsetX > sideNavContentEl.offsetWidth) {
            hideSideNav()
          }
        });


        function onResize() {
          // uncomment for only fire when $window.innerWidth change
          // if (scope.width !== $window.innerWidth)
          {
            scope.width = $window.innerWidth;

            showOrHideSidenav()

            scope.$digest();
          }
        }

        function showOrHideSidenav() {
          if (scope.width >= 992) {
            showSideNav()
          } else {
            hideSideNav()
          }
        }


        function showSideNav() {
          sideNavEl.classList.add('side-nav--animatable');
          mainContainerEl.classList.add('side-nav--animatable');
          sideNavEl.classList.add('side-nav--visible');
          bodyEl.classList.add('_expose-aside');
          if (scope.width < 992) {
            bodyEl.classList.add('w-sm');
          }
          isSideNavShown = true;
        }


        function hideSideNav() {
          sideNavEl.classList.add('side-nav--animatable');
          mainContainerEl.classList.add('side-nav--animatable');
          sideNavEl.classList.remove('side-nav--visible');
          bodyEl.classList.remove('_expose-aside');
          bodyEl.classList.remove('w-sm');
          isSideNavShown = false;
        }

        function cleanUp() {
          angular.element($window).off('resize', onResize);
        }

        showOrHideSidenav()

        angular.element($window).on('resize', onResize);
        scope.$on('$destroy', cleanUp);

        $rootScope.$on('sidenav-toggle', function () {
          if (isSideNavShown) {
            hideSideNav()
          } else {
            showSideNav()
          }
        })

      }

    }])
    .directive('fileSelect', ['$window', function ($window) {
      return {
        restrict: 'A',
        require: 'ngModel',
        link: function (scope, el, attr, ctrl) {
          var fileReader = new $window.FileReader();

          fileReader.onload = function () {
            ctrl.$setViewValue(fileReader.result);

            if ('fileLoaded' in attr) {
              scope.$eval(attr['fileLoaded']);
            }
          };

          fileReader.onprogress = function (event) {
            if ('fileProgress' in attr) {
              scope.$eval(attr['fileProgress'],
                {'$total': event.total, '$loaded': event.loaded});
            }
          };

          fileReader.onerror = function () {
            if ('fileError' in attr) {
              scope.$eval(attr['fileError'],
                {'$error': fileReader.error});
            }
          };

          var fileType = attr['fileSelect'];

          el.bind('change', function (e) {
            var fileName = e.target.files[0];

            if (fileType === '' || fileType === 'text') {
              fileReader.readAsText(fileName);
            } else if (fileType === 'data') {
              fileReader.readAsDataURL(fileName);
            }
          });
        }
      };
    }]);
}());
