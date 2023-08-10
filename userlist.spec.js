describe('UserListController', function () {
    var $controller, $rootScope, $httpBackend, UserListServiceMock, TokenServiceMock, AuthServiceMock, $windowMock, $q;
  
    beforeEach(module('UserListModule'));
  
    beforeEach(inject(function (_$controller_, _$rootScope_, _$httpBackend_, _$q_) {
      $controller = _$controller_;
      $rootScope = _$rootScope_;
      $httpBackend = _$httpBackend_;
      $q = _$q_;
  
      UserListServiceMock = {
        fetchUserList: function () {
          return $q.resolve([
            { login: 'user1' },
            { login: 'user2' }
          ]);
        },
        fetchUserData: function (username) {
          var userData = {
            user1: { login: 'user1', followers: 100, public_repos: 20 },
            user2: { login: 'user2', followers: 50, public_repos: 10 }
          };
          return $q.resolve(userData[username]);
        }
      };
  
      TokenServiceMock = {
        getToken: function () {
          return 'mocked-token';
        }
      };
  
      AuthServiceMock = {
        authenticate: function (token) {
          return $q.resolve(true);
        }
      };
  
      $windowMock = {
        location: {
          href: '',
        },
        location: {
          reload: jasmine.createSpy('reload')
        }
      };
    }));
  
    it('should set isTokenUsed and fetch user data when token is valid', function () {
        var $scope = $rootScope.$new();
        spyOn(UserListServiceMock, 'fetchUserData').and.callThrough();

        $httpBackend.expectGET('https://api.github.com/user').respond({ login: 'mocked-user', followers: 100, public_repos: 20 });
      
        var controller = $controller('UserListController', {
          $scope: $scope,
          UserListService: UserListServiceMock,
          TokenService: TokenServiceMock,
          AuthService: AuthServiceMock,
          $window: $windowMock
        });
      
        $scope.token = TokenServiceMock.getToken();
        $scope.$apply();

        $httpBackend.flush();
      
        expect($scope.isTokenUsed).toBe(true);
        expect(UserListServiceMock.fetchUserData).toHaveBeenCalled();
        expect($scope.userData).toEqual({ login: 'mocked-user', followers: 100, public_repos: 20 });
      });
      
  
    it('should set isTokenUsed to false when token is invalid', function () {
      var $scope = $rootScope.$new();
      spyOn(AuthServiceMock, 'authenticate').and.returnValue($q.resolve(false));
  
      var controller = $controller('UserListController', {
        $scope: $scope,
        UserListService: UserListServiceMock,
        TokenService: TokenServiceMock,
        AuthService: AuthServiceMock,
        $window: $windowMock
      });
  
      $scope.token = TokenServiceMock.getToken();
      $scope.$apply();
  
      expect($scope.isTokenUsed).toBe(false);
      expect($scope.userData).toBeNull();
    });
  });
  