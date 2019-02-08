'use strict';

angular.module('starter').factory("DashboardFactory", function ($q, $http) {
    var factory = {
        teamList: [],
        checkedPin: null,
        loggedInUser: {},
        loggedInMaster: {}
    };



    //get all associates

    factory.getTeamList = function () {
        var d = $q.defer();
        $http({

            method: 'GET',
            url: 'http://10.182.234.181:1337/associates/',
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(function (success) {
            // factory.teamList = success.data.documents;
            d.resolve(success)
            // alert(success)

            //alert("User has created Successfully" + success)
        }, function (error) {
            d.reject(error)
            // alert("Error. while created user Try Again!" + success);
        });

        return d.promise;
    };

    //get all details of logged in user

    factory.getLoggedInUserDetails = function (obj) {
        var d = $q.defer();
        $http({

            method: 'GET',
            url: 'http://10.182.234.181:1337/associates/?associate_id=' + obj,
            data: obj,
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(function (success) {
            factory.loggedInUser = success.data;
            d.resolve(success)
            // alert(success)

            //alert("User has created Successfully" + success)
        }, function (error) {
            d.reject(error)
            // alert("Error. while created user Try Again!" + success);
        });

        return d.promise;
    };


    // get associates of logged in user's teams

    factory.getAssociateDetails = function (obj) {
        var d = $q.defer();
        $http({

            method: 'GET',

            url: 'http://10.182.234.181:1337/associates?team=' + obj,
            data: obj,
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(function (success) {
            factory.loggedInUserTeam = success.data;
            d.resolve(success)
            // alert(success)

            //alert("User has created Successfully" + success)
        }, function (error) {
            d.reject(error)
            // alert("Error. while created user Try Again!" + success);
        });

        return d.promise;
    };



    //get detials of logged in master details

    factory.getMasterDetails = function (obj) {
        var d = $q.defer();
        $http({

            method: 'GET',
            url: 'http://10.182.234.181:1337/masters?associateId=' + obj,
            data: obj,
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(function (success) {
            factory.loggedInMaster = success.data;
            d.resolve(success)
            // alert(success)

            //alert("User has created Successfully" + success)
        }, function (error) {
            d.reject(error)
            // alert("Error. while created user Try Again!" + success);
        });

        return d.promise;
    };


    //get all exiting teams

    factory.getTeamDetails = function () {
        var d = $q.defer();
        $http({

            method: 'GET',
            url: 'http://10.182.234.181:1337/teams/',
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(function (success) {
            // factory.teamList = success.data.documents;
            d.resolve(success)
            // alert(success)

            //alert("User has created Successfully" + success)
        }, function (error) {
            d.reject(error)
            // alert("Error. while created user Try Again!" + success);
        });

        return d.promise;
    };






    // pin updation

    factory.updatePin = function (pin,team) {
        var obj = 
        {
            "pin": pin
        }
        var d = $q.defer();
        console.log(obj+" "+team)
        $http({
            method: 'PUT',
            url: 'http://10.182.234.181:1337/teams/' + team.id,
            data: obj,
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(function (success) {
            d.resolve(success)
        }, function (error) {
            d.reject(error)
        });

        return d.promise;
    };





    
    // // get scrumpoints of logged in user's teams

    factory.getScrumPoints = function (obj) {
        var d = $q.defer();
        $http({

            method: 'GET',

            url: 'http://10.182.234.181:1337/scrumpoints?associate=' + obj,
            data: obj,
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(function (success) {
            factory.loggedInUserTeam = success.data;
            d.resolve(success)
            // alert(success)

            //alert("User has created Successfully" + success)
        }, function (error) {
            d.reject(error)
            // alert("Error. while created user Try Again!" + success);
        });

        return d.promise;
    };
    return factory;
});