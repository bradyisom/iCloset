angular.module('starter.directives', [])
.directive('googleSignin', function() {
  return {
    restrict: 'A',
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
        scope: 'https://www.googleapis.com/auth/plus.login email',
        requestvisibleactions: 'http://schema.org/AddAction http://schema.org/CommentAction'
      });
    }
  }
})
// .directive('facebookSignin', function() {
//   return {
//     restrict: 'A',
//     scope: {

//     },
//     link: function(scope, el, attrs) {
//       var updateUserBox = function() {
//         var user_box = el[0];
//         user_box.innerHTML = "<span><fb:name uid=loggedinuser useyou='false'></fb:name><fb:profile-pic uid=loggedinuser facebook-logo='true'></fb:profile-pic></span>";
//         FB.XFBML.Host.parseDomTree();
//             // } 

//         FB_RequireFeatures(["Connect"], function() {
//                 FB.init("appkey", "/Content/xd_receiver.htm", { "ifUserConnected": updateUserBox });
//                 FB.Connect.showPermissionDialog("publish_stream,status_update");
//                 FB.Connect.requireSession();
//             });      
//       };
//       updateUserBox();
//     }
//   };
// });