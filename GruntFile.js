module.exports = function (grunt) {

    'use strict';

    grunt.registerTask('dist', 'dist content helper', function () {
        var done = this.async();
        var target = this.args[0];
        var Git = require('simple-git');
        var files = 'dist/*';

        switch (target) {
            case "update":
                grunt.config.merge({
                    pkg: grunt.file.readJSON('package.json')
                });
                done(true);
                break;

            case "purge":
                var git = new Git()
                    .rm(files, function (err) {
                        if (!err) {
                            grunt.log.writeln('No error adding dist files to be removed');
                            git.commit('Remove existing built content', files, function (err) {
                                grunt.log.writeln('Committed removing dist files');
                                if (err) {
                                    grunt.log.warn(err);
                                }
                                done(!err);
                            });
                        }
                        else if (/did not match/.test(err)) {
                            grunt.log.ok('No dist files to remove');
                            done(true);
                        }
                        else {
                            grunt.log.writeln('Got errors removing dist files');
                            grunt.fail.fatal(err);
                        }
                    });
                break;

            case "persist":
                new Git()
                    .add(files)
                    .commit('Adding built content', files, function (err) {
                        if (err) {
                            grunt.log.warn(err);
                        }

                        done(!err);
                    });
                break;

            default:
                grunt.fail.fatal("Unknown target: " + this.name + ":" + target);
        }
    });

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        git: {
            options: {
                message: "Build release <%= pkg.version %>"
            },
            commit: {
                files: [
                    { src: [ 'src/web/release/*.js' ] }
                ]
            }
        },

        release: {
            options: {
                file: 'package.json',
                tagName: '<%= version %>', //default: '<%= version %>'
                commitMessage: 'Release <%= version %>', //default: 'release <%= version %>'
                tagMessage: 'Tag version <%= version %>' //default: 'Version <%= version %>'
            }
        },

        less: {
            development: {
                options: {
                    paths: ['src/web/css', 'src/web/img']
                },
                files: {
                    'dist/<%= pkg.version %>/css/style.css': 'src/web/css/style.less'
                }
            },
            production: {

            }
        },

        copy: {
            main: {
                files: [
                    {
                        expand: true,
                        cwd: 'src/web/',
                        src: ['img/**', 'js/**', '*'],
                        dest: 'dist/<%= pkg.version %>/'
                    }
                ]
            }
        },

        clean: ['dist']
    });

    grunt.loadNpmTasks('grunt-contrib-less');

    grunt.loadNpmTasks('grunt-release-steps');

    grunt.loadNpmTasks('grunt-git');

    grunt.loadNpmTasks('grunt-contrib-copy');

    grunt.loadNpmTasks('grunt-contrib-clean');

    grunt.registerTask('install', ['copy', 'less']);

    // tags the project on the new version and pushes everything to remote
    'minor major patch'.split(' ').forEach(function (revision, typeOnly) {
        var tasks = [
            'dist:purge',
            'clean',
            'release:bump:add:commit:' + revision,
            'dist:update',
            'install',
            'dist:persist',
            'release:push:tag:pushTags'
        ];

        grunt.registerTask('deploy' + (typeOnly ? '-' + revision : ''), tasks);
    });

};
