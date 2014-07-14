(function () {

    'use strict';

    var DMod = require('dmod');
    var table = DMod.Table('Login')
        .autoIncrementField('id')
        .field('username')
        .field('password')
        .uniqueConstraint('username');

    module.exports = table;

}());
