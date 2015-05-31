(function() {
  angular.module('starter.directives', []).directive('googleSignin', function() {
    return {
      restrict: 'A',
      scope: {
        afterSignin: '&',
        clientId: '@'
      },
      link: function(scope, ele, attrs) {
        var callbackId, directiveScope;
        callbackId = "_googleSigninCallback";
        directiveScope = scope;
        window[callbackId] = function() {
          var oauth;
          oauth = arguments[0];
          directiveScope.afterSignin({
            oauth: oauth
          });
          return window[callbackId] = null;
        };
        return gapi.signin.render(ele[0], {
          clientid: scope.clientId,
          cookiepolicy: 'single_host_origin',
          callback: callbackId,
          scope: 'https://www.googleapis.com/auth/plus.login email',
          requestvisibleactions: 'http://schema.org/AddAction http://schema.org/CommentAction'
        });
      }
    };
  }).directive('facebookSignin', function() {
    return {
      restrict: 'A',
      scope: {},
      link: function(scope, el, attrs) {
        var updateUserBox;
        updateUserBox = function() {
          var user_box;
          user_box = el[0];
          user_box.innerHTML = "<span><fb:name uid=loggedinuser useyou='false'></fb:name><fb:profile-pic uid=loggedinuser facebook-logo='true'></fb:profile-pic></span>";
          return scope.$evalAsync(function() {
            console.log('FB', FB);
            return FB.XFBML.parse();
          });
        };
        return updateUserBox();
      }
    };
  });

}).call(this);
