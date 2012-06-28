//require.config({
//    paths: {
//        // JavaScript folders
//        vendors: "vendors",
//        plugins: "plugins",
//
//        // Libraries
//        jquery: "vendors/jquery",
//        underscore: "vendors/underscore",
//        backbone: "vendors/backbone",
//        bootstrap: "vendors/bootstrap",
//        handlebars: "vendors/handlebars",
//        codemirror: "vendors/codemirror",
//        jqueryui: "vendors/jqueryui",
//        moment: "vendors/moment",
//
//        // Modes
//        cm_html: "vendors/cm_modes/html/html",
//        cm_xml: "vendors/cm_modes/xml/xml",
//        cm_css: "vendors/cm_modes/css/css",
//        cm_js: "vendors/cm_modes/javascript/javascript",
//
//        // Shim Plugin
//        use: "vendors/use"
//    },
//
//    use: {
//        "templates": {
//            deps: ["use!handlebars"]
//        },
//        backbone: {
//            deps: ["use!underscore", "use!handlebars", "jquery"],
//            attach: "Backbone"
//        },
//        "plugins/jquery.easing": {
//            deps: ["jquery"]
//        },
//        "plugins/jquery.ui.position": {
//            deps: ["jquery"]
//        },
//        "plugins/jquery.screenfull": {
//            deps: ["jquery"]
//        },
//        "plugins/jquery.noty": {
//            deps: ["jquery"]
//        },
//        "plugins/backbone.layoutmanager": {
//            deps: ["use!backbone"]
//        },
//        "plugins/backbone.localstorage": {
//            deps: ["use!backbone"]
//        },
//        "plugins/backbone.relational": {
//            deps: ["use!backbone"]
//        },
//        "bootstrap": {
//            deps: ["jquery"]
//        },
//        underscore: {
//            attach: "_"
//        },
//        handlebars: {
//            attach: "Handlebars"
//        },
//        codemirror: {
//            attach: "CodeMirror"
//        },
//
//        /** CodeMirror Modes **/
//        "cm_xml": {
//            deps: ["use!codemirror"]
//        },
//        "cm_css": {
//            deps: ["use!codemirror"]
//        },
//        "cm_js": {
//            deps: ["use!codemirror"]
//        },
//        "cm_html": {
//            deps: ["use!codemirror", "use!cm_xml", "use!cm_css", "use!cm_js"]
//        },
//        moment: {
//            attach: "moment"
//        },
//
//        /** CodeMirror addons **/
//        "plugins/cm.foldcode": {
//            deps: ["use!codemirror"]
//        }
//    }
//});
require(["app/webide",

// Libs
"jquery", "use!backbone", "use!underscore",

// Modules
"app/modules/app", "app/modules/header", "app/modules/sidebar", "app/modules/editor", "app/modules/footer", "app/modules/files", "app/modules/project", "app/modules/modals",

// Plugins
"use!plugins/jquery.noty"],

function(webide, $, Backbone, _, App, Header, Sidebar, Editor, Footer, Files, Project, Modals) {
    // Shorthand the application namespace
    window.webide = webide;
    var app = webide.app;

    // Defining the application router, you can attach sub routers here.
    var Router = Backbone.Router.extend({
        routes: {
            "": "index",
            ":id": "view",
            ":version/:id": "viewVersion",
            "preview": "preview",
            ":id/preview": "preview",
            "*error": "error404"
        },

        // Application constructor. Run on every route, defines global events
        initialize: function() {
            app.project = new Project.Model();

            app.on("application:notify", function(args) {
                var options = _.extend({
                    "layout": "bottomRight",
                    "theme": "noty_theme_twitter",
                    "timeout": 3000
                }, args, {});

                $.noty(options);
            });

            $(document).ajaxStart(function() {
                $(".loading").fadeIn();
            }).ajaxComplete(function(xhr) {
                $(".loading").fadeOut();
            }).ajaxError(function(e, xhr, settings) {
                if (xhr.status === 401) {
                    app.trigger("application:notify", {
                        text: "You are not logged in",
                        type: "error",
                        layout: "top",
                        closeOnSelfClick: false,
                        timeout: false,
                        modal: true,
                        buttons: [{
                            text: 'Click here to log in',
                            type: "btn",
                            click: function($noty) {
                                window.location = globals.baseUrl + '/login';

                                $noty.close();
                            }
                        }]
                    });
                }
                if (xhr.status === 403) {
                    app.trigger("application:notify", {
                        text: "You are not allowed to view this page",
                        type: "error",
                        layout: "top",
                        closeOnSelfClick: false,
                        timeout: false,
                        modal: true,
                        buttons: [{
                            text: 'Return to homepage',
                            type: "btn",
                            click: function($noty) {
                                app.router.navigate("/", {
                                    trigger: true
                                });

                                $noty.close();
                            }
                        }]
                    });
                }
            });

            app.on("app:save", function() {
                if (app.project.has('current_version')) {
                    app.router.navigate('/' + app.project.id + '/' + app.project.get('current_version'));
                }
            });

            app.on("file:create", function(args) {
                if (!app.project.get("files").any(function(file) {
                    return (file.get('name') === args.name) && (file.get('type') === args.type);
                })) {
                    args.project = app.project;
                    args.selected = true;

                   var currSelected = app.project.get('files').getSelected(args.type);
                   if(currSelected) {
                        currSelected.set("selected", false);
                   }

                   // args.selected = true;
                    var newfile = app.project.get("files").create(args);

                    app.trigger("file:select", {
                        file: newfile,
                        type: newfile.get("type")
                    });

                } else {
                    app.trigger("application:notify", {
                        text: "A file already exists with that name",
                        type: "error"
                    });
                }
            });
            app.on("file:import", function(args) {
                if (!app.project.get("files").any(function(file) {
                    return (file.get('name') === args.name) && (file.get('type') === args.type);
                })) {
                    //Load file
                    $.getJSON('/resource/' + encodeURI(args.url)).success(function(data) {
                        args.project = app.project;
                        args.resource = args.url;
                        args.content = data.content;

                        var newfile = app.project.get("files").create(args);

                        app.project.get('files').map(function(file) {
                            if (file.get("type") === newfile.get("type") && file !== newfile) {
                                file.set("selected", false);
                            }
                        });

                        app.trigger("file:select", {
                            file: newfile,
                            type: newfile.get("type")
                        });
                    }).error(function(data) {
                        app.trigger("application:notify", {
                            message: data.message,
                            type: "error"
                        });
                    });
                } else {
                    app.trigger("application:notify", {
                        text: "A file already exists with that name",
                        type: "error"
                    });
                }
            });
        },

        index: function() {
            var layout = webide.useLayout("new_project");
            layout.setViews({
                "#main": [new App.Views.NewProjectView()]
            });
            $("#container").html(layout.el);
            layout.render();
        },

        view: function(id) {
            app.project.set({
                id: id
            });

            var layout = webide.useLayout("workspace");
            layout.setViews({
                "#header": new Header.Views.Main(),
                "#sidebar": new Sidebar.Views.Main(),
                "#workspace": new Editor.Views.Main(),
                "#footer": new Footer.Views.Main(),
                "#modals": [new Modals.Views.NewFile(), new Modals.Views.ImportFile(), new Modals.Views.RenameFile(), new Modals.Views.DeleteFile(), new Modals.Views.HtmlConfig()]
            });

            $("#container").html(layout.el);
            layout.render();

            app.project.fetch().error(function(resp) {
                if (resp.status === 404) {
                    app.trigger("application:notify", {
                        text: "That project could not be found",
                        type: "error",
                        layout: "top"
                    });
                    app.router.navigate('/', {
                        trigger: true
                    });
                }
            });
        },

        viewVersion: function(id, version) {
            app.project.set({
                id: id,
                current_version: version
            });

            var layout = webide.useLayout("workspace");
            layout.setViews({
                "#header": new Header.Views.Main(),
                "#sidebar": new Sidebar.Views.Main(),
                "#workspace": new Editor.Views.Main(),
                "#footer": new Footer.Views.Main(),
                "#modals": [new Modals.Views.NewFile(), new Modals.Views.ImportFile(), new Modals.Views.RenameFile(), new Modals.Views.DeleteFile(), new Modals.Views.HtmlConfig()]
            });
            $("#container").html(layout.el);
            layout.render().then(function() {
                // Trigger application events
                app.trigger("application:init");
            });

            app.project.fetch({
                url: globals.baseUrl + '/projects/' + id + '/' + version
            }).error(function(resp) {
                if (resp.status === 404) {
                    app.trigger("application:notify", {
                        text: "That project could not be found",
                        type: "error",
                        layout: "top"
                    });
                    app.router.navigate('/', {
                        trigger: true
                    });
                }
            });
        },

        preview: function() {
            $("body").html("");
        },

        error404: function() {
            $("body").html("<h1>404 Page Not Found</h1>");
        }
    });

    app.showModal = function(id, options) {
        var modal = webide.layout.getView(function(view) {
            return $(view.el).attr('id') === id;
        });

        if (modal) {
            window.modal = modal;
        } else {
            return false;
        }
    };

    $(function() {
        app.router = new Router();

        Backbone.history.start({
            pushState: true,
            root: globals.baseUrl + "/"
        });
    });

    $(document).on("click", "a:not([data-bypass])", function(evt) {
        var href = $(this).attr("href");
        var protocol = this.protocol + "//";

        if (href && href.slice(0, protocol.length) !== protocol && href.indexOf("javascript:") !== 0 && href !== "#") {
            evt.preventDefault();
            Backbone.history.navigate(href, true);
        }
    });

});