(function () {
    'use strict';

    angular.module('acFactory', ['ngRoute'])
        .factory('FireService', FireService)
        .service('FireVars', FireVars);


    FireService.$inject = ['FireVars', '_FIREREF', '$firebaseObject', '$firebaseArray'];
    function FireService(FireVars, _FIREREF, $firebaseObject, $firebaseArray) {
        var service = this;
        service.createObjectRef = createObjectRef;
        service.createArrayRef = createArrayRef;
        service.init = init;
        service.cacheFactory = cacheFactory;
        service.bindTo = bindTo;
        service.getIndex = getIndex;
        service.formatObj = formatObj;
        service.getUserData = getUserData;
        service.generatePushId = generatePushId;

        return service;

        function init() {

            FireVars._FIREREF = new Firebase(_FIREREF);
        }

        function cacheFactory(ref) {
            var _strCache = ref.path.u[0].toLowerCase();
            var _cache = {};

            if (!FireVars.hasOwnProperty('_cache_' + _strCache)) {
                FireVars['_cache_' + _strCache] = {};
            }

            _cache = FireVars['_cache_' + _strCache];


            _cache.$load = function (_id) {
                var _response = [];
                var ids = (Object.getOwnPropertyNames(_id));

                for (var i = 0; i < ids.length; i++) {

                    if (!_cache.hasOwnProperty(ids[i])) {
                        _cache[ids[i]] = $firebaseObject(ref.child(ids[i]));
                    }
                }

                // Devuelve solos los que pertenecen a ese objeto
                for (var i = 0; i < ids.length; i++) {
                    _response.push(_cache[ids[i]]);
                }
                return _response;
            };
            _cache.$dispose = function () {
                angular.forEach(_cache, function (elem) {
                    elem.$off();
                });
            };
            return _cache;
        }

        function getIndex(key, array) {
            for (var i = 0; i < array.length; i++) {
                if (array[i].$id == key) {
                    return i;
                }
            }
        }

        function getUserData() {
            var ref = FireVars._FIREREF;
            return ref.getAuth();
        }

        /**
         * @description formatea objetos que tienen una relación one-to-many, los que son one-to-one los deja igual
         *
         * @param obj
         * @returns {*}
         */
        function formatObj(obj) {
            var props = Object.getOwnPropertyNames(obj);

            for (var i = 0; i < props.length; i++) {
                if (obj[props[i]] != null && obj[props[i]].hasOwnProperty('$id')) {
                    var key = obj[props[i]].$id;
                    obj[props[i]] = {};
                    obj[props[i]][key] = true;
                }
            }

            return obj;
        }


        /**
         *
         * @param FireObj String del tipo 'nombreController.nombreVar'
         * @param scope
         * @returns {*}
         */
        function bindTo(scope, FireObj) {
            return FireObj.$bindTo(scope, FireObj);
        }

        function createObjectRef(ref) {
            return $firebaseObject(ref);
        }

        function createArrayRef(ref, orderBy, startAt, endAt) {
            if (orderBy == undefined) {
                // Trae solo los activos
                //var filtered = ref.orderByChild('status').startAt(1).endAt(1);
                //return $firebaseArray(filtered);
                return $firebaseArray(ref);
            } else {
                // Filtra por otras cosas
                var filtered = ref.orderByChild(orderBy).startAt(startAt).endAt(endAt);
                return $firebaseArray(filtered);
            }
        }

        /**
         * Fancy ID generator that creates 20-character string identifiers with the following properties:
         *
         * 1. They're based on timestamp so that they sort *after* any existing ids.
         * 2. They contain 72-bits of random data after the timestamp so that IDs won't collide with other clients' IDs.
         * 3. They sort *lexicographically* (so the timestamp is converted to characters that will sort properly).
         * 4. They're monotonically increasing.  Even if you generate more than one in the same timestamp, the
         *    latter ones will sort after the former ones.  We do this by using the previous random bits
         *    but "incrementing" them by 1 (only in the case of a timestamp collision).
         */
        function generatePushId() {
            // Modeled after base64 web-safe chars, but ordered by ASCII.
            var PUSH_CHARS = '-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz';

            // Timestamp of last push, used to prevent local collisions if you push twice in one ms.
            var lastPushTime = 0;

            // We generate 72-bits of randomness which get turned into 12 characters and appended to the
            // timestamp to prevent collisions with other clients.  We store the last characters we
            // generated because in the event of a collision, we'll use those same characters except
            // "incremented" by one.
            var lastRandChars = [];

            var now = new Date().getTime();
            var duplicateTime = (now === lastPushTime);
            lastPushTime = now;

            var timeStampChars = new Array(8);
            for (var i = 7; i >= 0; i--) {
                timeStampChars[i] = PUSH_CHARS.charAt(now % 64);
                // NOTE: Can't use << here because javascript will convert to int and lose the upper bits.
                now = Math.floor(now / 64);
            }
            if (now !== 0) throw new Error('We should have converted the entire timestamp.');

            var id = timeStampChars.join('');

            if (!duplicateTime) {
                for (i = 0; i < 12; i++) {
                    lastRandChars[i] = Math.floor(Math.random() * 64);
                }
            } else {
                // If the timestamp hasn't changed since last push, use the same random number, except incremented by 1.
                for (i = 11; i >= 0 && lastRandChars[i] === 63; i--) {
                    lastRandChars[i] = 0;
                }
                lastRandChars[i]++;
            }
            for (i = 0; i < 12; i++) {
                id += PUSH_CHARS.charAt(lastRandChars[i]);
            }
            if (id.length != 20) throw new Error('Length should be 20.');

            return id;
        }
    }

    FireVars.$inject = [];
    function FireVars() {

        this._FIREREF = {};

    }

})();

/**
 * Created by QTI on 26/2/2016.
 */
