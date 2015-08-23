(function() {
  var AWSService, Authentication, LocalStorage, UserService;

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
    'LocalStorage', 'Auth', '$q', '$http', 'UserService', Authentication = (function() {
      function Authentication(LocalStorage1, Auth, $q, $http, UserService1) {
        this.LocalStorage = LocalStorage1;
        this.Auth = Auth;
        this.$q = $q;
        this.$http = $http;
        this.UserService = UserService1;
        this.poolId = '';
        this.googleIdToken = '';
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

      Authentication.prototype.socialSignIn = function(authResult) {
        var defer;
        defer = this.$q.defer();
        this.$http.post('https://u8x98h3ig6.execute-api.us-east-1.amazonaws.com/prod/FirebaseCognitoToken', {
          'token': authResult.token
        }).success(function(data, status, headers, config) {
          var params;
          console.log('data result', data);
          if (!data.failure) {
            params = {
              RoleArn: 'arn:aws:iam::135172764304:role/Cognito_iClosetAuth_Role',
              WebIdentityToken: data.cognitoToken
            };
            AWS.config.credentials = new AWS.WebIdentityCredentials(params, function(err) {
              return console.log(err, err.stack);
            });
            return defer.resolve();
          } else {
            return defer.reject();
          }
        })["catch"](function(err) {
          console.log('lambda error', err);
          return defer.reject();
        });
        return defer.promise;
      };

      return Authentication;

    })()
  ]);

}).call(this);
