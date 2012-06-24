define(["app/webide", "use!backbone", "app/modules/files", "app/modules/versions"],

    function (webide, Backbone, Files, Versions) {

        // Create a new module
        var Project = webide.module(),
            app = webide.app;

        Project.Model = Backbone.Model.extend({
            defaults:{
                id: null,
                files: new Files.Collection(),
                hash: "",
                version: new Versions.Model(),
                versions: new Versions.Collection(),
                created: new Date(),
                updated: new Date()
            },

            urlRoot: globals.baseUrl + '/projects',

            parse: function(response) {
                response.files = new Files.Collection(response.files);
                response.version = new Versions.Model(response.version);
                response.versions = new Versions.Collection(response.versions);

                return response;
            }
        });

        Project.RecentProjects = Backbone.Collection.extend({
            model: Project.Model,
            url: globals.baseUrl + '/projects/recent'
        });

        return Project;
    });