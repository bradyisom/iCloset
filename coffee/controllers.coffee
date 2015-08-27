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
