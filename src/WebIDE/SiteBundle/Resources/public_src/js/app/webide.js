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

            html: function(root, el) {
                console.log($(root), el);
                $(root).html(el);
            },

            render: function (template, context) {
                return Handlebars.compile(template)(context);
            },

            fetch: function(name) {
                var path = name + ".hbs";
                var done = this.async();

                return Templating.fetch(path, done);
            }
        });

        return {
            layouts: {},
            layout: null,

            // Create a custom object with a nested Views object
            module:function (additionalProps) {
                return _.extend({ Views:{} }, additionalProps);
            },

            createLayout: function(name, options) {
                return this.layouts[name] = new Backbone.Layout(_.extend({
                    template: name,
                    className: "layout layout_" + name
                }, options));
            },

            useLayout:function (name) {
                if(this.layouts[name]) {
                    this.layout = this.layouts[name];
                } else {
                    this.layout  = this.createLayout(name);
                }

                return this.layout;
            },

            // Keep active application instances namespaced under an app object.
            app:_.extend({}, Backbone.Events)
        };
    });
