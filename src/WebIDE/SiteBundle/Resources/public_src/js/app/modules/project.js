define(["app/webide", "use!backbone", "app/modules/files", "app/modules/versions", "use!plugins/backbone.relational"],

    function (webide, Backbone, Files, Versions, Offline) {

        // Create a new module
        var Project = webide.module(),
            app = webide.app;

        Project.Model = Backbone.RelationalModel.extend({
            defaults:{
                id:null,
                name:"",
                description:"",
                hash:""
            },

            relations:[
                {
                    type:Backbone.HasMany,
                    key:'files',
                    relatedModel:Files.Model,
                    collectionType:Files.Collection,
                    reverseRelation:{
                        key:'project',
                        includeInJSON:'id'
                    }
                },
                {
                    type:Backbone.HasMany,
                    key:'versions',
                    relatedModel:Versions.Model,
                    collectionType:Versions.Collection,
                    reverseRelation:{
                        key:'project',
                        includeInJSON:'id'
                    }
                }
            ],

            urlRoot:globals.baseUrl + '/projects',

            initialize: function() {
                var that = this;

                app.on("save", function() {
                    that.save().success(function() {
                        if (that.has('current_version')) {
                            app.router.navigate('/' + that.id + '/' + that.get('current_version'));
                        }

                        app.trigger("reload");
                    });
                });
                app.on("new_version", function() {
                    var  id = that.id;
                    that.fetch({
                        url: globals.baseUrl + '/projects/' + id + '/version',
                        error: function(resp) {
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
                        },
                        success: function(resp) {
                            var version = that.get('current_version');
                            app.router.navigate('/' + id + '/' + version, {
                                trigger: true
                            });
                        }
                    });
                });
            }
        });

        Project.RecentProjects = Backbone.Collection.extend({
            model:Project.Model,
            url:globals.baseUrl + '/projects/recent'
        });

        return Project;
    });