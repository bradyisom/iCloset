(function() {
  angular.module('starter', ['ionic', 'starter.controllers', 'starter.directives', 'starter.services']).run(function($ionicPlatform, Authentication, AWSService, Auth, $rootScope) {
    $ionicPlatform.ready(function() {
      if (window.cordova && window.cordova.plugins.Keyboard) {
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      }
      if (window.StatusBar) {
        return StatusBar.styleDefault();
      }
    });
    Authentication.init('us-east-1:d0692cb3-b12a-44bf-afb1-91c0e44dee9a');
    return Auth.$onAuth(function(authData) {
      $rootScope.authData = authData;
      if (authData) {
        console.log('Firebase credentials', authData);
        return Authentication.socialSignIn(authData).then(function() {
          return AWSService.getCredentials();
        });
      }
    });
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
      return gapi.load('auth2', function() {
        window.auth2 = gapi.auth2.init({
          client_id: '57043893067-1j9b63ap9ljggsd3m5nvhbe5n0bm180n.apps.googleusercontent.com',
          scope: 'email profile openid'
        });
        return angular.bootstrap(document, ['starter']);
      });
    });
  };

}).call(this);
