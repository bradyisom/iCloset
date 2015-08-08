angular.module('starter.controllers', ['starter.services'])

.controller 'AppCtrl', ($scope, $ionicModal, $timeout, Authentication, AWSService, Auth) ->
  # Form data for the login modal
  $scope.loginData = {}

  $scope.googleLogin = (googleAuthData)->
      # console.log 'googleLogin', googleAuthData
      Auth.$authWithOAuthToken(
        "google", googleAuthData.access_token
      ).then (authData)->
          authData.google.id_token = googleAuthData.id_token
          # console.log 'after auth', authData
      .catch (error)->
          console.log 'login error', error

  $scope.socialLogin = (provider)->
      # console.log 'login', provider
      oauthScope = 'email'
      Auth.$authWithOAuthPopup(provider,
          scope: oauthScope
      # ).then (authData)->
      #     console.log 'after auth', authData
      ).catch (error)->
          console.log 'login error', error

  $scope.logout = ->
      # console.log 'logout'
      if auth2.isSignedIn.get()
          auth2.signOut()
      Auth.$unauth()

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
