(function() {
  var LoginCtrl,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  angular.module('starter.controllers', ['starter.services']).controller('LoginCtrl', LoginCtrl = (function() {
    LoginCtrl.$inject = ['$scope', 'Auth', '$state', '$ionicHistory', '$ionicLoading', 'Authentication'];

    function LoginCtrl($scope1, Auth, $state, $ionicHistory, $ionicLoading, Authentication) {
      this.$scope = $scope1;
      this.Auth = Auth;
      this.$state = $state;
      this.$ionicHistory = $ionicHistory;
      this.$ionicLoading = $ionicLoading;
      this.Authentication = Authentication;
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
      return this.Authentication.logout();
    };

    return LoginCtrl;

  })()).controller('ArticlesCtrl', (function() {
    _Class.$inject = ['$scope', '$firebaseArray', '$firebaseObject', 'FIREBASE_URL', '$ionicModal', 'ArticleService'];

    function _Class($scope1, $firebaseArray, $firebaseObject1, FIREBASE_URL, $ionicModal, Article) {
      this.$scope = $scope1;
      this.$firebaseObject = $firebaseObject1;
      this.FIREBASE_URL = FIREBASE_URL;
      this.$ionicModal = $ionicModal;
      this.Article = Article;
      this.uploadImage = bind(this.uploadImage, this);
      this.$scope.$watch('user', (function(_this) {
        return function(user) {
          if (user) {
            return _this.articles = $firebaseArray(new Firebase(_this.FIREBASE_URL).child("articles/" + _this.$scope.user.uid));
          }
        };
      })(this));
    }

    _Class.prototype.addArticle = function() {
      return this.articles.$add({}).then((function(_this) {
        return function(ref) {
          _this.article = _this.$firebaseObject(ref);
          return _this.$ionicModal.fromTemplateUrl('templates/editArticle.html', {
            scope: _this.$scope,
            animation: 'slide-in-up'
          }).then(function(modal) {
            _this.modal = modal;
            return _this.modal.show();
          });
        };
      })(this));
    };

    _Class.prototype.uploadImage = function(input) {
      var file;
      if (!input.files.length) {
        return;
      }
      file = input.files[0];
      return this.Article.uploadImage(this.article, file).then((function(_this) {
        return function(data) {
          return _this.article.imageUrl = data.Location;
        };
      })(this));
    };

    _Class.prototype.closeModal = function() {
      if (this.modal) {
        this.article.$save();
        this.modal.hide();
        return this.article = null;
      }
    };

    _Class.prototype.deleteArticle = function(article) {
      return this.articles.$remove(article);
    };

    return _Class;

  })()).controller('ArticleCtrl', (function() {
    _Class.$inject = ['$scope', '$firebaseObject', '$stateParams', 'FIREBASE_URL', '$ionicModal', '$cordovaCapture', 'AWSService', 'ArticleService'];

    function _Class($scope1, $firebaseObject, $stateParams1, FIREBASE_URL, $ionicModal, $cordovaCapture, AWSService, Article) {
      this.$scope = $scope1;
      this.$stateParams = $stateParams1;
      this.FIREBASE_URL = FIREBASE_URL;
      this.$ionicModal = $ionicModal;
      this.$cordovaCapture = $cordovaCapture;
      this.AWSService = AWSService;
      this.Article = Article;
      this.uploadImage = bind(this.uploadImage, this);
      this.$scope.$watch('user', (function(_this) {
        return function(user) {
          if (user) {
            _this.article = $firebaseObject(new Firebase(_this.FIREBASE_URL).child("articles/" + _this.$scope.user.uid + "/" + _this.$stateParams.articleId));
            return _this.article.$bindTo(_this.$scope, 'article');
          }
        };
      })(this));
    }

    _Class.prototype.getImage = function() {
      var options;
      options = {
        limit: 3
      };
      return this.$cordovaCapture.captureImage(options).then((function(_this) {
        return function(imageData) {
          return console.log('Success! Image data is here', imageData);
        };
      })(this), (function(_this) {
        return function(err) {
          return console.log('Error with image', err);
        };
      })(this));
    };

    _Class.prototype.uploadImage = function(input) {
      var file;
      if (!input.files.length) {
        return;
      }
      file = input.files[0];
      return this.Article.uploadImage(this.article, file).then((function(_this) {
        return function(data) {
          return _this.$scope.article.imageUrl = data.Location;
        };
      })(this));
    };

    _Class.prototype.editArticle = function() {
      return this.$ionicModal.fromTemplateUrl('templates/editArticle.html', {
        scope: this.$scope,
        animation: 'slide-in-up'
      }).then((function(_this) {
        return function(modal) {
          _this.modal = modal;
          return _this.modal.show();
        };
      })(this));
    };

    _Class.prototype.closeModal = function() {
      if (this.modal) {
        this.article.$save();
        return this.modal.hide();
      }
    };

    return _Class;

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
