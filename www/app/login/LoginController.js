"use strict";

angular
    .module("starter")
    .controller("LoginController", function($scope, $stateParams, $ionicPopup, $timeout, DashboardFactory, $q, $window, $state) {
        $scope.performLogin = function() {
            // var aws = require('@ionic-native/ms-adal');
            // $scope.authenticate(false);
            console.log("clicked");

            // function authenticate(authCompletedCallback, errorCallback) {
            var authority = "https://login.windows.net/cernerprod.onmicrosoft.com/";
            var resourceUri = "https://graph.microsoft.com";
            var clientId = "6d87a008-e330-43c1-b280-6fdf0fb0c490";

            var authContext = new $window.Microsoft.ADAL.AuthenticationContext(authority);

            authContext.acquireTokenAsync(resourceUri, clientId, "http://localhost:8100/")
                .then(function(authResponse) {
                    console.log(authResponse)
                    if (authResponse.accessToken) {
                        var uniqueId = authResponse.userInfo.uniqueId;
                        var userId = uniqueId.split("@");
                        console.log("true");
                        $state.go('dashboard', { associateId: userId[0], accessToken: authResponse.accessToken });
                    }
                    console.log("Token acquired: " + authResponse.accessToken);
                    console.log("Token will expire on: " + authResponse.expiresOn);
                }, function(err) {
                    console.log("Failed to authenticate: " + err);
                });
        }
    });