(function () {
    'use strict';

// Declare app level module which depends on views, and components
    angular.module('macrignetto', ['oc.lazyLoad',
        'ngRoute',
        'ngAnimate',
        'firebase',
        'textAngular',
        'acUtils',
        'acUploads',
        'acFactory',
        'Model',
        'login',
        'acContacts',
        'acPaginacion',
        'acAdministracionUsuarios',
        'acAdministracionEventos',
        'acAdministracionNotas',
        'acAdministracionComics',
        'acAdministracionComentarios',
        'acAdministracionRevistas',
        'acContacto'
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

            $routeProvider.when('/administracion/:id', {
                templateUrl: 'administracion/administracion.html',
                controller: 'AdministracionController',
                data: {requiresLogin: true},
                resolve: { // Any property in resolve should return a promise and is executed before the view is loaded
                    loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                        // you can lazy load files for an existing module
                        return $ocLazyLoad.load('administracion/administracion.js');
                    }]
                }
            });

            $routeProvider.when('/nota/:id', {
                templateUrl: 'nota/nota.html',
                controller: 'NotaController',
                data: {requiresLogin: false},
                resolve: { // Any property in resolve should return a promise and is executed before the view is loaded
                    loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                        // you can lazy load files for an existing module
                        return $ocLazyLoad.load('nota/nota.js');
                    }]
                }
            });

            $routeProvider.when('/noticias', {
                templateUrl: 'noticias/noticias.html',
                controller: 'NoticiasController',
                data: {requiresLogin: false},
                resolve: { // Any property in resolve should return a promise and is executed before the view is loaded
                    loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                        // you can lazy load files for an existing module
                        return $ocLazyLoad.load('noticias/noticias.js');
                    }]
                }
            });

            $routeProvider.when('/revistas', {
                templateUrl: 'revistas/revistas.html',
                controller: 'RevistasController',
                data: {requiresLogin: false},
                resolve: { // Any property in resolve should return a promise and is executed before the view is loaded
                    loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                        // you can lazy load files for an existing module
                        return $ocLazyLoad.load('revistas/revistas.js');
                    }]
                }
            });

            $routeProvider.when('/revista/:id', {
                templateUrl: 'revista/revista.html',
                controller: 'RevistaController',
                data: {requiresLogin: false},
                resolve: { // Any property in resolve should return a promise and is executed before the view is loaded
                    loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                        // you can lazy load files for an existing module
                        return $ocLazyLoad.load('revista/revista.js');
                    }]
                }
            });

            $routeProvider.when('/humor', {
                templateUrl: 'humor/humor.html',
                controller: 'HumorController',
                data: {requiresLogin: false},
                resolve: { // Any property in resolve should return a promise and is executed before the view is loaded
                    loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                        // you can lazy load files for an existing module
                        return $ocLazyLoad.load('humor/humor.js');
                    }]
                }
            });

            $routeProvider.when('/comic/:id', {
                templateUrl: 'comic/comic.html',
                controller: 'ComicController',
                data: {requiresLogin: false},
                resolve: { // Any property in resolve should return a promise and is executed before the view is loaded
                    loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                        // you can lazy load files for an existing module
                        return $ocLazyLoad.load('comic/comic.js');
                    }]
                }
            });

            $routeProvider.when('/resultados', {
                templateUrl: 'resultados/resultados.html',
                controller: 'ResultadoController',
                data: {requiresLogin: false},
                resolve: { // Any property in resolve should return a promise and is executed before the view is loaded
                    loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                        // you can lazy load files for an existing module
                        return $ocLazyLoad.load('resultados/resultados.js');
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
        .controller('AppCtrl', AppCtrl)
        //Constante definida para la librería ac-angularfire-factory
        .constant('_FIREREF', 'https://macrignetto.firebaseio.com/');


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

        $scope.$watch('appCtrl.textProyecto', function (newVal, oldVal) {
            if (newVal != oldVal && newVal != undefined) {
                filterByText();
                console.log(vm.textProyecto);
            }
        });

        function filterByText() {
            AppService.search = vm.textProyecto;
            $location.path('/resultados');

            $timeout(function () {
                vm.textProyecto = '';
            }, 1000);
        }

        function volver(view){
            $location.path('/' + view);
        }
    }

    AppService.$inject = ['$rootScope'];
    function AppService($rootScope) {
        this.search = '';
        this.origen = '/main';

        this.listen = function (callback) {
            $rootScope.$on('result', callback);
        };

        this.broadcast = function () {
            $rootScope.$broadcast('result');
        };

    }

})();

