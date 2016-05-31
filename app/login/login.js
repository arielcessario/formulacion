(function () {
    'use strict';
    angular.module('login', [])
        .component('acLogin', acLogin());

    ///// COMPONENTE LOGIN /////
    function acLogin() {
        return {
            bindings: {
                loginOk: '<',
                loginKo: '<'
            },
            templateUrl: 'login/login.html',
            controller: AcLoginController
        }
    }

    AcLoginController.$inject = ['FireVars', 'Model', '$location', '$scope'];
    /**
     * @constructor
     */
    function AcLoginController(FireVars, Model, $location, $scope) {
        var vm = this;
        vm.email = '';
        vm.password = '';
        vm.oldPassword = '';
        vm.newPassword = '';
        vm.nombre = '';
        vm.panel = 1;

        vm.isLogged = false;

        //FUNCIONES
        vm.login = login;
        vm.logout = logout;
        vm.createUser = createUser;
        vm.resetPassword = resetPassword;
        vm.changePassword = changePassword;


        function changePassword() {
            FireVars._FIREREF.changePassword({
                email       : vm.email,
                oldPassword : vm.oldPassword,
                newPassword : vm.newPassword
            }, function(error) {
                if (error) {
                    switch (error.code) {
                        case "INVALID_PASSWORD":
                            console.log("The specified user account password is incorrect.");
                            break;
                        case "INVALID_USER":
                            console.log("The specified user account does not exist.");
                            break;
                        default:
                            console.log("Error changing password:", error);
                    }
                } else {
                    vm.oldPassword = '';
                    vm.newPassword = '';
                    console.log("User password changed successfully!");
                }
            });
        }

        function resetPassword() {
            FireVars._FIREREF.resetPassword({
                email : vm.email
            }, function(error) {
                if (error) {
                    switch (error.code) {
                        case "INVALID_USER":
                            console.log("The specified user account does not exist.");
                            break;
                        default :
                            console.log("Error resetting password:", error);
                    }
                } else {
                    console.log("Password reset email sent successfully");
                }
            });
        }


        function logout(){
            FireVars._FIREREF.unauth();
            vm.isLogged = false;
            $location.path('/main');
        }

        function createUser() {
            Model.refUsuarios.createUser({
                email    : vm.email,
                password : vm.password
            }, function(error, userData) {
                if (error) {
                    console.log("Error creating user:", error);
                } else {
                    console.log("Successfully created user account with uid:", userData.uid);
                    login();
                }
            });
        }

        function authHandler(error, authData) {
            if (error) {
                console.log("Login Failed!", error);
                //$location.path(vm.loginKo);
            } else {
                console.log("Authenticated successfully with payload:", authData);
            }
        }

        function login() {
            FireVars._FIREREF.authWithPassword({
                email: vm.email,
                password: vm.password
            }, authHandler);
        }

        FireVars._FIREREF.onAuth(function (authData) {

            if (authData) {
                var userRef = Model.refUsuarios.child(authData.uid);
                userRef.once("value", function (snapshot) {
                    var exist = snapshot.exists();

                    if (!exist) {
                        // save the user's profile into the database so we can list users,
                        // use them in Security and Firebase Rules, and show profiles
                        Model.refUsuarios.child(authData.uid).set({
                            provider: authData.provider,
                            nombre: getName(authData),
                            email: getEmail(authData),
                            rol: 1
                        });
                    }

                    vm.isLogged = true;
                    vm.usuario = getName(authData);
                    //$location.path(vm.loginOk);
                    if (!$scope.$$phase) {
                        $scope.$apply();
                    }
                });
            }
        });
        function getEmail(authData) {
            switch (authData.provider) {
                case 'password':
                    return authData.password.email;
                case 'twitter':
                    return authData.twitter.displayName;
                case 'facebook':
                    return authData.facebook.email;
                case 'google':
                    return authData.google.email;
            }
        }

        function getName(authData) {
            switch (authData.provider) {
                case 'password':
                    return authData.password.email.replace(/@.*/, '');
                case 'twitter':
                    return authData.twitter.displayName;
                case 'facebook':
                    return authData.facebook.displayName;
                case 'google':
                    return authData.google.displayName;
            }
        }
    }

})();