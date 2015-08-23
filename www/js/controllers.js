(function() {
  angular.module('starter.controllers', ['starter.services']).controller('AppCtrl', function($scope, $ionicModal, $timeout, Authentication, AWSService, Auth) {
    $scope.loginData = {};
    $scope.googleLogin = function(googleAuthData) {
      return Auth.$authWithOAuthToken("google", googleAuthData.access_token).then(function(authData) {
        return authData.google.id_token = googleAuthData.id_token;
      })["catch"](function(error) {
        return console.log('login error', error);
      });
    };
    $scope.socialLogin = function(provider) {
      var oauthScope;
      oauthScope = 'email';
      return Auth.$authWithOAuthPopup(provider, {
        scope: oauthScope
      })["catch"](function(error) {
        return console.log('login error', error);
      });
    };
    $scope.logout = function() {
      return Auth.$unauth();
    };
    $scope.closeLogin = function() {
      return $scope.modal.hide();
    };
    return $scope.login = function() {
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
