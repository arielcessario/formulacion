(function () {
    'use strict';

    var scripts = document.getElementsByTagName("script");
    var currentScriptPath = scripts[scripts.length - 1].src;

    angular.module('listado', ['ngRoute'])
        .controller('ListadoController', ListadoController);


    ListadoController.$inject = ['FireService', 'Model', '$location', 'AppService'];
    function ListadoController(FireService, Model, $location, AppService) {

        var vm = this;
        vm.proyectos = [];
        vm.arrProyectos = FireService.createArrayRef(Model.refProyectos);

        vm.goTo = goTo;

        vm.arrProyectos.$loaded().then(function (data) {
            console.log(data);
            vm.proyectos = data;
        });

        function goTo(key) {
            console.log(key);
            AppService.proyecto = key;
            $location.path('/main/' + key);
        }

    }
})();