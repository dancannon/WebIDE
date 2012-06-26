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
            files: ['grunt.js', 'public_src/js/app.js', 'public_src/js/app/*.js', 'public_src/test/**/*.js']
        },

        clean: {
            build: ["../../../../web/img", "../../../../web/css", "../../../../web/js"],
            prod: []
        },

        copy: {
            dist_fonts: {
                src: [
                    "public_src/font/**/*"
                ],
                strip: /^public_src\/font\//,
                dest: "../../../../web/font/"
            },
            dist_img: {
                src: [
                    "public_src/img/**/*"
                ],
                strip: /^public_src\/img\//,
                dest: "../../../../web/img/"
            },
            dist_js: {
                src: [
                    "public_src/js/vendors/require.js"
                ],
                strip: /^public_src\/js\/vendors\//,
                dest: "../../../../web/js/"
            },
            dist_templates: {
                src: [
                    "public_src/js/app/templates/**/*.hbs"
                ],
                strip: /^public_src\//,
                dest: "../../../../web/"
            }
        },

        handlebars: {
            'public_src/js/templates.js': [
                "public_src/js/templates/*.hbs"
            ]
        },

        requirejs: {
            baseUrl: 'public_src/js/',
            optimize: "none",

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
                "plugins/jquery.easing": {
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
                "plugins/backbone.layoutmanager": {
                    deps: ["use!backbone"]
                },
                "plugins/backbone.localstorage": {
                    deps: ["use!backbone"]
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
            },

            name: "app/main",
            out: 'public_src/js/app-built.js'
        },

        concat: {
            dist: {
                src: ['public_src/js/app-built.js', 'public_src/js/templates.js'],
                dest: '../../../../web/js/app.js'
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
                src: ['<config:concat.dist.dest>'],
                dest: '../../../../web/js/app.js'
            },
            require: {
                src: ['public_src/js/vendors/almond.js'],
                dest: '../../../../web/js/require.js'
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
    grunt.registerTask("build", "lint clean:build requirejs concat less copy");
    grunt.registerTask("release", "lint clean:build handlebars requirejs concat less copy min mincss clean:prod");

    grunt.registerTask("default", "build");

};
