(function () {

    'use strict';

    module.exports = modelBuilder;

    function modelBuilder (properties) {

        var DataModel = require('dmod');

        var models = require('readdir').readSync(__dirname, ['*.js'])
            .filter(function (model) {
                return model !== 'index.js';
            })
            .map(function(model) {
                return require('./' + model);
            });

        var dataModel = new DataModel(new DataModel.adapters.SQLite(properties.get('data.path')));
        dataModel.register(models);

        return dataModel;
    }

}());
