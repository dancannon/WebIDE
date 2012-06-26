define(["app/webide","use!backbone", "app/modules/project", "app/modules/files"],

function (webide, Backbone, Project, Files) {
    // Create a new module
    var App = webide.module(),
        app = webide.app;

    App.Views.NewProjectView = Backbone.View.extend({
        template: "app/new_project",
        className: "container-small",
        keep: true,

        events: {
            "submit form": "submit"
        },

        initialize: function() {
            this.collection = new Project.RecentProjects();
            this.collection.fetch();

            this.collection.on("fetch reset", function() {
                this.render();
            }, this);
        },

        serialize: function() {
            return {
                projects: this.collection.toJSON(),
                num_projects: this.collection.length,
                project_id: typeof app.project !== "undefined" ? app.project.id : null
            };
        },

        submit: function(event) {
            event.preventDefault();

            var project, type = this.$el.find("#project_type").val();

            switch(type) {
                case "1":
                    project = new Project.Model();
                    break;
                case "2":
                    project = new Project.Model({
                        files: new Files.Collection([
                            new Files.Model({name: "index.html", type: "html", selected:true}),
                            new Files.Model({name: "style.css", type: "css", selected:true}),
                            new Files.Model({name: "script.js", type: "javascript", selected:true})
                        ])
                    });
                    break;
                default:
                    app.trigger("application:notify", {
                        type: "error",
                        message: "Invalid type."
                    });

                    return false;
            }

            project.save().success(function() {
                app.router.navigate('/' + project.id, {
                    trigger: true
                });
            });
        }
    });

    App.Views.ProjectListItem = Backbone.View.extend({
        tagName: "li",
        template: "app/projectlistitem",

        serialize: function() {
            return this.model.toJSON();
        }
    });

    return App;
});