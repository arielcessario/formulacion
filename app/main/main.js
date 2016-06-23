(function () {
    'use strict';

    var scripts = document.getElementsByTagName("script");
    var currentScriptPath = scripts[scripts.length - 1].src;

    angular.module('main', ['ngRoute'])
        .controller('MainController', MainController);


    MainController.$inject = ['FireService', 'Model', '$rootScope', '$scope', '$routeParams', 'helperService'];
    function MainController(FireService, Model, $rootScope, $scope, $routeParams, helperService) {

        var vm = this;
        vm.tarea = {};
        vm.id = $routeParams.id;
        vm.arrProyecto = FireService.createArrayRef(Model.refProyectos);
        vm.gastoAcumulado = {};

        $rootScope.$on('ac-autocomplete-selected', function () {

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
        vm.getAnual = getAnual;

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
            getAnual();
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
            var data_type = 'data:application/vnd.ms-excel;charset=utf-8,\uFEFF';
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
                getAnual();
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
            for (var i in _tareas) {
                tareas.push({id: _tareas[i], descripcion: vm.proyecto.index_tareas[_tareas[i]]});
            }
            callback(tareas);

        }


        function getAnual() {
            var response = {};

            var _gastoAcumulado = {};


            if (vm.proyecto == undefined) {
                return;
            }

            _gastoAcumulado.participaciones = [];
            if (_gastoAcumulado.id != vm.proyecto.$id) {
                _gastoAcumulado.id = vm.proyecto.$id;
            }
            //_gastoAcumulado = {};
            var anios = {};
            var _anios = Math.ceil(vm.proyecto.duracion / 12);
            for (var i = 1; i < _anios + 1; i++) {
                anios[(i < 10) ? '0' + i : i] = {};
            }


            for (var i = 1; i < 4; i++) {
                var participaciones = Object.getOwnPropertyNames(vm.proyecto.participaciones['A' + i]);
                for (var x in participaciones) {
                    helperService.$procesarObj(vm.proyecto.participaciones['A' + i][participaciones[x]].tareas, response);
                    if (_gastoAcumulado.participaciones == undefined) {
                        _gastoAcumulado.participaciones = [];
                    }

                    var _participacion = {
                        nombre: vm.proyecto.participaciones['A' + i][participaciones[x]].nombre,
                        tipo: 'A' + i,
                        anios: []
                    };
                    var subTotalAnio = 0;
                    var _anio_nro = '01';
                    var _anio = {
                        id: _anio_nro,
                        fontar: 0,
                        propio: 0
                    };
                    for (var y = 0; y < Object.getOwnPropertyNames(response.prom_porcs).length; y++) {
                        _anio_nro = (Math.ceil((y + 1) / 12) < 10) ? '0' + Math.ceil((y + 1) / 12) : Math.ceil((y + 1) / 12);


                        if (_anio_nro !== _anio.id) {
                            _participacion.anios.push(_anio);
                            subTotalAnio = 0;
                            _anio = {
                                id: _anio_nro,
                                fontar: 0,
                                propio: 0
                            };
                        }
                        // Tomo la participación para los propios, no se divide en dos, el total va a propios
                        if (_participacion.tipo == 'A1') {
                            _anio.propio = _anio.propio + ((vm.proyecto.participaciones['A' + i][participaciones[x]].sueldo * response.prom_porcs[Object.getOwnPropertyNames(response.prom_porcs)[y]]) / 100);

                        } else {
                            subTotalAnio = subTotalAnio + ((vm.proyecto.participaciones['A' + i][participaciones[x]].sueldo * response.prom_porcs[Object.getOwnPropertyNames(response.prom_porcs)[y]]) / 100);
                            _anio.propio = subTotalAnio / 2;
                            _anio.fontar = subTotalAnio / 2;
                        }

                    }

                    _participacion.anios.push(_anio);
                    _gastoAcumulado.participaciones.push(_participacion);
                }
            }

            //vm.gastoAcumulado = _gastoAcumulado;


            var full_table = angular.element(document.querySelector('#tabla-anual'));
            full_table.html('');
            var title = '<td></td>';
            var head = '<td>NOMBRE</td>';
            var body = '';


            for (var i = 0; i < _gastoAcumulado.participaciones[0].anios.length; i++) {
                title = title + '<td colspan="3" style="text-align: center;">AÑO' + (i + 1) + '</td>';
            }
            for (var i = 0; i < _gastoAcumulado.participaciones[0].anios.length; i++) {
                head = head + '<td>PROPIO</td><td>FONTAR</td><td>TOTAL</td>';
            }

            for (var i = 0; i < _gastoAcumulado.participaciones.length; i++) {

                body = body + '<tr><td style="font-weight: bold;">' + _gastoAcumulado.participaciones[i].nombre + '</td>';
                for (var x = 0; x < _gastoAcumulado.participaciones[i].anios.length; x++) {

                    body = body + '<td>' + _gastoAcumulado.participaciones[i].anios[x].propio + '</td><td>' + _gastoAcumulado.participaciones[i].anios[x].fontar + '</td><td>' + (parseFloat(_gastoAcumulado.participaciones[i].anios[x].propio) + parseFloat(_gastoAcumulado.participaciones[i].anios[x].fontar)) + '</td>';
                }
                body = body + '</tr>';
            }


            var table =
                '<table class="table table-striped" border="1">' +
                '<thead style="font-weight: bold;">' +
                '<tr>' + title + '</tr>' +
                '<tr>' + head + '</tr>' +
                '</thead>' +
                '<tbody>' + body +
                '</tbody>' +
                '</table>';

            //console.log(head);
            full_table.append(table);

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