angular.module('starter.controllers', ['starter.services'])

.controller 'AppCtrl', ($scope, $ionicModal, $timeout, Authentication, AWSService) ->
  # Form data for the login modal
  $scope.loginData = {}


  # Triggered in the login modal to close it
  $scope.closeLogin = ->
    $scope.modal.hide()

  # Open the login modal
  $scope.login = ->
    if not $scope.modal
      # Create the login modal that we will use later
      $ionicModal.fromTemplateUrl('templates/login.html',
        scope: $scope
      ).then (modal)->
        $scope.modal = modal
        $scope.modal.show()
    else
      $scope.modal.show()

  $scope.signedInGoogle = (authResult) ->
    # console.log('Google+ signin', authResult);
    if (authResult['status']['signed_in'])
      Authentication.googleSignIn(authResult).then(->
        AWSService.getCredentials()
      ).then (credentials)->
        console.log('got credentials', credentials)

  # Perform the login action when the user submits the login form
  $scope.doLogin = ->
    console.log('Doing login', $scope.loginData)

    # Simulate a login delay. Remove this and replace with your login
    # code if using a login system
    $timeout ->
      $scope.closeLogin()
    , 1000

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
