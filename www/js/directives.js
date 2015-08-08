(function() {
  angular.module('starter.directives', []).directive('googleSignin', function() {
    return {
      restrict: 'A',
      scope: {
        afterSignin: '&'
      },
      link: function(scope, el, ettrs) {
        return auth2.attachClickHandler(el[0], {}, function(googleUser) {
          return scope.afterSignin({
            authData: googleUser.getAuthResponse()
          });
        }, function(error) {
          return console.log('error in Google login', JSON.stringify(error, void 0, 2));
        });
      }
    };
  });

}).call(this);
