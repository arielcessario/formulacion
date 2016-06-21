(function () {
    'use strict';

    var scripts = document.getElementsByTagName("script");
    var currentScriptPath = scripts[scripts.length - 1].src;

    angular.module('main', ['ngRoute'])
        .controller('MainController', MainController);


    MainController.$inject = ['FireService', 'Model', '$rootScope', 'AppService', '$routeParams'];
    function MainController(FireService, Model, $rootScope, AppService, $routeParams) {

        var vm = this;
        vm.tarea = {};
        vm.id = $routeParams.id;
        vm.arrProyecto = FireService.createArrayRef(Model.refProyectos);


        $rootScope.$on('ac-autocomplete-selected', function(){

        });

        if (vm.id == undefined) {

            vm.proyecto = {
                etapas: {},
                participaciones: {},
                gastos: {}
            };

            vm.arrProyecto.$loaded(function (data) {
                vm.arrProyecto.$add(vm.proyecto).then(function (data) {
                    return FireService.createObjectRef(Model.refProyectos.child(data.key()));
                }).then(function (data) {
                    vm.proyecto = data;
                });
            });


        } else {

            vm.objProy = FireService.createObjectRef(Model.refProyectos.child(vm.id));

            vm.objProy.$loaded(function (data) {
                vm.proyecto = data;
                refreshIndex();
            });
        }
        vm.tab = 0;


        vm.tipo_participacion = 'A1';
        vm.tipos_participacion = {
            'A1': 'Recursos Propios',
            'A2': 'Recursos Contratados',
            'A3': 'Consultorías y Servicios'
        };
        vm.tipo_gasto = 'A1';
        vm.tipos_gasto = {
            'A1': 'Adquisición',
            'A2': 'Otros'
        };

        vm.siguiente = siguiente;
        vm.getDuracion = getDuracion;
        vm.getWidthTable = getWidthTable;
        vm.getColor = getColor;
        vm.save = save;
        vm.mover = mover;
        vm.exportar = exportar;
        vm.agregarEtapa = agregarEtapa;
        vm.quitarEtapa = quitarEtapa;
        vm.agregarActividad = agregarActividad;
        vm.quitarActividad = quitarActividad;
        vm.agregarTarea = agregarTarea;
        vm.quitarTarea = quitarTarea;
        vm.agregarRecurso = agregarRecurso;
        vm.quitarRecurso = quitarRecurso;
        vm.agregarGasto = agregarGasto;
        vm.quitarGasto = quitarGasto;
        vm.agregarAsignacion = agregarAsignacion;
        vm.quitarAsignacion = quitarAsignacion;

        function refreshIndex() {
            var _etapas = Object.getOwnPropertyNames(vm.proyecto.etapas);
            var _actividades = {};
            var _tareas = {};
            var tareas = {};

            for (var i in _etapas) {
                _actividades = Object.getOwnPropertyNames(vm.proyecto.etapas[_etapas[i]].actividades);
                for (var x in _actividades) {
                    _tareas = Object.getOwnPropertyNames(vm.proyecto.etapas[_etapas[i]].actividades[_actividades[x]].tareas);
                    for (var z in _tareas) {
                        tareas[_tareas[z]] = vm.proyecto.etapas[_etapas[i]].actividades[_actividades[x]].tareas[_tareas[z]].codigo + ' ' + vm.proyecto.etapas[_etapas[i]].actividades[_actividades[x]].tareas[_tareas[z]].descripcion;
                    }
                }
            }

            if (vm.proyecto.index_tareas == undefined) {
                vm.proyecto.index_tareas = {};
            }
            vm.proyecto.index_tareas = tareas;
        }


        function exportar() {
            //getting values of current time for generating the file name
            var dt = new Date();
            var day = dt.getDate();
            var month = dt.getMonth() + 1;
            var year = dt.getFullYear();
            var hour = dt.getHours();
            var mins = dt.getMinutes();
            var postfix = day + "." + month + "." + year + "_" + hour + "." + mins;
            //creating a temporary HTML link element (they support setting file names)
            var a = document.createElement('a');
            //getting data from our div that contains the HTML table
            var data_type = 'data:application/vnd.ms-excel';
            var table_div = document.getElementById('tablas_export');
            var table_html = table_div.outerHTML.replace(/ /g, '%20');
            a.href = data_type + ', ' + table_html;
            //setting the file name
            a.download = 'exported_table_' + postfix + '.xls';
            //triggering the function
            a.click();
            //just in case, prevent default behaviour
            //e.preventDefault();
        }

        function save() {
            vm.proyecto.$save().then(function (data) {
                console.log(data);
            });
        }

        function siguiente() {

            vm.tab = vm.tab + 1;
        }

        function agregarEtapa() {
            if (vm.proyecto.etapas == undefined) {
                vm.proyecto.etapas = {};
            }

            vm.proyecto.etapas[FireService.generatePushId()] = {
                nombre: '',
                colapsada: false,
                actividades: {}
            };

            refreshIndex();
        }

        function quitarEtapa(key) {
            delete vm.proyecto.etapas[key];
            refreshIndex();
        }

        function agregarActividad(etapa) {

            var meses = {};
            var duracion = parseInt(vm.proyecto.duracion);
            for (var i = 0; i < duracion; i++) {
                meses['A' + ((i < 10) ? '0' + i : i)] = false;
            }

            if (etapa.actividades == undefined) {
                etapa.actividades = {};
            }

            etapa.actividades[FireService.generatePushId()] = {
                descripcion: '',
                meses: meses
            };

            refreshIndex();
            //return etapa;
        }

        function quitarActividad(etapa, key) {
            delete etapa.actividades[key];
            refreshIndex();
        }

        function agregarTarea(actividad) {

            var meses = {};
            var duracion = parseInt(vm.proyecto.duracion);
            for (var i = 0; i < duracion; i++) {
                meses['A' + ((i < 10) ? '0' + i : i)] = false;
            }

            if (actividad.tareas == undefined) {
                actividad.tareas = {};
            }

            actividad.tareas[FireService.generatePushId()] = {
                descripcion: '',
                meses: meses
            };

            refreshIndex();
            //return etapa;
        }

        function quitarTarea(actividad, key) {
            delete actividad.tareas[key];
            refreshIndex();
        }

        function agregarRecurso() {


            var _tareas = Object.getOwnPropertyNames(vm.proyecto.index_tareas);
            var tareas = {};
            for (var i in _tareas) {
                tareas[_tareas[i]] = false;
            }

            if (vm.proyecto.participaciones == undefined) {
                vm.proyecto.participaciones = {};
            }

            if (vm.proyecto.participaciones[vm.tipo_participacion] == undefined) {
                vm.proyecto.participaciones[vm.tipo_participacion] = {};
            }


            vm.proyecto.participaciones[vm.tipo_participacion][FireService.generatePushId()] = {
                nombre: '',
                cuit: '',
                descripcion: '',
                sueldo: ''
            };

            refreshIndex();
            //return etapa;
        }

        function quitarRecurso(tipo, key) {
            delete vm.proyecto.participaciones[tipo][key];
        }

        function agregarGasto() {

            var meses = {};
            var duracion = parseInt(vm.proyecto.duracion);
            for (var i = 0; i < duracion; i++) {
                meses['A' + ((i < 10) ? '0' + i : i)] = 0;
            }

            if (vm.proyecto.gastos == undefined) {
                vm.proyecto.gastos = {};
            }

            if (vm.proyecto.gastos[vm.tipo_gasto] == undefined) {
                vm.proyecto.gastos[vm.tipo_gasto] = {};
            }


            vm.proyecto.gastos[vm.tipo_gasto][FireService.generatePushId()] = {
                descripcion: '',
                cantidad: '',
                precio: '',
                mes: 1
            };

            //return etapa;
        }

        function quitarGasto(tipo, key) {
            delete vm.proyecto.gastos[tipo][key];
        }

        function agregarAsignacion(key, participacion) {

            var _etapas = Object.getOwnPropertyNames(vm.proyecto.etapas);
            var _actividades = {};
            var _tareas = {};
            var tareas = {};
            var tarea = {};


            for (var i in _etapas) {
                _actividades = Object.getOwnPropertyNames(vm.proyecto.etapas[_etapas[i]].actividades);
                for (var x in _actividades) {
                    _tareas = Object.getOwnPropertyNames(vm.proyecto.etapas[_etapas[i]].actividades[_actividades[x]].tareas);
                    for (var z in _tareas) {
                        if (_tareas[z] == key) {
                            if (participacion.tareas != undefined && participacion.tareas.hasOwnProperty(key)) {
                                return;
                            }

                            tarea = vm.proyecto.etapas[_etapas[i]].actividades[_actividades[x]].tareas[_tareas[z]];
                            var _meses = Object.getOwnPropertyNames(tarea.meses);
                            for (var y in _meses) {
                                if (tarea.meses[_meses[y]]) {
                                    if (participacion.tareas == undefined) {
                                        participacion.tareas = {};
                                    }

                                    var porcs = {};
                                    for (var xx in _meses) {
                                        if (tarea.meses[_meses[xx]]) {
                                            porcs[_meses[xx]] = 0;
                                        } else {
                                            porcs[_meses[xx]] = -1;
                                        }
                                    }

                                    participacion.tareas[_tareas[z]] = {
                                        descripcion: tarea.codigo + ' - ' + tarea.descripcion,
                                        porcs: porcs
                                    };

                                }
                            }


                        } else {

                        }
                    }
                }
            }

            var el = document.getElementById('searchTarea').getElementsByTagName('input');
            if (el[0] != null) {
                el[0].value = '';
            }

        }

        function quitarAsignacion(tareas, key) {
            delete tareas[key];

        }

        function getDuracion(n) {
            var arr = [];
            for (var i = 0; i < n; i++) {
                arr.push({mes: i, val: false});
            }
            return arr;
        }

        vm.searchTareas = searchTareas;

        function searchTareas(callback) {

            var _tareas = Object.getOwnPropertyNames(vm.proyecto.index_tareas);
            var tareas = [];
            for(var i in _tareas){
                tareas.push({id:_tareas[i], descripcion:vm.proyecto.index_tareas[_tareas[i]]});
            }
            callback(tareas);

        }


        /**
         *
         * @param index
         * @param old_index
         * @param obj padre de la lista a reordenar
         * @param hijo Nombre del lo que quiero reordenar
         */
        function mover(index, old_index, obj, hijo) {

            var _keys = Object.getOwnPropertyNames(obj[hijo]);


        }

        function getWidthTable(n, m) {
            return parseInt(n) + parseInt(m);
        }

        function getColor(id, sub) {
            var colores =
            {
                'A': {
                    c1: '#F44336',
                    c2: '#EF5350',
                    c3: '#FFCDD2'
                },
                'B': {
                    c1: '#673AB7',
                    c2: '#7E57C2',
                    c3: '#D1C4E9'
                },
                'C': {
                    c1: '#009688',
                    c2: '#26A69A',
                    c3: '#B2DFDB'
                },
                'D': {
                    c1: '#795548',
                    c2: '#8D6E63',
                    c3: '#D7CCC8'
                },
                'E': {
                    c1: '#607D8B',
                    c2: '#78909C',
                    c3: '#CFD8DC'
                },
                'F': {
                    c1: '#3F51B5',
                    c2: '#5C6BC0',
                    c3: '#C5CAE9'
                },
                'G': {
                    c1: '#FF9800',
                    c2: '#FFA726',
                    c3: '#FFE0B2'
                }
            };


            return colores[id][sub];
        }

    }
})();