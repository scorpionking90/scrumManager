"use strict";

angular
  .module("starter")
  .controller("DashboardController", function (
    $scope,
    $stateParams,
    $ionicPopup,
    $timeout,
    DashboardFactory
  ) {

    // $scope.associateList = {
    //   associateId:null,
    //   associateName:null,
    //   scrumPoints:null
    // };


    //$scope.teamAssociateDetails = [];

    $scope.teamAssociateDetails = {
      teamName: null,
      associates: []
    }


   // console.log(moment().format('MMMM'));
    

    //get all associates

    $scope.isMaster = false;

    $scope.getList = function () {
      DashboardFactory.getTeamList().then(
        function (success) {
          $scope.associates = success.data;
          console.log("ALL MEMEBER DETAILS", success.data);
        },
        function (error) {
          console.log(error);
        }
      );
    };

    var loggedUserData = $stateParams.associateId;
    console.log("logged user assc ID: ", loggedUserData);

    //get logged in user details
    $scope.getLoggedInUser = function () {
      DashboardFactory.getLoggedInUserDetails(loggedUserData).then(
        function (success) {
          $scope.loggedUser = success.data[0].team.id;
          console.log("LOGGED IN USER COMPLETE DETAILS", success.data[0]);
          console.log("LOGGED IN USER TEAM ID", success.data[0].team.id);


          //get all assocaites based on logged in user team

          var teamId = success.data[0].team.id;

          var associates = [];

          DashboardFactory.getAssociateDetails(teamId).then(
            function (success) {
              

              success.data.forEach(function (element) {
                var eachAssociate = {
                  points: null,
                  name: null
                }
                eachAssociate.name = element.name;
                var memberID = element.id;
                console.log("TEAM MEMBER ", element);
                DashboardFactory.getScrumPoints(memberID).then(
                  function (success) {
                    $scope.member = success.data;
                    var memberPoints = 0;
                    for (var eachPoint = 0; eachPoint < success.data.length; eachPoint++) 
                    {
                      var today = success.data[eachPoint].created_at;
                      if(moment().format('MM') === moment(today).format('MM'))
                      memberPoints += parseInt(success.data[eachPoint].point);
                    }
                    eachAssociate.points = memberPoints;
                    console.log(eachAssociate);
                    associates.push(eachAssociate);
                    console.log("TEAM POINT DETAILS", $scope.teamAssociateDetails);
                  },
                  function (error) {
                    console.log(error);
                  });
              })
            },
            function (error) {
              console.log(error);
            });
            $scope.teamAssociateDetails.associates = associates;
        },
        function (error) {
          console.log(error);
        }
      );
    };



    //get logged in user details if master [PIN BUTTON ENABLE]
    $scope.getMaster = function () {
      DashboardFactory.getMasterDetails(loggedUserData).then(
        function (success) {
          $scope.loggedMaster = success.data[0];
          console.log("LOGGED MASTER DETAILS", $scope.loggedMaster);
          if ($scope.loggedMaster === undefined) {
            $scope.getLoggedInUser();
          }
          else {
            $scope.isMaster = true;
            $scope.getTeam();
          }
          console.log($scope.isMaster)
        },
        function (error) {
          console.log(error);
        }
      );
    };

    //get all existing teams

    $scope.getTeam = function () {
      DashboardFactory.getTeamDetails().then(
        function (success) {
          $scope.teamAssociateDetails = success.data;
          console.log("AVAILABLE TEAM's", success.data);
        },
        function (error) {
          console.log(error);
        }
      );
    };




    // enter pin pop up
    $scope.selectTeam = function () {
      $scope.data = {}
      $scope.getTeam();
      // Custom popup
      var myPopup = $ionicPopup.show({

        template: '<div class="list"><div class="item"  ng-repeat="team in teamAssociateDetails" ng-click=generateNumber(team)>{{team.name}} </div></div>',
        title: 'Select Team',
        scope: $scope,

        buttons:
          [
            { text: 'Cancel', type: "button-positive" }
          ]
      });


      //pin generation 
      $scope.generateNumber = function (team) {

        if (document.getElementsByClassName("button-assertive").length == 1) {
          $scope.updatePin('-1', team);
          var element = document.getElementById("generateNumber");
          angular.element(element).addClass('button-balanced');
          angular.element(element).removeClass('button-assertive');

          var ele = angular.element(document.querySelector('#generateNumber'));
          ele.html("+");
          $scope.randomNumber = null;
        }
        else {
          $scope.randomNumber = Math.floor(Math.random() * (99999 - 10000 + 1) + 10000);
          $scope.showRandomPopup();
          $scope.updatePin($scope.randomNumber, team);
        }
      }

      //update pin

      $scope.updatePin = function (randomNumber, team) {
        console.log("called");
        DashboardFactory.updatePin(randomNumber, team).then(
          function (success) {
          },
          function (error) {
            ionicToast.show(error, "bottom", false, 3500);
          }
        );
      }




      //pin random pop up

      $scope.showRandomPopup = function () {
        // An elaborate, custom popup

        var myPopup1 = $ionicPopup.show({
          template: '<p class="pin">{{randomNumber}}</p>',
          title: "Scrum PIN",
          //   subTitle: 'Please use normal things',
          scope: $scope,
          buttons: [
            {
              template: '',
              text: "<b>OK </b>",
              type: "button-positive",
              onTap: function (e) {
                var element = document.getElementById("generateNumber");
                angular.element(element).addClass('button-assertive');
                angular.element(element).removeClass('button-balanced');

                var ele = angular.element(document.querySelector('#generateNumber'));
                ele.html("-");
                myPopup.close();
              }
            }
          ]
        });

      };

    };

    $scope.enterPinPopup = function () {
      $scope.data = {};

      // An elaborate, custom popup
      var myPopup = $ionicPopup.show({
        template: '<input type="password" ng-model="data.wifi">',
        title: 'Enter Wi-Fi Password',
        subTitle: 'Please use normal things',
        scope: $scope,
        buttons: [
          { text: 'Cancel' },
          {
            text: '<b>Save</b>',
            type: 'button-positive',
            onTap: function (e) {
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

      myPopup.then(function (res) {
        console.log('Tapped!', res);
      });

      $timeout(function () {
        myPopup.close(); //close the popup after 3 seconds for some reason
      }, 3000);
    };


    $scope.getMaster();
    var ctx = document.getElementById("myChart");
var myChart = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: ["Red", "Blue", "Yellow", "Green", "Purple", "Orange"],
        datasets: [{
            label: '# of Votes',
            data: [12, 19, 3, 5, 2, 3],
            backgroundColor: [
                'rgba(255, 99, 132, 0.2)',
                'rgba(54, 162, 235, 0.2)',
                'rgba(255, 206, 86, 0.2)',
                'rgba(75, 192, 192, 0.2)',
                'rgba(153, 102, 255, 0.2)',
                'rgba(255, 159, 64, 0.2)'
            ],
            borderColor: [
                'rgba(255,99,132,1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(255, 159, 64, 1)'
            ],
            borderWidth: 1
        }]
    },
    options: {
        scales: {
            yAxes: [{
                ticks: {
                    beginAtZero:true
                }
            }]
        }
    }
});

  });
