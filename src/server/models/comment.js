(function () {

    'use strict';

    var DMod = require('dmod');
    var table = DMod.Table('Comment')
        .autoIncrementField('id')
        .field('subject')
        .field('content')
        .field('url')
        .dateTimeField('created')
        .hasOne('User');

    module.exports = table;

}());
