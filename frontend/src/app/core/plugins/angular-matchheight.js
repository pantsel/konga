/*
 * Angular Match Height
 * An angular directive to match heights of divs
 *
 */

angular.module('angular-matchheight', [])
    .directive('ilnMatchHeight', [
        function () {

            var elems = [];

            function updateHeights(matchHeights) {
                var elemHeights = [];

                for(var i = 0; i < elems.length; i++) {
                    elems[i].css('height', '');
                    elemHeights.push(elems[i][0].offsetHeight);
                }

                if(matchHeights == false) {
                    return;
                }

                var maxHeight = Math.max.apply(Math, elemHeights);

                for(var i = 0; i < elems.length; i++) {
                    elems[i].css('height',  maxHeight+'px');
                }
            }

            return {
                restrict: 'A',
                scope: {
                    updateOnChange: '=',
                    enableWhen: '='
                },
                link: function (scope, elem, attrs) {
                    elems.push(elem);

                    scope.$watch(elems, function() {
                        updateHeights();
                    });

                    scope.$on('$destroy', function() {
                        elems = [];
                    });

                    if(scope.updateOnChange) {
                        scope.$watch('updateOnChange', function() {
                            updateHeights(scope.enableWhen);
                        });
                    }
                }
            };
        }
    ]);