(function () {
// Declare app level module which depends on views, and components
    angular.module('macrignetto', ['oc.lazyLoad',
        'ngRoute',
        'ngAnimate',
        'ngTouch',
        'ui.bootstrap',
        'firebase',
        'textAngular',
        'acUtils',
        'acFactory',
        'Model',
        'login'
    ]).config(['$routeProvider', function ($routeProvider) {

            $routeProvider.otherwise({redirectTo: '/main'});

            $routeProvider.when('/main', {
                templateUrl: 'main/main.html',
                controller: 'MainController',
                data: {requiresLogin: false},
                resolve: { // Any property in resolve should return a promise and is executed before the view is loaded
                    loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                        // you can lazy load files for an existing module
                        return $ocLazyLoad.load('main/main.js');
                    }]
                }
            });

            $routeProvider.when('/listado', {
                templateUrl: 'listado/listado.html',
                controller: 'ListadoController',
                data: {requiresLogin: false},
                resolve: { // Any property in resolve should return a promise and is executed before the view is loaded
                    loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                        // you can lazy load files for an existing module
                        return $ocLazyLoad.load('listado/listado.js');
                    }]
                }
            });


        }])
        .run(function ($rootScope, $location, FireVars) {
            // Para activar la seguridad en una vista, agregar data:{requiresLogin:false} dentro de $routeProvider.when */
            $rootScope.$on('$routeChangeStart', function (e, to) {
                var ref = FireVars._FIREREF;
                var authData = ref.getAuth();
                if (to && to.data && to.data.requiresLogin) {
                    if (!authData) {
                        e.preventDefault();
                        $location.path('/login');
                    } else {
                    }
                }
            });
        })
        .service('AppService', AppService)
        .controller('AppCtrl', AppCtrl)
        //Constante definida para la librería ac-angularfire-factory
        .constant('_FIREREF', 'https://formulacion.firebaseio.com/')
        .filter('duracion', duracion)
        .filter('colorduracion', colorduracion)
    ;

    'use strict';


    AppCtrl.$inject = ['FireService', '$rootScope', '$scope', '$location', '$timeout'];
    function AppCtrl(FireService, $rootScope, $scope, $location, $timeout) {
        var vm = this;
        vm.hideLoader = true;
        vm.display_menu = true;
        vm.display_header = true;
        vm.textProyecto = '';

        vm.volver = volver;

        FireService.init();


        ////////// NAVEGACION //////////
        $rootScope.$on('$routeChangeSuccess', function (event, next, current) {
            vm.menu = (next.$$route == undefined) ? current.$$route.originalPath.split('/')[1] : next.$$route.originalPath.split('/')[1];
            vm.sub_menu = next.params.id;
        });
        ////////// NAVEGACION //////////


        function volver(view) {
            $location.path('/' + view);
        }
    }

    AppService.$inject = ['$rootScope'];
    function AppService($rootScope) {
        this.search = '';
        this.origen = '/main';
        this.proyecto = '';

        this.listen = function (callback) {
            $rootScope.$on('result', callback);
        };

        this.broadcast = function () {
            $rootScope.$broadcast('result');
        };

    }

    duracion.$inject = [];
    function duracion() {
        return function (duracion) {
            //var duracion = Object.getOwnPropertyNames(actividades[Object.getOwnPropertyNames(actividades)[0]].meses).length;
            //var duracion = actividades;
            var meses = {};
            for (var i = 0; i < duracion; i++) {
                meses['A' + i] = false;
            }
            return meses;
        };
    }

    colorduracion.$inject = [];
    function colorduracion() {
        return function (obj, duracion) {
            var meses = {};
            for (var i = 0; i < duracion; i++) {
                meses['A' + i] = false;
            }

            var _keys_act = Object.getOwnPropertyNames(obj.tareas);

            for (var k in _keys_act) {
                var _meses = Object.getOwnPropertyNames(obj.tareas[_keys_act[k]].meses);
                for (var k_m in _meses) {
                    if (obj.tareas[_keys_act[k]].meses[_meses[k_m]]) {
                        meses['A' + k_m] = true;
                    }
                }
            }

            return meses;

        };
    }

})();

