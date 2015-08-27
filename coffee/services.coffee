angular.module('starter.services', ['firebase'])
.service 'LocalStorage', class LocalStorage
    constructor: ->
        @isEnabled = typeof(localStorage) != 'undefined'

    get: (name, defaultValue)->
        value = defaultValue
        if(@isEnabled)
            item = localStorage.getItem(name)
            if item?.length
                value = JSON.parse(item)
            else
                value = defaultValue
        value

    remove: (name)->
        if(@isEnabled)
            localStorage.removeItem(name)

    set: (name, value)->
        if(@isEnabled)
            localStorage.setItem(name, JSON.stringify(value))
        value
.service 'AWSService', ['$q', '$cacheFactory', 'LocalStorage', class AWSService
    constructor: (@$q, @$$cacheFactory, @LocalStorage)->
        @dynamoCache = @$$cacheFactory('dynamo')

    getCredentials: ->
        defer = @$q.defer()
        # Obtain AWS credentials
        # console.log 'getting AWS credentials'
        AWS.config.credentials.get (err)->
            if(err)
                defer.reject(err)
                console.log('error logging into Cognito', err)
            else
                console.log('AWS credentials', AWS.config.credentials);
                @LocalStorage.set('identityId', AWS.config.credentials.identityId)
                defer.resolve(AWS.config.credentials)
        defer.promise

    dynamo: (params)->
        d = @$q.defer()
        angular.extend(params,
            endpoint: new AWS.Endpoint('http://localhost:8000')
        )
        @getCredentials().then =>
            table = @dynamoCache.get(JSON.stringify(params))
            if (!table)
                table = new AWS.DynamoDB(params)
                @dynamoCache.put(JSON.stringify(params), table)
            d.resolve(table)
        d.promise
]
.service 'UserService', ['$rootScope', '$q', '$http', 'AWSService', class UserService
    constructor: (@$rootScope, @$q, @$http, @AWSService)->
        @user = null
        @UsersTable = 'Users'

    setCurrentUser: (u) ->
        if (u && !u.error)
            @user = u
            @currentUser()
        else
            d = @$q.defer()
            d.reject(u.error)
            return d.promise

    currentUser: ->
        d = @$q.defer()

        @AWSService.dynamo(
          params: {TableName: @UsersTable}
        ).then (table) =>
            # find the user by email
            table.getItem(
                Key: {'User email': {S: @user.email}}
            , (err, data) =>
                if (Object.keys(data).length == 0)
                    # User didn't previously exist
                    # so create an entry
                    itemParams = 
                        Item:
                            'User email': {S: @user.email}
                            data: { S: JSON.stringify(@user) }
                    table.putItem itemParams, 
                        (err, data) ->
                            d.resolve(e)
                else
                    # The user already exists
                    @user = JSON.parse(data.Item.data.S)
                    d.resolve(@user)
            )

        d.promise.then (u)=>
            @$rootScope.user = u

        # d.resolve(@user)
        return d.promise
]
.constant('FIREBASE_URL', "https://icloset.firebaseio.com")
.factory "Auth", ['$firebaseAuth', 'FIREBASE_URL', ($firebaseAuth, FIREBASE_URL) ->
    usersRef = new Firebase(FIREBASE_URL)
    $firebaseAuth(usersRef)
]
.service 'Authentication', ['LocalStorage', 'Auth', '$q', '$http', 'UserService', 
    '$rootScope', '$firebaseObject', 'FIREBASE_URL',
class Authentication
    constructor: (@LocalStorage, @Auth, @$q, @$http, @UserService, 
                @$rootScope, @$firebaseObject, @FIREBASE_URL)->
        @poolId = ''
        @googleIdToken = ''

        @firebaseRef = new Firebase(@FIREBASE_URL)
    
        @Auth.$onAuth (authData)=>
            @$rootScope.authData = authData

            if authData
                console.log 'Firebase credentials', authData

                @createUser(authData)

                @socialSignIn(authData).then =>
                    @$rootScope.$broadcast 'login'
            else
                @$rootScope.$broadcast 'logout'


    init: (poolId)->
        AWS.config.region = 'us-east-1'
        @poolId = poolId

        AWS.config.credentials = new AWS.CognitoIdentityCredentials(
            AccountId: '135172764304'
            IdentityPoolId: @poolId
        )

        existingId = @LocalStorage.get('identityId')
        if(existingId)
            AWS.config.credentials.identityId = existingId

    createUser: (authData)->
        user = @$firebaseObject(@firebaseRef.child("users/#{authData.uid}"))
        user.$loaded().then =>
            console.log 'user', user
            if not user.uid
                user.uid = authData.uid
                user.provider = authData.provider
                user.name = authData[authData.provider].displayName || authData[authData.provider].email
                user.email = authData[authData.provider].email || '@' + authData[authData.provider].username
                user.$save()

        user.$bindTo(@$rootScope, 'user').then (unbind)=>
            @unbindUser = unbind

        @userRef = user

    socialSignIn: (authResult)->
        defer = @$q.defer()

        @$http.post('https://u8x98h3ig6.execute-api.us-east-1.amazonaws.com/prod/FirebaseCognitoToken', 
            'token': authResult.token
        ).success (data, status, headers, config) ->
            console.log('data result', data)
            if(!data.failure)
                params =
                    RoleArn: 'arn:aws:iam::135172764304:role/Cognito_iClosetAuth_Role',
                    WebIdentityToken: data.Token
                AWS.config.credentials = new AWS.WebIdentityCredentials(params, (err) ->
                    console.log(err, err.stack);
                );
                defer.resolve();
            else
                defer.reject();
        .catch (err)->
            console.log('lambda error', err)
            defer.reject();

        defer.promise

    logout: ->
        if @userRef
            @unbindUser()
            @userRef.$destroy()
            @userRef = null
        @Auth.$unauth()

]
