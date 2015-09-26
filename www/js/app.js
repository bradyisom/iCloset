(function() {
  angular.module('starter', ['ionic', 'ngCordova', 'starter.controllers', 'starter.directives', 'starter.services']).run(function($ionicPlatform, Authentication, AWSService, Auth, $rootScope) {
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
      templateUrl: "templates/menu.html"
    }).state('app.profile', {
      url: "/profile",
      views: {
        'menuContent': {
          templateUrl: "templates/profile.html",
          controller: 'LoginCtrl as ctrl'
        }
      }
    }).state('app.login', {
      url: "/login",
      views: {
        'menuContent': {
          templateUrl: "templates/login.html",
          controller: 'LoginCtrl as ctrl'
        }
      }
    }).state('app.register', {
      url: "/register",
      views: {
        'menuContent': {
          templateUrl: "templates/register.html",
          controller: 'LoginCtrl as ctrl'
        }
      }
    }).state('app.articles', {
      url: "/articles",
      views: {
        'menuContent': {
          templateUrl: "templates/articles.html",
          controller: 'ArticlesCtrl as ctrl'
        }
      }
    }).state('app.single', {
      url: "/articles/:articleId",
      views: {
        'menuContent': {
          templateUrl: "templates/article.html",
          controller: 'ArticleCtrl as ctrl'
        }
      }
    });
    return $urlRouterProvider.otherwise('/app/login');
  });

}).call(this);
