(function() {
  angular.module('starter', ['ionic', 'starter.controllers', 'starter.directives', 'starter.services']).run(function($ionicPlatform, Authentication) {
    $ionicPlatform.ready(function() {
      if (window.cordova && window.cordova.plugins.Keyboard) {
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      }
      if (window.StatusBar) {
        return StatusBar.styleDefault();
      }
    });
    return Authentication.init('us-east-1:d0692cb3-b12a-44bf-afb1-91c0e44dee9a');
  }).config(function($stateProvider, $urlRouterProvider) {
    $stateProvider.state('app', {
      url: "/app",
      abstract: true,
      templateUrl: "templates/menu.html",
      controller: 'AppCtrl'
    }).state('app.search', {
      url: "/search",
      views: {
        'menuContent': {
          templateUrl: "templates/search.html"
        }
      }
    }).state('app.browse', {
      url: "/browse",
      views: {
        'menuContent': {
          templateUrl: "templates/browse.html"
        }
      }
    }).state('app.playlists', {
      url: "/playlists",
      views: {
        'menuContent': {
          templateUrl: "templates/playlists.html",
          controller: 'PlaylistsCtrl'
        }
      }
    }).state('app.single', {
      url: "/playlists/:playlistId",
      views: {
        'menuContent': {
          templateUrl: "templates/playlist.html",
          controller: 'PlaylistCtrl'
        }
      }
    });
    return $urlRouterProvider.otherwise('/app/playlists');
  });

  window.onLoadCallback = function() {
    return angular.element(document).ready(function() {
      return gapi.client.load('oauth2', 'v2', function() {
        return angular.bootstrap(document, ['starter']);
      });
    });
  };

}).call(this);
