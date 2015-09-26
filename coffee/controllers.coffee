angular.module('starter.controllers', ['starter.services'])

.controller 'LoginCtrl', class LoginCtrl
    @$inject = ['$scope', 'Auth', '$state', '$ionicHistory', '$ionicLoading', 'Authentication']
    constructor: (@$scope, @Auth, @$state, @$ionicHistory, @$ionicLoading, @Authentication) ->
        # Form data for the login modal
        @loginData = {}

    socialLogin: (provider)->
        # console.log 'login', provider
        @error = null
        oauthScope = 'email'
        @$ionicLoading.show()
        @Auth.$authWithOAuthPopup provider,
            scope: oauthScope
        .then (authData)=>
            @$ionicLoading.hide()
            @$ionicHistory.nextViewOptions(historyRoot: true)
            @$state.go 'app.profile'
        .catch (error)=>
            @$ionicLoading.hide()
            @error = error.toString()
            console.log 'login error', error

    emailLogin: ->
        # console.log 'login', provider
        @error = null
        oauthScope = 'email'
        @$ionicLoading.show()
        @Auth.$authWithPassword
            email: @loginData.email
            password: @loginData.password
        .then (authData)=>
            @$ionicLoading.hide()
            @$ionicHistory.nextViewOptions(historyRoot: true)
            @$state.go 'app.profile'
        .catch (error)=>
            @$ionicLoading.hide()
            @error = error.toString()
            console.log 'login error', error

    register: ->
        @error = null
        if @loginData.password != @loginData.passwordConfirm
            @error = 'Passwords must match'
            return

        @$ionicLoading.show()
        @Auth.$createUser
            email: @loginData.email
            password: @loginData.password
        .then =>
            @$ionicLoading.hide()
            @$ionicHistory.goBack()
        .catch (error)=>
            @$ionicLoading.hide()
            @error = error.toString()
            console.log 'register error', error


    logout: ->
        # console.log 'logout'
        @$ionicHistory.nextViewOptions(historyRoot: true)
        @$state.go 'app.login'
        @Authentication.logout()


.controller 'ArticlesCtrl', class
    @$inject = ['$scope', '$firebaseArray', '$firebaseObject', 'FIREBASE_URL', '$ionicModal', 'ArticleService']
    constructor:(@$scope, $firebaseArray, @$firebaseObject, @FIREBASE_URL, @$ionicModal, @Article)->
        @$scope.$watch('user', (user)=>
            if user
                # @articles = $firebaseArray(new Firebase(@FIREBASE_URL).child("articles").orderByChild('uid').equalTo(@$scope.user.uid))
                @articles = $firebaseArray(new Firebase(@FIREBASE_URL).child("articles/#{@$scope.user.uid}"))
        )

    addArticle: ->
        @articles.$add({}).then (ref)=>
            @article = @$firebaseObject(ref)
            @$ionicModal.fromTemplateUrl 'templates/editArticle.html', 
                scope: @$scope,
                animation: 'slide-in-up'
            .then (modal) =>
                @modal = modal
                @modal.show()

    uploadImage: (input)=>
        return if not input.files.length
        file = input.files[0]
        @Article.uploadImage(@article, file).then (data)=>
            @article.imageUrl = data.Location

    closeModal: ->
        if @modal
            @article.$save()
            @modal.hide()
            @article = null

    deleteArticle: (article)->
        @articles.$remove article

.controller 'ArticleCtrl', class
    @$inject = ['$scope', '$firebaseObject', '$stateParams', 'FIREBASE_URL', '$ionicModal', '$cordovaCapture', 'AWSService', 'ArticleService']
    constructor: (@$scope, $firebaseObject, @$stateParams, @FIREBASE_URL, @$ionicModal, @$cordovaCapture, @AWSService, @Article)->
        @$scope.$watch('user', (user)=>
            if user
                @article = $firebaseObject(new Firebase(@FIREBASE_URL).child("articles/#{@$scope.user.uid}/#{@$stateParams.articleId}"))
                @article.$bindTo @$scope, 'article'
        )
        # @AWSService.s3().then (s3)=>
        #     @S3 = s3

    getImage: ->
        options = 
            limit: 3
        @$cordovaCapture.captureImage(options).then (imageData) =>
            console.log 'Success! Image data is here', imageData
        , (err) =>
            console.log 'Error with image', err

    uploadImage: (input)=>
        return if not input.files.length
        file = input.files[0]
        @Article.uploadImage(@article, file).then (data)=>
            @$scope.article.imageUrl = data.Location

    editArticle: ->
        @$ionicModal.fromTemplateUrl 'templates/editArticle.html', 
            scope: @$scope,
            animation: 'slide-in-up'
        .then (modal) =>
            @modal = modal
            @modal.show()


    closeModal: ->
        if @modal
            @article.$save()
            @modal.hide()


.controller 'PlaylistsCtrl', ($scope)->
    $scope.playlists = [
        { title: 'Reggae', id: 1 }
        { title: 'Chill', id: 2 }
        { title: 'Dubstep', id: 3 }
        { title: 'Indie', id: 4 }
        { title: 'Rap', id: 5 }
        { title: 'Rock', id: 6 }
        { title: 'Cowbell', id: 7 }
    ]

.controller 'PlaylistCtrl', ($scope, $stateParams)->
