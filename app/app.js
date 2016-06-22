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
        'acAutocomplete',
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

            $routeProvider.when('/main/:id', {
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
        .run(function ($rootScope, $location, FireVars, FireService) {


            FireService.init();
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
        .factory('helperService', helperService)
        .filter('duracion', duracion)
        .filter('filterParticipacion', filterParticipacion)
        .filter('filterPromedioMesesParticipacion', filterPromedioMesesParticipacion)
        .filter('filterPromedioParticipacion', filterPromedioParticipacion)
        .filter('colorduracion', colorduracion)
        .filter('filterTotalFontarPropios', filterTotalFontarPropios)
        .filter('filterTotalCostos', filterTotalCostos)
        .filter('filterCostPerYear', filterCostPerYear)
    ;

    'use strict';


    AppCtrl.$inject = ['FireService', '$rootScope', '$scope', '$location', '$timeout', 'Model'];
    function AppCtrl(FireService, $rootScope, $scope, $location, $timeout, Model) {
        var vm = this;
        vm.hideLoader = true;
        vm.display_menu = true;
        vm.display_header = true;
        vm.textProyecto = '';
        vm.proyecto = {};

        vm.volver = volver;
        vm.goTo = goTo;


        ////////// NAVEGACION //////////
        $rootScope.$on('$routeChangeSuccess', function (event, next, current) {
            vm.menu = (next.$$route == undefined) ? current.$$route.originalPath.split('/')[1] : next.$$route.originalPath.split('/')[1];
            vm.sub_menu = next.params.id;
        });
        ////////// NAVEGACION //////////

        $rootScope.$on('ac-autocomplete-selected', function () {
            if (vm.proyecto.$id != undefined) {
                $location.path('/main/' + vm.proyecto.$id);
            }
        });


        function goTo(id) {
            $location.path(id);
        }

        function volver(view) {
            $location.path('/' + view);
        }

        vm.searchProyecto = searchProyecto;
        vm.proyectos = [];
        vm.arrProyectos = FireService.createArrayRef(Model.refProyectos);

        function searchProyecto(callback) {
            vm.arrProyectos.$loaded().then(function (data) {
                vm.proyectos = data;
                return data;
            }).then(callback);
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

    filterParticipacion.$inject = ['helperService'];
    function filterParticipacion(helperService) {
        return function (tareas) {
            /*if (tareas == null || tareas == undefined) {
             return;
             }
             var _meses = Object.getOwnPropertyNames(tareas[Object.getOwnPropertyNames(tareas)[0]].porcs);
             var porcs_prom = {};
             for (var i in _meses) {
             porcs_prom[_meses[i]] = 0;
             }


             var _tareas = Object.getOwnPropertyNames(tareas);

             for (var i in _tareas) {
             _meses = Object.getOwnPropertyNames(tareas[_tareas[i]].porcs);
             for (var x in _meses) {
             if (tareas[_tareas[i]].porcs[_meses[x]] != -1) {
             porcs_prom[_meses[x]] = parseInt(porcs_prom[_meses[x]]) + parseInt(tareas[_tareas[i]].porcs[_meses[x]]);
             }
             }
             }


             return porcs_prom;*/
            var response = {};
            helperService.$procesarObj(tareas, response);
            return (response.prom_porcs);

        }
    }

    filterPromedioParticipacion.$inject = ['helperService'];
    function filterPromedioParticipacion(helperService) {
        return function (tareas) {
            //if (tareas == null || tareas == undefined) {
            //    return;
            //}
            //var _meses = Object.getOwnPropertyNames(tareas[Object.getOwnPropertyNames(tareas)[0]].porcs);
            //var porcs_prom = {};
            //for (var i in _meses) {
            //    porcs_prom[_meses[i]] = 0;
            //}
            //
            //
            //var _tareas = Object.getOwnPropertyNames(tareas);
            //
            //for (var i in _tareas) {
            //    _meses = Object.getOwnPropertyNames(tareas[_tareas[i]].porcs);
            //    for (var x in _meses) {
            //        if (tareas[_tareas[i]].porcs[_meses[x]] != -1) {
            //            porcs_prom[_meses[x]] = parseInt(porcs_prom[_meses[x]]) + parseInt(tareas[_tareas[i]].porcs[_meses[x]]);
            //        }
            //    }
            //}
            //
            //
            //var total = 0;
            //_tareas = Object.getOwnPropertyNames(porcs_prom);
            //for (var i in _tareas) {
            //    if (porcs_prom[_tareas[i]] != 0) {
            //        total = total + 1;
            //    }
            //}
            //
            //return total;

            var response = {};
            helperService.$procesarObj(tareas, response);
            return (response.total_porc / response.cant_meses);
        }
    }

    filterPromedioMesesParticipacion.$inject = ['helperService'];
    function filterPromedioMesesParticipacion(helperService) {
        return function (tareas) {
            //if (tareas == null || tareas == undefined) {
            //    return;
            //}
            //var _meses = Object.getOwnPropertyNames(tareas[Object.getOwnPropertyNames(tareas)[0]].porcs);
            //var porcs_prom = {};
            //for (var i in _meses) {
            //    porcs_prom[_meses[i]] = 0;
            //}
            //
            //
            //var _tareas = Object.getOwnPropertyNames(tareas);
            //
            //for (var i in _tareas) {
            //    _meses = Object.getOwnPropertyNames(tareas[_tareas[i]].porcs);
            //    for (var x in _meses) {
            //        if (tareas[_tareas[i]].porcs[_meses[x]] != -1) {
            //            porcs_prom[_meses[x]] = parseInt(porcs_prom[_meses[x]]) + parseInt(tareas[_tareas[i]].porcs[_meses[x]]);
            //        }
            //    }
            //}
            //
            //
            //var total = 0;
            //var porc_total = 0;
            //_tareas = Object.getOwnPropertyNames(porcs_prom);
            //for (var i in _tareas) {
            //    if (porcs_prom[_tareas[i]] != 0) {
            //        total = total + 1;
            //        porc_total = porc_total + parseFloat(porcs_prom[_tareas[i]]);
            //    }
            //}

            var response = {};
            helperService.$procesarObj(tareas, response);
            return (response.cant_meses);


        }
    }

    filterTotalCostos.$inject = ['helperService'];
    function filterTotalCostos(helperService) {
        return function (participacion) {
            if (participacion == null || participacion == undefined) {
                return;
            }
            var _response = 0;
            var response = {};
            var _participaciones = Object.getOwnPropertyNames(participacion);
            for (var ii in _participaciones) {


                var tareas = participacion[_participaciones[ii]].tareas;
                //if (tareas == null || tareas == undefined) {
                //    return;
                //}
                //var _meses = Object.getOwnPropertyNames(tareas[Object.getOwnPropertyNames(tareas)[0]].porcs);
                //var porcs_prom = {};
                //for (var i in _meses) {
                //    porcs_prom[_meses[i]] = 0;
                //}
                //
                //
                //var _tareas = Object.getOwnPropertyNames(tareas);
                //
                //for (var i in _tareas) {
                //    _meses = Object.getOwnPropertyNames(tareas[_tareas[i]].porcs);
                //    for (var x in _meses) {
                //        if (tareas[_tareas[i]].porcs[_meses[x]] != -1) {
                //            porcs_prom[_meses[x]] = parseInt(porcs_prom[_meses[x]]) + parseInt(tareas[_tareas[i]].porcs[_meses[x]]);
                //        }
                //    }
                //}
                //
                //
                //var total = 0;
                //var porc_total = 0;
                //_tareas = Object.getOwnPropertyNames(porcs_prom);
                //for (var i in _tareas) {
                //    if (porcs_prom[_tareas[i]] != 0) {
                //        total = total + 1;
                //        porc_total = porc_total + parseFloat(porcs_prom[_tareas[i]]);
                //    }
                //}
                helperService.$procesarObj(tareas, response);

                _response = _response + (((response.total_porc / response.cant_meses) * participacion[_participaciones[ii]].sueldo / 100) * response.cant_meses);

            }

            return _response;


        }
    }

    filterTotalFontarPropios.$inject = [];
    function filterTotalFontarPropios() {
        return function (tareas) {
            //if (tareas == null || tareas == undefined) {
            //    return;
            //}
            //var _meses = Object.getOwnPropertyNames(tareas[Object.getOwnPropertyNames(tareas)[0]].porcs);
            //var porcs_prom = {};
            //for (var i in _meses) {
            //    porcs_prom[_meses[i]] = 0;
            //}
            //
            //
            //var _tareas = Object.getOwnPropertyNames(tareas);
            //
            //for (var i in _tareas) {
            //    _meses = Object.getOwnPropertyNames(tareas[_tareas[i]].porcs);
            //    for (var x in _meses) {
            //        if (tareas[_tareas[i]].porcs[_meses[x]] != -1) {
            //            porcs_prom[_meses[x]] = parseInt(porcs_prom[_meses[x]]) + parseInt(tareas[_tareas[i]].porcs[_meses[x]]);
            //        }
            //    }
            //}
            //
            //
            //var total = 0;
            //var porc_total = 0;
            //_tareas = Object.getOwnPropertyNames(porcs_prom);
            //for (var i in _tareas) {
            //    if (porcs_prom[_tareas[i]] != 0) {
            //        total = total + 1;
            //        porc_total = porc_total + parseFloat(porcs_prom[_tareas[i]]);
            //    }
            //}
            //
            //return (porc_total / total);

            var response = {};
            helperService.$procesarObj(tareas, response);
            return (response.total_porc / response.cant_meses);


        }
    }


    filterCostPerYear.$inject = ['helperService'];
    function filterCostPerYear(helperService) {
        return function (proyecto) {
            var response = {};
            if (proyecto == undefined) {
                return;
            }

            var anios = {};
            var _anios = Math.ceil(proyecto.duracion / 12);
            for (var i = 1; i < _anios + 1; i++) {

                anios[(i < 10) ? '0' + i : i] = {};

            }
            var _gastoAcumulado = {};
            for (var i = 1; i < 4; i++) {
                var _participaciones = Object.getOwnPropertyNames(proyecto.participaciones['A' + i]);
                for (var x in _participaciones) {
                    helperService.$procesarObj(proyecto.participaciones['A' + i][_participaciones[x]].tareas, response);

                    if (!_gastoAcumulado.hasOwnProperty(_participaciones[x])) {
                        _gastoAcumulado[_participaciones[x]] = {};
                    }
                    _gastoAcumulado[_participaciones[x]]['nombre'] = proyecto.participaciones['A' + i][_participaciones[x]].nombre;
                    _gastoAcumulado[_participaciones[x]]['tipo'] = 'A' + i;
                    var subTotalAnio = 0;
                    var _anio = 1;
                    for (var y = 0; y < Object.getOwnPropertyNames(response.prom_porcs).length; y++) {
                        _anio = (Math.ceil((y + 1) / 12) < 10) ? '0' + Math.ceil((y + 1) / 12) : Math.ceil((y + 1) / 12);


                        if (_gastoAcumulado[_participaciones[x]]['anios'] == undefined) {
                            _gastoAcumulado[_participaciones[x]]['anios'] = {}
                        }

                        if (_gastoAcumulado[_participaciones[x]]['anios'][_anio] == undefined) {
                            _gastoAcumulado[_participaciones[x]]['anios'][_anio] = 0
                        }

                        _gastoAcumulado[_participaciones[x]]['anios'][_anio] = _gastoAcumulado[_participaciones[x]]['anios'][_anio] + ((proyecto.participaciones['A' + i][_participaciones[x]].sueldo * response.prom_porcs[Object.getOwnPropertyNames(response.prom_porcs)[y]]) / 100);


                    }

                }
            }


            console.log(_gastoAcumulado);
            return anios;


        }
    }

    helperService.$inject = [];
    function helperService() {
        var service = {};
        //service.response = {
        //    total_porc: 0,
        //    cant_meses: 0
        //};

        service.$procesarObj = procesarObj;

        return service;

        function procesarObj(obj, response) {


            if (obj == null || obj == undefined) {
                return;
            }
            var _meses = Object.getOwnPropertyNames(obj[Object.getOwnPropertyNames(obj)[0]].porcs);
            var porcs_prom = {};
            for (var i in _meses) {
                porcs_prom[_meses[i]] = 0;
            }


            var _tareas = Object.getOwnPropertyNames(obj);

            for (var i in _tareas) {
                _meses = Object.getOwnPropertyNames(obj[_tareas[i]].porcs);
                for (var x in _meses) {
                    if (obj[_tareas[i]].porcs[_meses[x]] != -1) {
                        porcs_prom[_meses[x]] = parseInt(porcs_prom[_meses[x]]) + parseInt(obj[_tareas[i]].porcs[_meses[x]]);
                    }
                }
            }


            response.cant_meses = 0;
            response.total_porc = 0;
            response.prom_porcs = porcs_prom;
            _tareas = Object.getOwnPropertyNames(porcs_prom);
            for (var i in _tareas) {
                if (porcs_prom[_tareas[i]] != 0) {
                    response.cant_meses = response.cant_meses + 1;
                    response.total_porc = response.total_porc + parseFloat(porcs_prom[_tareas[i]]);
                }
            }
        }
    }


})
();

