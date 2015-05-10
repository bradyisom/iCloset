angular.module('starter.directives', [])
.directive('googleSignin', function() {
  return {
    restrict: 'A',
    // template: '<span id="signinButton"></span>',
    // replace: true,
    scope: {
      afterSignin: '&',
      clientId: '@'
    },
    link: function(scope, ele, attrs) {
      // Create a custom callback method
      var callbackId = "_googleSigninCallback",
          directiveScope = scope;
      window[callbackId] = function() {
        var oauth = arguments[0];
        directiveScope.afterSignin({oauth: oauth});
        window[callbackId] = null;
      };

      gapi.signin.render(ele[0], {
        clientid: scope.clientId, 
        cookiepolicy: 'single_host_origin',
        callback: callbackId, 
        requestvisibleactions: 'http://schema.org/AddAction http://schema.org/CommentAction'
      });
    }
  }
});