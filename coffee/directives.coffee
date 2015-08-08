angular.module('starter.directives', [])

.directive 'googleSignin', ->
    restrict: 'A'
    scope: 
        afterSignin: '&'
    link: (scope, el, ettrs)->
        auth2.attachClickHandler el[0], {},
            (googleUser) ->
              scope.afterSignin(authData:googleUser.getAuthResponse())
            , (error) ->
              console.log 'error in Google login', JSON.stringify(error, undefined, 2)
