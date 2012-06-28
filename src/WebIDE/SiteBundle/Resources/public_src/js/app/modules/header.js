define(["app/webide","use!backbone","app/modules/modals","app/modules/versions"],

    function(webide, Backbone, Modals, Versions) {

        // Create a new module
        var Header = webide.module(),
            app = webide.app;

        /** Views **/
        Header.Views.Menu = Backbone.View.extend({
            template: "header/menu",
            keep: true,

            events: {
                "click .switch_project": "switch_project",
                "click .new": "new_file",
                "click .import": "import_file",
                "click .run": "run",
                "click .save": "save",
                "click .new_version": "new_version",
                "click .download": "download"
            },

            initialize: function() {
                app.project.on("change reset", function() {
                    this.render();
                }, this);
            },

            serialize: function() {
                return {
                    project: app.project.toJSON(),
                    versions: app.project.get("versions").toJSON()
                };
            },

            switch_project: function() {
                app.project.save();
                app.router.navigate('/', {
                    trigger: true
                });
            },
            new_file: function() {
                $("#new_file").modal('show');
            },
            import_file: function() {
                $("#import_file").modal('show');
            },
            run: function() {
                app.trigger("app:run");
            },
            save: function() {
                app.project.save().success(function() {
                    app.trigger("app:save");
                    app.trigger("app:reload");
                });
            },
            new_version: function() {
                var  id = app.project.id;
                app.project.fetch({
                    url: globals.baseUrl + '/projects/' + id + '/version'
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
                }).success(function(resp) {
                    var version = app.project.get('version').get('version_number');
                    app.router.navigate('/' + id + '/' + version, {
                        trigger: true
                   });
                });
            },
            download: function() {
                app.trigger("application:notify", {
                    text: "This feature is currently not active",
                    type: "information",
                    layout: "top"
                });
                //TODO: Fix
//                app.router.navigate("projects/" + webide.app.project.id + "/download", {trigger: false});
            },

            render: function(manage) {
                return manage(this).render();
            }
        });
        // This will fetch the tutorial template and render it.
        Header.Views.Main = Backbone.View.extend({
            template: "header/header",
            keep: true,

            initialize: function() {
                this.setViews({
                    "#menu": new Header.Views.Menu()
                });
            }
        });

        // Required, return the module for AMD compliance
        return Header;

    });