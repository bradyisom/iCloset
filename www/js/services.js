(function() {
  var AWSService, Authentication, LocalStorage, UserService,
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
  ]).factory("Auth", [
    '$firebaseAuth', function($firebaseAuth) {
      var usersRef;
      usersRef = new Firebase("https://icloset.firebaseio.com");
      return $firebaseAuth(usersRef);
    }
  ]).service('Authentication', [
    'LocalStorage', 'Auth', '$q', 'UserService', Authentication = (function() {
      function Authentication(LocalStorage1, Auth, $q, UserService1) {
        this.LocalStorage = LocalStorage1;
        this.Auth = Auth;
        this.$q = $q;
        this.UserService = UserService1;
        this.googleSignedIn = bind(this.googleSignedIn, this);
        this.poolId = '';
        this.googleIdToken = '';
        auth2.isSignedIn.listen(this.googleSignedIn);
      }

      Authentication.prototype.init = function(poolId) {
        var existingId;
        AWS.config.region = 'us-east-1';
        this.poolId = poolId;
        AWS.config.credentials = new AWS.CognitoIdentityCredentials({
          AccountId: '135172764304',
          IdentityPoolId: this.poolId
        });
        existingId = this.LocalStorage.get('identityId');
        if (existingId) {
          return AWS.config.credentials.identityId = existingId;
        }
      };

      Authentication.prototype.googleSignedIn = function(signedIn) {
        var googleAuth;
        if (signedIn) {
          googleAuth = auth2.currentUser.get().getAuthResponse();
          return this.Auth.$authWithOAuthToken("google", googleAuth.access_token)["catch"](function(error) {
            return console.log('login error', error);
          });
        }
      };

      Authentication.prototype.socialSignIn = function(authResult) {
        var defer, googleAuth, logins;
        defer = this.$q.defer();
        logins = {};
        if (authResult.provider === 'google' && !auth2.isSignedIn.get()) {
          this.Auth.$unauth();
          defer.reject();
          return defer.promise;
        }
        switch (authResult.provider) {
          case 'google':
            googleAuth = auth2.currentUser.get().getAuthResponse();
            logins['accounts.google.com'] = googleAuth.id_token;
            break;
          case 'facebook':
            logins['graph.facebook.com'] = authResult.facebook.accessToken;
            break;
          case 'twitter':
            logins['api.twitter.com'] = authResult.twitter.accessToken + ';' + authResult.twitter.accessTokenSecret;
        }
        AWS.config.credentials = new AWS.CognitoIdentityCredentials({
          AccountId: '135172764304',
          IdentityPoolId: this.poolId,
          Logins: logins
        });
        defer.resolve();
        return defer.promise;
      };

      return Authentication;

    })()
  ]);

}).call(this);
