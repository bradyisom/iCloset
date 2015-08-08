# Ionic Starter App

# angular.module is a global place for creating, registering and retrieving Angular modules
# 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
# the 2nd parameter is an array of 'requires'
# 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers', 'starter.directives', 'starter.services'])

.run ($ionicPlatform, Authentication, AWSService, Auth, $rootScope) ->
  $ionicPlatform.ready ->
    # Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    # for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard)
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true)
    if window.StatusBar
      # org.apache.cordova.statusbar required
      StatusBar.styleDefault()

  Authentication.init('us-east-1:d0692cb3-b12a-44bf-afb1-91c0e44dee9a')

  Auth.$onAuth (authData)->
    $rootScope.authData = authData

    if authData
      console.log 'Firebase credentials', authData

      Authentication.socialSignIn(authData).then(->
          AWSService.getCredentials()
      )


.config ($stateProvider, $urlRouterProvider) ->
  $stateProvider

  .state 'app',
    url: "/app"
    abstract: true
    templateUrl: "templates/menu.html"
    controller: 'AppCtrl'

  .state 'app.search',
    url: "/search"
    views: 
      'menuContent':
        templateUrl: "templates/search.html"

  .state 'app.browse',
    url: "/browse"
    views:
      'menuContent':
        templateUrl: "templates/browse.html"

  .state 'app.playlists',
    url: "/playlists"
    views:
      'menuContent':
        templateUrl: "templates/playlists.html"
        controller: 'PlaylistsCtrl'

  .state 'app.single',
    url: "/playlists/:playlistId"
    views:
      'menuContent':
        templateUrl: "templates/playlist.html"
        controller: 'PlaylistCtrl'

  # if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise '/app/playlists'


window.onLoadCallback = ->
  # console.log 'onLoadCallback'
  # When the document is ready
  angular.element(document).ready ->
    # Bootstrap the oauth2 library
    gapi.load 'auth2', ->
      window.auth2 = gapi.auth2.init(
        client_id: '57043893067-1j9b63ap9ljggsd3m5nvhbe5n0bm180n.apps.googleusercontent.com'
        scope: 'email profile openid'
      )
      # Finally, bootstrap our angular app
      angular.bootstrap document, ['starter']