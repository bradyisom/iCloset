(function() {
  var LoginCtrl;

  angular.module('starter.controllers', ['starter.services']).controller('LoginCtrl', LoginCtrl = (function() {
    LoginCtrl.$inject = ['$scope', 'Auth', '$state', '$ionicHistory', '$ionicLoading'];

    function LoginCtrl($scope1, Auth, $state, $ionicHistory, $ionicLoading) {
      this.$scope = $scope1;
      this.Auth = Auth;
      this.$state = $state;
      this.$ionicHistory = $ionicHistory;
      this.$ionicLoading = $ionicLoading;
      this.loginData = {};
    }

    LoginCtrl.prototype.socialLogin = function(provider) {
      var oauthScope;
      this.error = null;
      oauthScope = 'email';
      this.$ionicLoading.show();
      return this.Auth.$authWithOAuthPopup(provider, {
        scope: oauthScope
      }).then((function(_this) {
        return function(authData) {
          _this.$ionicLoading.hide();
          _this.$ionicHistory.nextViewOptions({
            historyRoot: true
          });
          return _this.$state.go('app.profile');
        };
      })(this))["catch"]((function(_this) {
        return function(error) {
          _this.$ionicLoading.hide();
          _this.error = error.toString();
          return console.log('login error', error);
        };
      })(this));
    };

    LoginCtrl.prototype.emailLogin = function() {
      var oauthScope;
      this.error = null;
      oauthScope = 'email';
      this.$ionicLoading.show();
      return this.Auth.$authWithPassword({
        email: this.loginData.email,
        password: this.loginData.password
      }).then((function(_this) {
        return function(authData) {
          _this.$ionicLoading.hide();
          _this.$ionicHistory.nextViewOptions({
            historyRoot: true
          });
          return _this.$state.go('app.profile');
        };
      })(this))["catch"]((function(_this) {
        return function(error) {
          _this.$ionicLoading.hide();
          _this.error = error.toString();
          return console.log('login error', error);
        };
      })(this));
    };

    LoginCtrl.prototype.register = function() {
      this.error = null;
      if (this.loginData.password !== this.loginData.passwordConfirm) {
        this.error = 'Passwords must match';
        return;
      }
      this.$ionicLoading.show();
      return this.Auth.$createUser({
        email: this.loginData.email,
        password: this.loginData.password
      }).then((function(_this) {
        return function() {
          _this.$ionicLoading.hide();
          return _this.$ionicHistory.goBack();
        };
      })(this))["catch"]((function(_this) {
        return function(error) {
          _this.$ionicLoading.hide();
          _this.error = error.toString();
          return console.log('register error', error);
        };
      })(this));
    };

    LoginCtrl.prototype.logout = function() {
      this.$ionicHistory.nextViewOptions({
        historyRoot: true
      });
      this.$state.go('app.login');
      return this.Auth.$unauth();
    };

    return LoginCtrl;

  })()).controller('PlaylistsCtrl', function($scope) {
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
