(function() {
  var AWSService, ArticleService, Authentication, LocalStorage, UserService,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  angular.module('starter.services', ['firebase']).service('LocalStorage', LocalStorage = (function() {
    function LocalStorage() {
      this.isEnabled = typeof localStorage !== 'undefined';
    }

    LocalStorage.prototype.get = function(name, defaultValue) {
      var item, value;
      value = defaultValue;
      if (this.isEnabled) {
        item = localStorage.getItem(name);
        if (item != null ? item.length : void 0) {
          value = JSON.parse(item);
        } else {
          value = defaultValue;
        }
      }
      return value;
    };

    LocalStorage.prototype.remove = function(name) {
      if (this.isEnabled) {
        return localStorage.removeItem(name);
      }
    };

    LocalStorage.prototype.set = function(name, value) {
      if (this.isEnabled) {
        localStorage.setItem(name, JSON.stringify(value));
      }
      return value;
    };

    return LocalStorage;

  })()).service('AWSService', [
    '$q', '$cacheFactory', 'LocalStorage', AWSService = (function() {
      function AWSService($q, $$cacheFactory, LocalStorage1) {
        this.$q = $q;
        this.$$cacheFactory = $$cacheFactory;
        this.LocalStorage = LocalStorage1;
        this.dynamoCache = this.$$cacheFactory('dynamo');
        this.s3Cache = this.$$cacheFactory('s3');
      }

      AWSService.prototype.getCredentials = function() {
        var defer;
        defer = this.$q.defer();
        AWS.config.credentials.get(function(err) {
          if (err) {
            defer.reject(err);
            return console.log('error logging into Cognito', err);
          } else {
            console.log('AWS credentials', AWS.config.credentials);
            this.LocalStorage.set('identityId', AWS.config.credentials.identityId);
            return defer.resolve(AWS.config.credentials);
          }
        });
        return defer.promise;
      };

      AWSService.prototype.dynamo = function(params) {
        var d;
        d = this.$q.defer();
        angular.extend(params, {
          endpoint: new AWS.Endpoint('http://localhost:8000')
        });
        this.getCredentials().then((function(_this) {
          return function() {
            var table;
            table = _this.dynamoCache.get(JSON.stringify(params));
            if (!table) {
              table = new AWS.DynamoDB(params);
              _this.dynamoCache.put(JSON.stringify(params), table);
            }
            return d.resolve(table);
          };
        })(this));
        return d.promise;
      };

      AWSService.prototype.s3 = function(params) {
        params || (params = {});
        params.Bucket || (params.Bucket = 'icloset.bradyisom.com');
        return new AWS.S3({
          params: params
        });
      };

      return AWSService;

    })()
  ]).service('UserService', [
    '$rootScope', '$q', '$http', 'AWSService', UserService = (function() {
      function UserService($rootScope, $q, $http, AWSService1) {
        this.$rootScope = $rootScope;
        this.$q = $q;
        this.$http = $http;
        this.AWSService = AWSService1;
        this.user = null;
        this.UsersTable = 'Users';
      }

      UserService.prototype.setCurrentUser = function(u) {
        var d;
        if (u && !u.error) {
          this.user = u;
          return this.currentUser();
        } else {
          d = this.$q.defer();
          d.reject(u.error);
          return d.promise;
        }
      };

      UserService.prototype.currentUser = function() {
        var d;
        d = this.$q.defer();
        this.AWSService.dynamo({
          params: {
            TableName: this.UsersTable
          }
        }).then((function(_this) {
          return function(table) {
            return table.getItem({
              Key: {
                'User email': {
                  S: _this.user.email
                }
              }
            }, function(err, data) {
              var itemParams;
              if (Object.keys(data).length === 0) {
                itemParams = {
                  Item: {
                    'User email': {
                      S: _this.user.email
                    },
                    data: {
                      S: JSON.stringify(_this.user)
                    }
                  }
                };
                return table.putItem(itemParams, function(err, data) {
                  return d.resolve(e);
                });
              } else {
                _this.user = JSON.parse(data.Item.data.S);
                return d.resolve(_this.user);
              }
            });
          };
        })(this));
        d.promise.then((function(_this) {
          return function(u) {
            return _this.$rootScope.user = u;
          };
        })(this));
        return d.promise;
      };

      return UserService;

    })()
  ]).constant('FIREBASE_URL', "https://icloset.firebaseio.com").factory("Auth", [
    '$firebaseAuth', 'FIREBASE_URL', function($firebaseAuth, FIREBASE_URL) {
      var usersRef;
      usersRef = new Firebase(FIREBASE_URL);
      return $firebaseAuth(usersRef);
    }
  ]).service('Authentication', [
    'LocalStorage', 'Auth', '$q', '$http', 'UserService', '$rootScope', '$firebaseObject', 'FIREBASE_URL', Authentication = (function() {
      function Authentication(LocalStorage1, Auth, $q, $http, UserService1, $rootScope, $firebaseObject, FIREBASE_URL1) {
        this.LocalStorage = LocalStorage1;
        this.Auth = Auth;
        this.$q = $q;
        this.$http = $http;
        this.UserService = UserService1;
        this.$rootScope = $rootScope;
        this.$firebaseObject = $firebaseObject;
        this.FIREBASE_URL = FIREBASE_URL1;
        this.poolId = '';
        this.googleIdToken = '';
        this.firebaseRef = new Firebase(this.FIREBASE_URL);
        this.Auth.$onAuth((function(_this) {
          return function(authData) {
            _this.$rootScope.authData = authData;
            if (authData) {
              _this.createUser(authData);
              return _this.socialSignIn(authData).then(function() {
                return _this.$rootScope.$broadcast('login');
              });
            } else {
              return _this.$rootScope.$broadcast('logout');
            }
          };
        })(this));
      }

      Authentication.prototype.init = function(poolId) {
        var existingId;
        AWS.config.region = 'us-east-1';
        this.poolId = poolId;
        existingId = this.LocalStorage.get('identityId');
        if (existingId) {
          return AWS.config.credentials.identityId = existingId;
        }
      };

      Authentication.prototype.createUser = function(authData) {
        var user;
        user = this.$firebaseObject(this.firebaseRef.child("users/" + authData.uid));
        user.$loaded().then((function(_this) {
          return function() {
            if (!user.uid) {
              user.uid = authData.uid;
              user.provider = authData.provider;
              user.name = authData[authData.provider].displayName || authData[authData.provider].email;
              user.email = authData[authData.provider].email || '@' + authData[authData.provider].username;
              return user.$save();
            }
          };
        })(this));
        user.$bindTo(this.$rootScope, 'user').then((function(_this) {
          return function(unbind) {
            return _this.unbindUser = unbind;
          };
        })(this));
        return this.userRef = user;
      };

      Authentication.prototype.socialSignIn = function(authResult) {
        var defer;
        defer = this.$q.defer();
        this.$http.post('https://u8x98h3ig6.execute-api.us-east-1.amazonaws.com/prod/FirebaseCognitoToken', {
          'token': authResult.token
        }).success((function(_this) {
          return function(data, status, headers, config) {
            var params;
            if (!data.failure) {
              params = {
                RoleArn: 'arn:aws:iam::135172764304:role/Cognito_iClosetAuth_Role',
                WebIdentityToken: data.Token
              };
              AWS.config.credentials = new AWS.WebIdentityCredentials(params);
              AWS.config.credentials.refresh(function(err) {
                return _this.$rootScope.user.$awsId = AWS.config.credentials.data.SubjectFromWebIdentityToken;
              });
              return defer.resolve();
            } else {
              return defer.reject();
            }
          };
        })(this))["catch"](function(err) {
          console.log('lambda error', err);
          return defer.reject();
        });
        return defer.promise;
      };

      Authentication.prototype.logout = function() {
        if (this.userRef) {
          this.unbindUser();
          this.userRef.$destroy();
          this.userRef = null;
        }
        return this.Auth.$unauth();
      };

      return Authentication;

    })()
  ]).service('ArticleService', [
    '$rootScope', '$q', 'AWSService', ArticleService = (function() {
      function ArticleService($rootScope, $q, AWSService1) {
        this.$rootScope = $rootScope;
        this.$q = $q;
        this.AWSService = AWSService1;
        this.uploadImage = bind(this.uploadImage, this);
      }

      ArticleService.prototype.uploadImage = function(article, file) {
        var defer, params;
        params = {
          Key: this.$rootScope.user.$awsId + "/articles/" + article.$id + "/" + file.name,
          ContentType: file.type,
          Body: file
        };
        defer = this.$q.defer();
        this.AWSService.s3().upload(params, (function(_this) {
          return function(err, data) {
            if (err) {
              console.log('ERROR uploading file', err);
              return defer.reject(err);
            } else {
              return defer.resolve(data);
            }
          };
        })(this));
        return defer.promise;
      };

      return ArticleService;

    })()
  ]);

}).call(this);
