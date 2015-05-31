(function() {
  angular.module('starter.controllers', ['starter.services']).controller('AppCtrl', function($scope, $ionicModal, $timeout, Authentication, AWSService) {
    $scope.loginData = {};
    $scope.closeLogin = function() {
      return $scope.modal.hide();
    };
    $scope.login = function() {
      if (!$scope.modal) {
        return $ionicModal.fromTemplateUrl('templates/login.html', {
          scope: $scope
        }).then(function(modal) {
          $scope.modal = modal;
          return $scope.modal.show();
        });
      } else {
        return $scope.modal.show();
      }
    };
    $scope.signedInGoogle = function(authResult) {
      if (authResult['status']['signed_in']) {
        return Authentication.googleSignIn(authResult).then(function() {
          return AWSService.getCredentials();
        }).then(function(credentials) {
          return console.log('got credentials', credentials);
        });
      }
    };
    return $scope.doLogin = function() {
      console.log('Doing login', $scope.loginData);
      return $timeout(function() {
        return $scope.closeLogin();
      }, 1000);
    };
  }).controller('PlaylistsCtrl', function($scope) {
    return $scope.playlists = [
      {
        title: 'Reggae',
        id: 1
      }, {
        title: 'Chill',
        id: 2
      }, {
        title: 'Dubstep',
        id: 3
      }, {
        title: 'Indie',
        id: 4
      }, {
        title: 'Rap',
        id: 5
      }, {
        title: 'Rock',
        id: 6
      }, {
        title: 'Cowbell',
        id: 7
      }
    ];
  }).controller('PlaylistCtrl', function($scope, $stateParams) {});

}).call(this);
