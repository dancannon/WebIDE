define([
    // Libs
    "jquery",
    "use!underscore",
    "use!backbone",
    "use!handlebars",
    "app/templating",
    "use!plugins/backbone.layoutmanager"
],

    function ($, _, Backbone, Handlebars, Templating) {
        Backbone.LayoutManager.configure({
            paths:{
                layout: "/js/app/templates/layouts/",
                template: "/js/app/templates/"
            },

            render: function (template, context) {
                return template(context);
            },

            fetch: function(name) {
                var path = name + ".hbs";
                var done = this.async();

                return Templating.fetch(path, done);
            }
        });

        return {
            // Create a custom object with a nested Views object
            module:function (additionalProps) {
                return _.extend({ Views:{} }, additionalProps);
            },

            useLayout:function (name) {
                // If there is an existing layout and its the current one, return it.
                if (this.layout && this.layout.options.template === name) {
                    return this.layout;
                }


                // Create the new layout and set it as current.
                this.layout = new Backbone.Layout({
                    template: name,
                    className: "layout layout_" + name
                });

                return this.layout;
            },

            // Keep active application instances namespaced under an app object.
            app:_.extend({}, Backbone.Events)
        };
    });
