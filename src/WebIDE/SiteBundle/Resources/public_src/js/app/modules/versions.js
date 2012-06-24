define(["app/webide","use!backbone", "app/modules/modals", "jquery", "jqueryui"],

    function (webide, Backbone, Modals) {
        // Create a new module
        var Versions = webide.module(),
            app = webide.app;

        Versions.Model = Backbone.Model.extend({
            defaults:{
                name: 0
            }
        });

        Versions.Collection = Backbone.Collection.extend({
            model: Versions.Model,

            initialize: function() {
                var that = this;
            }
        });

        // Required, return the module for AMD compliance
        return Versions;
    });