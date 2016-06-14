(function () {
    'use strict';

    angular.module('Model', [])
        .factory('Model', Model);

    Model.$inject = ['FireVars'];
    /**
     * @description Modelo de datos de la aplicación
     * @returns {Model}
     * @constructor
     */
    function Model(FireVars) {

        var factory = this;

        factory.refProyectos = FireVars._FIREREF.child('/proyectos/');

        factory.refUsuarios = FireVars._FIREREF.child('/usuarios/');

        return factory;
    }

})();

/**
 * Created by QTI on 26/2/2016.
 */
