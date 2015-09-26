# Ionic Starter App

# angular.module is a global place for creating, registering and retrieving Angular modules
# 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
# the 2nd parameter is an array of 'requires'
# 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'ngCordova', 'starter.controllers', 'starter.directives', 'starter.services'])

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


.config ($stateProvider, $urlRouterProvider) ->
  $stateProvider

  .state 'app',
    url: "/app"
    abstract: true
    templateUrl: "templates/menu.html"
    # controller: 'AppCtrl'

  .state 'app.profile',
    url: "/profile"
    views: 
      'menuContent':
        templateUrl: "templates/profile.html"
        controller: 'LoginCtrl as ctrl'

  .state 'app.login',
    url: "/login"
    views: 
      'menuContent':
        templateUrl: "templates/login.html"
        controller: 'LoginCtrl as ctrl'

  .state 'app.register',
    url: "/register"
    views: 
      'menuContent':
        templateUrl: "templates/register.html"
        controller: 'LoginCtrl as ctrl'

  .state 'app.articles',
    url: "/articles"
    views:
      'menuContent':
        templateUrl: "templates/articles.html"
        controller: 'ArticlesCtrl as ctrl'

  .state 'app.single',
    url: "/articles/:articleId"
    views:
      'menuContent':
        templateUrl: "templates/article.html"
        controller: 'ArticleCtrl as ctrl'

  # if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise '/app/login'

