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
.service('Authentication', function(LocalStorage, $q) {
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
		// console.log('googleSignIn', authResult);
        // Add the Google access token to the Cognito credentials login map.
        AWS.config.credentials = new AWS.CognitoIdentityCredentials({
			AccountId: '135172764304',
            IdentityPoolId: _poolId,
            Logins: {
               'accounts.google.com': authResult['id_token']
            }
        });
	};

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
	}
})
;
