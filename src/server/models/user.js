(function () {

    'use strict';

    var DMod = require('dmod');
    var table = DMod.Table('User')
        .autoIncrementField('id')
        .field('name')
        .field('service')
        .field('ref');

    module.exports = table;

}());
