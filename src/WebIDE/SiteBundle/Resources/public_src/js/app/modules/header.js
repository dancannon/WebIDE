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
                "click .settings": "settings",
                "click .download": "download"
            },

            initialize: function() {
                app.project.on("change reset", this.render, this);
            },

            serialize: function() {
                return {
                    read_only: app.project.get('read_only'),
                    project: app.project.toJSON(),
                    versions: app.project.get("versions").toJSON()
                };
            },

            switch_project: function() {
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
                app.trigger("run");
            },
            save: function() {
                app.trigger("save");
            },
            new_version: function() {
                app.trigger("new_version");
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

            settings: function() {
                $("#settings").modal('show');
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