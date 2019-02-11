"use strict";

angular
  .module("starter")
  .controller("DashboardController", function(
    $scope,
    $stateParams,
    $ionicPopup,
    $timeout,
    DashboardFactory
  ) {

    $scope.teamAssociateDetails = {
      teamName: null,
      associates: []
    };
    $scope.isMaster = false;

    var loggedUserId = $stateParams.associateId;

    //get logged in user details
    $scope.getLoggedInUserDetails = function() {
      DashboardFactory.getLoggedInUserDetails(loggedUserId).then(
        function(success) {
          //get all assocaites based on logged in user team

          var teamId = success.data[0].team.id;
          $scope.associates = [];


          DashboardFactory.getAssociateDetails(teamId).then(
            function(success) {
              success.data.forEach(function(element) {
                var eachAssociate = {
                  points: null,
                  name: null,

                };
                eachAssociate.name = element.name;
                var memberID = element.id;
                DashboardFactory.getScrumPoints(memberID).then(
                  function(success) {
                    $scope.member = success.data;
                    var memberPoints = 0;
                    for (
                      var eachPoint = 0;
                      eachPoint < success.data.length;
                      eachPoint++
                    ) {
                      var today = success.data[eachPoint].created_at;
                      if (moment().format("MM") === moment(today).format("MM"))
                        memberPoints += parseInt(success.data[eachPoint].point);
                    }
                    eachAssociate.points = memberPoints; 
                    $scope.associates.push(eachAssociate);
                  },
                  function(error) {
                    console.log(error);
                  }
                );
              });
            },
            function(error) {
              console.log(error);
            }
          );
          $scope.teamAssociateDetails.associates = $scope.associates;
        },
        function(error) {
          console.log(error);
        }
      );
    };

    //get logged in user details if master [PIN BUTTON ENABLE]
    $scope.checkUserType = function() {
      DashboardFactory.checkUserType(loggedUserId).then(
        function(success) {
          $scope.loggedMaster = success.data[0];
          if ($scope.loggedMaster === undefined) {
            $scope.isMaster = false;
            $scope.getLoggedInUserDetails();
          } else {
            $scope.isMaster = true;
            $scope.getTeam();
          }
          console.log($scope.isMaster);
        },
        function(error) {
          console.log(error);
        }
      );
    };

    //get all existing teams
    $scope.getTeam = function() {
      DashboardFactory.getTeamDetails().then(
        function(success) {
          $scope.teamAssociateDetails.associates = success.data;
        },
        function(error) {
          console.log(error);
        }
      );
    };

    // enter pin pop up
    $scope.selectTeam = function() {
      $scope.data = {};
      $scope.getTeam();
      // Custom popup
      var myPopup = $ionicPopup.show({
        template:
          '<div class="list"><div class="item"  ng-repeat="team in teamAssociateDetails.associates" ng-click=generateNumber(team)>{{team.name}} </div></div>',
        title: "Select Team",
        scope: $scope,

        buttons: [{ text: "Cancel", type: "button-positive" }]
      });

      //pin generation
      $scope.generateNumber = function(team) {
        if (document.getElementsByClassName("button-assertive").length == 1) {
          $scope.updatePin("-1", team);
          var element = document.getElementById("generateNumber");
          angular.element(element).addClass("button-balanced");
          angular.element(element).removeClass("button-assertive");

          var ele = angular.element(document.querySelector("#generateNumber"));
          ele.html("+");
          $scope.randomNumber = null;
        } else {
          $scope.randomNumber = Math.floor(
            Math.random() * (99999 - 10000 + 1) + 10000
          );
          $scope.showPinPopup();
          $scope.updatePin($scope.randomNumber, team);
        }
      };

      //update pin
      $scope.updatePin = function(randomNumber, team) {
        DashboardFactory.updatePin(randomNumber, team).then(
          function(success) {},
          function(error) {
            ionicToast.show(error, "bottom", false, 3500);
          }
        );
      };

      //pin random pop up

      $scope.showPinPopup = function() {
        // An elaborate, custom popup

          $ionicPopup.show({
          template: '<p class="pin">{{randomNumber}}</p>',
          title: "Scrum PIN",
          //   subTitle: 'Please use normal things',
          scope: $scope,
          buttons: [
            {
              template: "",
              text: "<b>OK </b>",
              type: "button-positive",
              onTap: function(e) {
                var element = document.getElementById("generateNumber");
                angular.element(element).addClass("button-assertive");
                angular.element(element).removeClass("button-balanced");

                var ele = angular.element(
                  document.querySelector("#generateNumber")
                );
                ele.html("-");
                myPopup.close();
              }
            }
          ]
        });
      };
    };

    $scope.enterPinPopup = function() {
      $scope.data = {};

      // An elaborate, custom popup
      var myPopup = $ionicPopup.show({
        template: '<input type="password" ng-model="data.wifi">',
        title: "Enter Wi-Fi Password",
        subTitle: "Please use normal things",
        scope: $scope,
        buttons: [
          { text: "Cancel" },
          {
            text: "<b>Save</b>",
            type: "button-positive",
            onTap: function(e) {
              if (!$scope.data.wifi) {
                //don't allow the user to close unless he enters wifi password
                e.preventDefault();
              } else {
                return $scope.data.wifi;
              }
            }
          }
        ]
      });

      myPopup.then(function(res) {
        console.log("Tapped!", res);
      });

      $timeout(function() {
        myPopup.close(); //close the popup after 3 seconds for some reason
      }, 3000);
    };

    $scope.checkUserType();
  });
