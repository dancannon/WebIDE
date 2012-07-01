/*global module:false*/
var exec = require('child_process').exec;

module.exports = function (grunt) {
    grunt.registerTask('notifyBuildComplete', function() {
        exec('notify-send "Grunt" "Build Complete"');
    });

    grunt.initConfig({
        options: {
            handlebars: {
                namespace: "this['JST']"
            },
            less: {
                paths: ['public_src/less/']
            }
        },

        lint: {
            files: ['grunt.js', 'public_src/js/app/**/*.js']
        },

        clean: {
            build: ["../../../../web/img", "../../../../web/css", "../../../../web/js"],
            prod: []
        },

        copy: {
            dev: {
                src: [
                    "public_src/font/**/*",
                    "public_src/img/**/*",
                    "public_src/js/**/*"
                ],
                strip: /^public_src\//,
                dest: "../../../../web/"
            },
            prod: {
                src: [
                    "public_src/font/**/*",
                    "public_src/img/**/*",
                    "public_src/js/app/templates/**/*.hbs",
                    "public_src/js/vendors/require.js"
                ],
                strip: /^public_src\//,
                dest: "../../../../web/"
            }
        },

        requirejs: {
            compile: {
                options: {
                    baseUrl: 'public_src/js/',
                    optimize: "none",
                    name: 'app/main',
                    out: '../../../../web/js/app/main.js',

                    paths: {
                        // JavaScript folders
                        vendors: "vendors",
                        plugins: "plugins",

                        // Libraries
                        jquery: "vendors/jquery",
                        underscore: "vendors/underscore",
                        backbone: "vendors/backbone",
                        bootstrap: "vendors/bootstrap",
                        handlebars: "vendors/handlebars",
                        codemirror: "vendors/codemirror",
                        jqueryui: "vendors/jqueryui",
                        moment: "vendors/moment",
                        keymaster: "vendors/keymaster",

                        // Modes
                        cm_html: "vendors/cm_modes/html/html",
                        cm_xml: "vendors/cm_modes/xml/xml",
                        cm_css: "vendors/cm_modes/css/css",
                        cm_js: "vendors/cm_modes/javascript/javascript",

                        // Shim Plugin
                        use: "vendors/use"
                    },

                    use: {
                        "templates": {
                            deps: ["use!handlebars"]
                        },
                        backbone: {
                            deps: ["use!underscore", "use!handlebars", "jquery"],
                            attach: "Backbone"
                        },
                        "plugins/jquery.validate": {
                            deps: ["jquery"]
                        },
                        "plugins/jquery.ui.position": {
                            deps: ["jquery"]
                        },
                        "plugins/jquery.screenfull": {
                            deps: ["jquery"]
                        },
                        "plugins/jquery.noty": {
                            deps: ["jquery"]
                        },
                        "plugins/jquery.timeago": {
                            deps: ["jquery"]
                        },
                        "plugins/backbone.layoutmanager": {
                            deps: ["use!backbone"]
                        },
                        "plugins/backbone.offline": {
                            deps: ["use!backbone"],
                            attach: "Offline"
                        },
                        "plugins/backbone.relational": {
                            deps: ["use!backbone"]
                        },
                        "bootstrap": {
                            deps: ["jquery"]
                        },
                        underscore: {
                            attach: "_"
                        },
                        handlebars: {
                            attach: "Handlebars"
                        },
                        codemirror: {
                            attach: "CodeMirror"
                        },
                        keymaster: {
                            attach: "key"
                        },

                        /** CodeMirror Modes **/
                        "cm_xml": {
                            deps: ["use!codemirror"]
                        },
                        "cm_css": {
                            deps: ["use!codemirror"]
                        },
                        "cm_js": {
                            deps: ["use!codemirror"]
                        },
                        "cm_html": {
                            deps: ["use!codemirror", "use!cm_xml", "use!cm_css", "use!cm_js"]
                        },
                        moment: {
                            attach: "moment"
                        },

                        /** CodeMirror addons **/
                        "plugins/cm.foldcode": {
                            deps: ["use!codemirror"]
                        }
                    }
                }
            }
        },

        uglify: {},

        jshint: {
            options: {
                curly: true,
                eqeqeq: true,
                immed: true,
                latedef: true,
                newcap: true,
                noarg: true,
                sub: true,
                undef: true,
                boss: true,
                eqnull: true,
                browser: true,
                devel: true,
                jquery: true,
                scripturl:true
            },
            globals: {
                Routing: true,
                globals: true,
                require: true,
                define: true
            }
        },

        less: {
            compile: {
                files: {
                    '../../../../web/css/style.css': 'public_src/less/style.less'
                }
            }
        },

        min: {
            app: {
                src: ['../../../../web/js/app.js'],
                dest: '../../../../web/js/app.js'
            },
            require: {
                src: ['../../../../web/js/vendors/require.js'],
                dest: '../../../../web/js/vendors/require.js'
            }
        },

        mincss: {
            '../../../../web/css/style.css': '../../../../web/css/style.css'
        },

        watch: {
            build: {
                files: ['public_src/js/app.js', 'public_src/js/app/**/*.js', 'public_src/js/app/templates/**/*.hbs', 'public_src/less/**/*.less'],
                tasks: "build notifyBuildComplete"
            }
        }
    });


    grunt.loadNpmTasks('grunt-requirejs');
    grunt.loadNpmTasks('grunt-contrib');

    grunt.loadTasks('tasks');


    grunt.registerTask("test", "lint");
    grunt.registerTask("build", "lint clean:build less copy:dev");
    grunt.registerTask("release", "lint clean:build requirejs less copy:prod min mincss clean:prod");

    grunt.registerTask("default", "build");

};
