"use strict";

angular
    .module("starter")
    .controller("DashboardController", function($scope, $stateParams, $ionicPopup, $timeout, DashboardFactory, $ionicPopover) {

        $scope.teamAssociateDetails = {
            teamName: null,
            associates: []
        };
        $scope.isMaster = false;

        var loggedUserId = $stateParams.associateId;

        $scope.allAssociate = {
            allRewards: [],
        }

        $scope.searchData = {}

        //get logged in user details
        $scope.getLoggedInUserDetails = function() {
            DashboardFactory.getLoggedInUserDetails(loggedUserId).then(
                function(success) {
                    //get all assocaites based on logged in user team
                    console.log(success.data);
                    $scope.loggedUserDetails = success.data[0];
                    $scope.associates = [];

                    //Generate Dashboard graphs
                    $scope.getLoggedInUserPointsForGraph();
                    //Get History
                    $scope.getHistory();

                    DashboardFactory.getAssociateDetails($scope.loggedUserDetails.team.id).then(
                        function(success) {
                            success.data.forEach(function(element) {
                                var eachAssociate = {
                                    points: null,
                                    name: null,
                                    id: null,
                                    rewards: [],

                                };
                                eachAssociate.name = element.name;
                                $scope.memberID = element.id;
                                eachAssociate.id = element.id;
                                DashboardFactory.getScrumPoints($scope.memberID).then(
                                    function(success) {
                                        var memberPoints = 0;
                                        for (var eachPoint = 0; eachPoint < success.data.length; eachPoint++) {
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

                                DashboardFactory.getAgileRewards($scope.memberID).then(
                                    function(success) {
                                        // $scope.member = success.data;
                                        $scope.memberRewards = [];
                                        for (
                                            var eachReward = 0; eachReward < success.data.length; eachReward++
                                        ) {
                                            //var today = success.data[$scope.eachReward].created_at;
                                            //if (moment().format("MM") === moment(today).format("MM"))
                                            var reward = success.data[eachReward].agileprinciple.principleId;

                                            //since an rewards is an array in eachAssociate (pushing data directly)
                                            eachAssociate.rewards.push(reward);

                                            if (reward != null) {
                                                $scope.allAssociate.allRewards.push(reward);
                                            }
                                        }
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
                    console.log($scope.teamAssociateDetails.associates);
                },
                function(error) {
                    console.log(error);
                }
            );
        };

        var myPopup = null;
        // enter pin pop up
        $scope.selectTeam = function() {
            $scope.data = {};
            $scope.getTeam();

            // Custom popup
            myPopup = $ionicPopup.show({
                //<button class="button button-balanced" id="generateNumber" ng-click="verifyPinGeneration(team)"> + </button>
                template: '<div class="list"><div class="item" ng-click="verifyPinGeneration(team)" ng-repeat="team in teamAssociateDetails.associates" ">{{team.name}} <span class="item-note">{{team.pin}}</span> </div></div>',
                title: "Generate Pin",
                scope: $scope,

                buttons: [{ text: "Cancel", type: "button-positive" }]
            });
        }

        var selectTeamForAddUsersPopup = null;
        $scope.selectTeamForAddUsers = function() {
            $scope.data = {};
            $scope.getTeam();

            // Custom popup
            selectTeamForAddUsersPopup = $ionicPopup.show({
                //<button class="button button-balanced" id="generateNumber" ng-click="verifyPinGeneration(team)"> + </button>
                template: '<div class="list"><div class="item" ng-click="addUsersToTeam(team)" ng-repeat="team in teamAssociateDetails.associates" ">{{team.name}}</div></div>',
                title: "Select Team",
                scope: $scope,

                buttons: [{ text: "Cancel", type: "button-positive" }]
            });
        }


        $scope.addUsersToTeam = function(team) {
            DashboardFactory.getLoggedUserPeopleDetails($stateParams.accessToken).then(
                function(success) {
                    $scope.selectedTeamtoAdd = team;
                    $scope.searchPeopleDetails = success.data.value;
                    console.log($scope.searchPeopleDetails);
                    var addUsersPopup = null;
                    addUsersPopup = $ionicPopup.show({
                        //<button class="button button-balanced" id="generateNumber" ng-click="verifyPinGeneration(team)"> + </button>
                        template: '<label class="item-input-wrapper textbox-search"><i class="icon ion-ios7-search placeholder-icon"></i><input type="search" placeholder="Search" ng-model="searchData.value" ng-keyup="searchPeople()" style = "background-color: #eeeeee;"></label><div class="list"><div class="item" ng-click="addAssociateToTeam(eachPeople)" ng-repeat="eachPeople in searchPeopleDetails" ">{{eachPeople.displayName}}</div></div>',
                        title: "Search Member",
                        scope: $scope,
                        buttons: [{ text: "Cancel", type: "button-positive" }]
                    });
                },
                function(error) {
                    ionicToast.show(error, "bottom", false, 3500);
                }
            );
        }

        $scope.searchPeople = function() {
            if ($scope.searchData.value != null) {
                if ($scope.searchData.value.length > 2) {
                    console.log($scope.searchText);
                    DashboardFactory.getSearchPeopleDetails($stateParams.accessToken, $scope.searchData.value).then(
                        function(success) {
                            $scope.searchPeopleDetails = success.data.value;
                        },
                        function(error) {
                            ionicToast.show(error, "bottom", false, 3500);
                        }
                    );
                }
            }
        }

        $scope.addAssociateToTeam = function(user) {
            $scope.selectedTeamtoAdd;
            console.log(user);
            console.log($scope.selectedTeamtoAdd);
            DashboardFactory.addAssociateToTeam(user.displayName, user.userPrincipalName.split("@")[0], $scope.selectedTeamtoAdd.id).then(
                function(success) {

                },
                function(error) {
                    ionicToast.show(error, "bottom", false, 3500);
                }
            );
        }

        //pin generation
        $scope.verifyPinGeneration = function(team) {
            $ionicPopup.show({
                title: "ARE YOU SURE",
                scope: $scope,
                buttons: [
                    { text: "NO" },
                    {
                        text: "<b>YES</b>",
                        type: "button-positive",
                        onTap: function(e) {
                            $scope.generateNumber(team)
                        }
                    }
                ]
            });
        };

        $scope.generateNumber = function(team) {
            if (team.pin != -1) {
                $scope.updatePin("-1", team);
                $scope.getTeam();
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
                function(success) {
                    console.log(success.data)
                },
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
                scope: $scope,
                buttons: [{
                    template: "",
                    text: "<b>OK </b>",
                    type: "button-positive",
                    onTap: function() {
                        myPopup.close();
                    }
                }]
            });
        };

        $scope.enterPinPopup = function() {
            $scope.enteredPin = {};

            // An elaborate, custom popup
            var myPopup = $ionicPopup.show({
                template: '<input type="text" ng-model="enteredPin.pin">',
                title: "Enter PIN",
                scope: $scope,
                buttons: [
                    { text: "Cancel" },
                    {
                        text: "<b>Save</b>",
                        type: "button-positive",
                        onTap: function(e) {
                            if (($scope.loggedUserDetails.team.pin) === ($scope.enteredPin.pin)) {
                                var currentTime = moment().local();
                                var minutesDiff = currentTime.diff(moment.utc($scope.loggedUserDetails.team.updated_at), 'minutes')
                                var scrumPoints = 0;
                                var id = $scope.loggedUserDetails.id;
                                if (minutesDiff <= 1) {
                                    scrumPoints = 2;
                                } else if (minutesDiff <= 2) {
                                    scrumPoints = 1;
                                } else {
                                    scrumPoints = -2;
                                }
                                DashboardFactory.updatePoints(scrumPoints, id).then(
                                    function(success) {
                                        console.log(success)
                                    },
                                    function(error) {
                                        ionicToast.show(error, "bottom", false, 3500);
                                    }
                                );
                            } else {
                                console.log("YOUR'E WRONG");
                            }
                        }
                    }
                ]
            });

            myPopup.then(function(res) {
                console.log("Tapped!", res);
            });
        };





        // Tab 1 : Dashboard

        $scope.masterSelectTeamGraph = function(selectedTeam) {
            $scope.associates.forEach(element => {
                $scope.teamGraphAssociateName.push(element.name);
                $scope.teamGraphAssociatePoints.push(element.points);
                $scope.backgroundColors.push($scope.getRandomColor());
            });

            console.log(selectedTeam);
        }

        $scope.loadDashBoard = function() {
            setTimeout(function() {
                $scope.teamGraphAssociateName = [];
                $scope.teamGraphAssociatePoints = [];
                $scope.backgroundColors = [];
                $scope.selectedTeamIndex = 0;
                if ($scope.isMaster) {
                    console.log($scope.teamAssociateDetails.associates[0].id)
                    $scope.masterSelectedTeam = $scope.teamAssociateDetails.associates[1].id;
                    $scope.masterSelectTeamGraph(1);
                } else {
                    console.log($scope.associates);
                    $scope.associates.forEach(element => {
                        $scope.teamGraphAssociateName.push(element.name);
                        $scope.teamGraphAssociatePoints.push(element.points);
                        $scope.backgroundColors.push($scope.getRandomColor());
                    });
                }
                console.log($scope.teamAssociateDetails.associates);
                var ctx = document.getElementById("teamChart");
                var ctx1 = document.getElementById("myChart1");
                var ctx2 = document.getElementById("myChart2");


                var rewardData = {
                    labels: ["Kiran", "Shreyas", "Rajesh", "Basavaraju"],
                    datasets: [{
                            label: "Satisfy the Client",
                            backgroundColor: $scope.getRandomColor(),
                            data: [1, 0, 0, 0],
                            stack: 1
                        },
                        {
                            label: "Welcome Changing Requirements",
                            backgroundColor: $scope.getRandomColor(),
                            data: [],
                            stack: 1
                        },
                        {
                            label: "Delivery Software Frequently",
                            backgroundColor: $scope.getRandomColor(),
                            data: [],
                            stack: 1
                        },
                        {
                            label: "Daily Interaction",
                            backgroundColor: $scope.getRandomColor(),
                            data: [],
                            stack: 1
                        },
                        {
                            label: "Motivate and Trust",
                            backgroundColor: $scope.getRandomColor(),
                            data: [0, 1, 1, 0],
                            stack: 1
                        },
                        {
                            label: "Face to Face",
                            backgroundColor: $scope.getRandomColor(),
                            data: [],
                            stack: 1
                        },
                        {
                            label: "Working Software",
                            backgroundColor: $scope.getRandomColor(),
                            data: [0, 0, 0, 1],
                            stack: 1
                        },
                        {
                            label: "Sustainable Pace",
                            backgroundColor: $scope.getRandomColor(),
                            data: [],
                            stack: 1
                        },
                        {
                            label: "Technical Excellence",
                            backgroundColor: $scope.getRandomColor(),
                            data: [1, 0, 0, 1],
                            stack: 1
                        },
                        {
                            label: "Simplicity",
                            backgroundColor: $scope.getRandomColor(),
                            data: [0, 0, 0, 1],
                            stack: 1
                        },
                        {
                            label: "Self Organizing Emergent Solutions",
                            backgroundColor: $scope.getRandomColor(),
                            data: [],
                            stack: 1
                        },
                        {
                            label: "Retrospectives",
                            backgroundColor: $scope.getRandomColor(),
                            data: [],
                            stack: 1
                        },
                    ]
                };


                new Chart(ctx, {
                    type: "pie",
                    data: {
                        labels: $scope.teamGraphAssociateName,
                        datasets: [{
                            data: $scope.teamGraphAssociatePoints,
                            backgroundColor: $scope.backgroundColors,
                            borderWidth: 1.5
                        }]
                    }
                });

                new Chart(ctx1, {
                    type: 'bar',
                    data: {
                        datasets: [{
                            data: $scope.userGraphData.data,
                            backgroundColor: $scope.userGraphData.colors,
                            // labels: ['October', 'November', 'December']
                        }],

                        // These labels appear in the legend and in the tooltips when hovering different arcs
                        labels: $scope.userGraphData.labels

                    },
                    // options: options
                    options: {
                        scales: {
                            yAxes: [{
                                ticks: {
                                    beginAtZero: true
                                }
                            }]
                        },
                        legend: {
                            display: false
                        }
                    }
                });

                new Chart(ctx2, {
                    type: 'bar',
                    data: rewardData
                });

            }, 1500);
        }

        $scope.getScrumPointsForMonth = function(month) {
            DashboardFactory.getScrumPointsByMonth($scope.loggedUserDetails.id, month).then(
                function(success) {
                    var memberPoints = 0;
                    for (var i = 0; i < success.data.length; i++) {
                        memberPoints += parseInt(success.data[i].point);
                    }
                    $scope.userGraphData.labels.push(moment(month).format('MMMM'));
                    $scope.userGraphData.data.push(memberPoints);
                    $scope.userGraphData.colors.push($scope.getRandomColor());
                },
                function(error) {
                    console.log(error);
                }
            );
        }

        $scope.getLoggedInUserPointsForGraph = function() {
            $scope.userGraphData = {
                labels: [],
                data: [],
                colors: []
            }
            $scope.historyFilter = [];
            var thisMonth = moment().format('YYYY-MM');
            // $scope.choice = this.Month;
            $scope.getScrumPointsForMonth(thisMonth);
            $scope.historyFilter.push(thisMonth);
            var previousMonth = moment().subtract(1, 'months').format('YYYY-MM');
            $scope.getScrumPointsForMonth(previousMonth);
            $scope.historyFilter.push(previousMonth);
            var previous2Month = moment().subtract(2, 'months').format('YYYY-MM');
            $scope.getScrumPointsForMonth(previous2Month);
            $scope.historyFilter.push(previous2Month);

        };

        $scope.getRandomColor = function() {
            var letters = "0123456789ABCDEF";
            var color = "#";
            for (var i = 0; i < 6; i++) {
                color += letters[Math.floor(Math.random() * 16)];
            }
            return color;
        };




        // Tab 3: Agile Rewards

        $scope.getAgilePriciples = function() {
            DashboardFactory.getAgilePriciples()
                .then(
                    function(success) {
                        $scope.agilerewards = success.data;
                    },
                    function(error) {
                        console.log(error);
                    }
                );
        };

        $scope.value = {
            disabled: true
        }
        $scope.checkAvailability = function(reward) {
            var val = false
            $scope.allAssociate.allRewards.forEach(function(element) {
                if (element === reward.principleId) {
                    val = true;
                }
            });
            if (!val)
                return false;
            else
                return true;
        };

        //select rewards from ionic pop up
        $scope.selectRewards = function(toUser) {
            $scope.toAssociate = toUser
            $scope.data = {};
            $scope.getAgilePriciples();
            // console.log($scope.id);
            // An elaborate, custom popup
            $ionicPopup.show({
                template: '<div class="list"> <div class="item" ng-repeat="rewards in agilerewards"> <div ng-click="assignRewards(rewards.id,loggedUserDetails.id,toAssociate.id)" ng-class="{disabled: checkAvailability(rewards)}">{{rewards.principleId}}<span class="item-note">{{rewards.agile_rewards}}</span></div></div></div>',
                title: "Select Agile Rewards",
                scope: $scope,

                buttons: [{ text: "Cancel", type: "button-positive" }]
            });
        };
        $scope.assignRewards = function(agileprinciple, fromAssociate, toAssociate) {
            // console.log(agileprinciple+" "+fromAssociate+" "+toAssociate)
            DashboardFactory.assignRewards(agileprinciple, fromAssociate, toAssociate).then(
                function(success) {
                    console.log(success)
                },
                function(error) {
                    ionicToast.show(error, "bottom", false, 3500);
                }
            );
        };







        // Tab 4: History
        $scope.showHistoryFilterIcon = false;
        $scope.getHistory = function() {
            DashboardFactory.getScrumPointsByMonth($scope.loggedUserDetails.id, moment().format('YYYY-MM')).then(
                function(success) {
                    $scope.loggedInUserHistory = success.data;
                },
                function(error) {
                    console.log(error);
                }
            );
        }


        $scope.showHistoryFilter = function() {
            $scope.showHistoryFilterIcon = true;
        }

        $scope.hideHistoryFilter = function() {
            $scope.showHistoryFilterIcon = false;
        }

        $ionicPopover.fromTemplateUrl('templates/popover.html', {
            scope: $scope,
        }).then(function(popover) {
            $scope.popover = popover;
        });

        $scope.closePopover = function() {
            $scope.popover.hide();
        };

        $scope.filterHistory = function(item) {
            DashboardFactory.getLoggedInUserDetails(loggedUserId).then(
                function(success) {
                    DashboardFactory.getScrumPointsByMonth(success.data[0].id, item).then(
                        function(success) {
                            $scope.loggedInUserHistory = success.data;
                            $scope.closePopover();
                        },
                        function(error) {
                            console.log(error);
                        }
                    );
                },
                function(error) {
                    console.log(error);
                }
            )
        }


        $scope.checkUserType();
        $scope.loadDashBoard();
    });