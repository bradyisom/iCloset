angular.module('starter.services', [])
.service('LocalStorage', function() {
    var isEnabled = typeof(localStorage) != 'undefined';

    this.get = function(name, defaultValue) {
        var value = defaultValue;
        if(isEnabled) {
            var item = localStorage.getItem(name);
            if(item && item.length) {
                value = JSON.parse(item);
            }
            else {
                value = defaultValue;
            }
        }
        return value;
    };

    this.remove = function(name) {
    	if(isEnabled) {
    		localStorage.removeItem(name);
    	}
    };

    this.set = function(name, value) {
    	if(isEnabled) {
    		localStorage.setItem(name, JSON.stringify(value));
    	}
    	return value;
    };

})
.service('UserService', function($rootScope, $q, $http, AWSService) {
    var _user = null,
    	t = this,
    	UsersTable = 'Users';
    this.setCurrentUser = function(u) {
        if (u && !u.error) {
            _user = u;
            return t.currentUser();
        } else {
            var d = $q.defer();
            d.reject(u.error);
            return d.promise;
        }
    };
    this.currentUser = function() {
        var d = $q.defer();

		AWSService.dynamo({
              params: {TableName: UsersTable}
            })
            .then(function(table) {
                // find the user by email
                table.getItem({
                    Key: {'User email': {S: _user.email}}
                }, function(err, data) {
                    if (Object.keys(data).length == 0) {
                        // User didn't previously exist
                        // so create an entry
                        var itemParams = {
                            Item: {
                                'User email': {S: _user.email}, 
                                data: { S: JSON.stringify(_user) }
                            }
                        };
                        table.putItem(itemParams, 
                            function(err, data) {
                                d.resolve(e);
                        });
                    } else {
                        // The user already exists
                        _user = JSON.parse(data.Item.data.S);
                        d.resolve(_user);
                    }
                });
            });

		d.promise.then(function(u) {
			$rootScope.user = u;
		});

        // d.resolve(_user);
        return d.promise;
    };
})
.service('Authentication', function(LocalStorage, $q, UserService) {
	var _poolId = '';
	this.init = function(poolId) {
		AWS.config.region = 'us-east-1';
		_poolId = poolId;

        AWS.config.credentials = new AWS.CognitoIdentityCredentials({
			AccountId: '135172764304',
            IdentityPoolId: _poolId
        });

		var existingId = LocalStorage.get('identityId');
		if(existingId) {
			AWS.config.credentials.identityId = existingId;
		}
	};

	this.googleSignIn = function(authResult) {
		var defer = $q.defer();
		// console.log('googleSignIn', authResult);
        // Add the Google access token to the Cognito credentials login map.
		gapi.client.oauth2.userinfo.get().execute(function(e) {
            var email = e.email;
            console.log('Google Email', email);
	        AWS.config.credentials = new AWS.CognitoIdentityCredentials({
				AccountId: '135172764304',
	            IdentityPoolId: _poolId,
				WebIdentityToken: e.id_token,
	            Logins: {
	               'accounts.google.com': authResult['id_token']
	            }
	        });
            UserService.setCurrentUser(e);
            defer.resolve()
        });
        return defer.promise;
	};
})
.service('AWSService', function($q, $cacheFactory, LocalStorage) {
	var t = this,
		dynamoCache = $cacheFactory('dynamo');

	this.getCredentials = function() {
 		var defer = $q.defer();
        // Obtain AWS credentials
        AWS.config.credentials.get(function(err){
        	if(err) {
        		defer.reject(err);
	            console.log('error logging into Cognito', err);
        	}
        	else {
        		LocalStorage.set('identityId', AWS.config.credentials.identityId);
        		defer.resolve(AWS.config.credentials);
	            // console.log('logged into Cognito', AWS.config.credentials);
        	}
        });
        return defer.promise;
	};
	this.dynamo = function(params) {
	    var d = $q.defer();
	    angular.extend(params, {
			endpoint: new AWS.Endpoint('http://localhost:8000')
	    });
	    t.getCredentials().then(function() {
	    	var table = dynamoCache.get(JSON.stringify(params));
	    	if (!table) {
		        table = new AWS.DynamoDB(params);
		        dynamoCache.put(JSON.stringify(params), table);
	    	}
	        d.resolve(table);
	    });
	    return d.promise;
	};
})
;
