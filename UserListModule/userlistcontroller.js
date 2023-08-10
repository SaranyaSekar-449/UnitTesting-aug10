var app = angular.module('UserListModule', []);

app.controller('UserListController', ['$scope', 'UserListService', 'TokenService', 'AuthService', '$http','$window', function ($scope, UserListService, TokenService, AuthService, $http,$window) {
  $scope.isTokenUsed = false; 
  $scope.userData = null; 

  $scope.token = TokenService.getToken();
  if ($scope.token) {
    AuthService.authenticate($scope.token)
      .then(function (isValidToken) {
        $scope.isTokenUsed = isValidToken; 
        console.log('Token used:', $scope.isTokenUsed);
        if ($scope.isTokenUsed) {
          $http.get('https://api.github.com/user', {
            headers: {
              Authorization: `token ${$scope.token}`
            }
          }).then(function (response) {
            $scope.userData = response.data;
            console.log('User Data:', $scope.userData); 
            fetchUserDetails(); 
          }).catch(function (error) {
            console.error('Error fetching user data:', error);
          });
        }
      })
      .catch(function (error) {
        console.error('Error validating token:', error);
      });
  } else {
    fetchUserDetails(); 
  }
  $scope.logout = function () {
    window.location.href = '#token';
    $window.location.reload();
  };
  function fetchUserDetails() {
    UserListService.fetchUserList().then(function (userList) {
      $scope.userList = userList;
      console.log('User List:', $scope.userList); 

      for (var i = 0; i < $scope.userList.length; i++) {
        UserListService.fetchUserData($scope.userList[i].login).then(function (userData) {
          var user = $scope.userList.find(u => u.login === userData.login);
          if (user) {
            user.followersCount = userData.followers;
            user.reposCount = userData.public_repos;
          }
        }).catch(function (error) {
          console.error('Error fetching user data:', error);
        });
      }
    }).catch(function (error) {
      console.error('Error fetching user list:', error);
    });
  }
}]);

app.factory('UserListService', function ($http, $q) {
  return {
    fetchUserList: function () {
      return $http.get('https://api.github.com/users')
        .then(function (response) {
          return response.data;
        })
        .catch(function (error) {
          console.error('Error fetching user list:', error);
          return $q.reject(error);
        });
    },
    fetchUserData: function (username) {
      return $http.get(`https://api.github.com/users/${username}`)
        .then(function (response) {
          return response.data;
        })
        .catch(function (error) {
          console.error('Error fetching user data:', error);
          return $q.reject(error);
        });
    }
  };
});
