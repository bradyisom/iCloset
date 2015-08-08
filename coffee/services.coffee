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
.factory "Auth", ['$firebaseAuth', ($firebaseAuth) ->
    usersRef = new Firebase("https://icloset.firebaseio.com")
    $firebaseAuth(usersRef)
]
.service 'Authentication', ['LocalStorage', 'Auth', '$q', 'UserService', class Authentication
    constructor: (@LocalStorage, @Auth, @$q, @UserService)->
        @poolId = ''
        @googleIdToken = ''
        auth2.isSignedIn.listen(@googleSignedIn)

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

    googleSignedIn: (signedIn)=>
        # console.log 'Authentication.googleSignedIn', signedIn
        if signedIn
            googleAuth = auth2.currentUser.get().getAuthResponse()
            @Auth.$authWithOAuthToken(
                "google", googleAuth.access_token
            # ).then (authData)->
            #     console.log 'after auth', authData
            ).catch (error)->
                console.log 'login error', error

    socialSignIn: (authResult)->
        defer = @$q.defer()
        logins = {}

        if authResult.provider == 'google' and
                not auth2.isSignedIn.get()
            @Auth.$unauth()
            defer.reject() 
            return defer.promise

        switch authResult.provider
            when 'google'
                googleAuth = auth2.currentUser.get().getAuthResponse()
                logins['accounts.google.com'] = googleAuth.id_token
            when 'facebook'
                logins['graph.facebook.com'] = authResult.facebook.accessToken
            when 'twitter'
                logins['api.twitter.com'] = authResult.twitter.accessToken + ';' + authResult.twitter.accessTokenSecret


        AWS.config.credentials = new AWS.CognitoIdentityCredentials(
            AccountId: '135172764304'
            IdentityPoolId: @poolId
            Logins: logins
        )
        defer.resolve()
        defer.promise

]
