define(["app/webide", "use!backbone", "app/modules/files", "app/modules/versions", "use!plugins/backbone.relational"],

    function (webide, Backbone, Files, Versions) {

        // Create a new module
        var Project = webide.module(),
            app = webide.app;

        Project.Model = Backbone.RelationalModel.extend({
            defaults:{
                id: null,
                hash: "",
                created: new Date(),
                updated: new Date()
            },

            relations: [{
                type: Backbone.HasMany,
                key: 'files',
                relatedModel: Files.Model,
                collectionType: Files.Collection,
                reverseRelation: {
                    key: 'project',
                    includeInJSON: 'id'
                }
            },
            {
                type: Backbone.HasOne,
                key: 'version',
                relatedModel: Versions.Model
            },
            {
                type: Backbone.HasMany,
                key: 'versions',
                relatedModel: Versions.Model,
                collectionType: Versions.Collection,
                reverseRelation: {
                    key: 'project',
                    includeInJSON: 'id'
                }
            }],

            urlRoot: globals.baseUrl + '/projects'
        });

        Project.RecentProjects = Backbone.Collection.extend({
            model: Project.Model,
            url: globals.baseUrl + '/projects/recent'
        });

        return Project;
    });