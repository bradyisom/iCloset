angular.module('starter.directives', [])
.directive 'googleSignin', ->
    restrict: 'A'
    scope:
      afterSignin: '&'
      clientId: '@'
    link: (scope, ele, attrs)->
      # Create a custom callback method
      callbackId = "_googleSigninCallback"
      directiveScope = scope
      window[callbackId] = ->
        oauth = arguments[0]
        directiveScope.afterSignin({oauth: oauth})
        window[callbackId] = null

      gapi.signin.render ele[0], 
        clientid: scope.clientId
        cookiepolicy: 'single_host_origin'
        callback: callbackId
        scope: 'https://www.googleapis.com/auth/plus.login email'
        requestvisibleactions: 'http://schema.org/AddAction http://schema.org/CommentAction'

.directive 'facebookSignin', ->
    restrict: 'A'
    scope: {}
    link: (scope, el, attrs) ->
      updateUserBox = ->
        user_box = el[0]
        user_box.innerHTML = "<span><fb:name uid=loggedinuser useyou='false'></fb:name><fb:profile-pic uid=loggedinuser facebook-logo='true'></fb:profile-pic></span>"
        # FB.XFBML.Host.parseDomTree();
        scope.$evalAsync ->
          console.log('FB', FB)
          FB.XFBML.parse()

            # } 

        # FB_RequireFeatures(["Connect"], function() {
        #         FB.init("appkey", "/Content/xd_receiver.htm", { "ifUserConnected": updateUserBox });
        #         FB.Connect.showPermissionDialog("publish_stream,status_update");
        #         FB.Connect.requireSession();
        #     });      
      updateUserBox()
