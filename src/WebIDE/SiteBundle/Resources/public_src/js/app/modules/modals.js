define(["app/webide","use!backbone", "jquery", "jqueryui", "use!bootstrap", "use!plugins/jquery.validate"],

function(webide, Backbone) {

	// Create a new module
	var Modals = webide.module(),
        app = webide.app;


	/** Views **/
    Modals.Views.Modal = Backbone.View.extend({
        className: "modal hide",
        modal: null,
        keep: true,

        events: {
            "click #cancel": "cancel",
            "submit form": "submit"
        },

        serialize: function() {
            return {};
        },

        render: function(manage) {
            var that = this;

            return manage(this).render().then(function(el) {
                this.modal = $(el).modal({
                    show: false
                });

                this.modal.on('hide', function() {
                    $(document).off('keypress.modal');
                    $(':input', el).not(':button, :submit, :reset').val('').removeAttr('checked').removeAttr('selected');

                });

                this.postRender(el);
            });
        },

        postRender: function(el) {

        },

        cancel: function() {
            this.$el.modal("hide");
        },

        submit: function() {
            this.$el.modal("hide");
            return false;
        },

        close: function(event) {
            this.remove();
        }
    });

    Modals.Views.NewFile = Modals.Views.Modal.extend({
        id: "new_file",
		template: "modals/new_file",

        serialize: function() {
            return {
                type: this.options.type
            };
        },

        submit: function() {
            app.trigger("file:create", {
                name: this.$el.find("#filename").val(),
                type: this.$el.find("#filetype").val(),
                content: ""
            });

            //After creating new file hide modal
            this.$el.modal("hide");
            return false;
        },

        postRender: function(el) {
            var that = this;

            $('form', el).validate({
                errorElement: "span",
                errorClass: "help-inline",
                highlight: function(label) {
                    $(label).closest('.control-group').addClass('error').removeClass('success');
                },
                unhighlight: function(label) {
                    $(label).closest('.control-group').removeClass('error');
                },
                success: function(label) {
                    label.closest('.control-group').addClass('success');
                }
            });
        }
	});

    Modals.Views.ImportFile = Modals.Views.Modal.extend({
        id: "import_file",
		template: "modals/import_file",

        serialize: function() {
            return {
                type: this.options.type
            };
        },

        submit: function(event) {
            //Load file content using ajax + server side script

            var url = this.$el.find("#fileurl").val();
            var filename = url.substring(url.lastIndexOf('/')+1);

            app.trigger("file:import", {
                name: filename,
                url: url,
                type: this.$el.find("#filetype").val(),
                content: ""
            });

            //After creating new file hide modal
            this.$el.modal("hide");
            return false;
        },

        postRender: function(el) {
            $('form', el).validate({
                errorElement: "span",
                errorClass: "help-inline",
                highlight: function(label) {
                    $(label).closest('.control-group').addClass('error').removeClass('success');
                },
                unhighlight: function(label) {
                    $(label).closest('.control-group').removeClass('error');
                },
                success: function(label) {
                    label.closest('.control-group').addClass('success');
                }
            });
        }
	});

    Modals.Views.RenameFile = Modals.Views.Modal.extend({
        id: "rename_file",
        template: "modals/rename",

        submit: function() {
            var model = app.project.get('files').getByCid(this.$el.find('#cid').val());

            if(model) {
                model.set({
                    name: this.$el.find("#filename").val()
                });
            }

            this.$el.modal("hide");
            return false;
        },

        postRender: function(el) {
            $('form', el).validate({
                errorElement: "span",
                errorClass: "help-inline",
                highlight: function(label) {
                    $(label).closest('.control-group').addClass('error').removeClass('success');
                },
                unhighlight: function(label) {
                    $(label).closest('.control-group').removeClass('error');
                },
                success: function(label) {
                    label.closest('.control-group').addClass('success');
                }
            });
        }
    });

    Modals.Views.Confirm = Modals.Views.Modal.extend({
        postRender: function(el) {
            var that = this;

            this.modal.on('show', function() {
                $(document).on('keypress.modal', function(e) {
                    if(e.which === 13) {
                        that.submit();
                    }
                });
            });
        }
    });

    Modals.Views.DeleteFile = Modals.Views.Confirm.extend({
        id: "delete_file",
        template: "modals/delete_file",

        submit: function() {
            var model = app.project.get('files').getByCid(this.$el.find('#cid').val());

            if(model) {
                model.destroy();
            }

            //After creating new file hide modal
            this.$el.modal("hide");
            return false;
        }
    });

    Modals.Views.DeleteProject = Modals.Views.Confirm.extend({
        id: "delete_project",
        template: "modals/delete_project",

        submit: function() {
            this.$el.modal("hide");
            app.project.destroy();
            app.router.navigate("/", {
                trigger: true
            });

            return false;
        }
    });

    Modals.Views.Settings = Modals.Views.Modal.extend({
        id: "settings",
        template: "modals/settings",

        events: {
            "click #cancel": "cancel",
            "submit form": "submit",
            "click #delete": "delete_project"
        },

        serialize: function() {
            return {
                name: app.project.get("name"),
                description: app.project.get("description")
            };
        },

        submit: function() {
            app.project.save({
                name: this.$("#name").val(),
                description: this.$("#description").val()
            });

            this.$el.modal("hide");
            return false;
        },

        delete_project: function() {
            this.$el.modal("hide");
            $("#delete_project").modal('show');
        },

        postRender: function(el) {
            $('form', el).validate({
                errorElement: "span",
                errorClass: "help-inline",
                highlight: function(label) {
                    $(label).closest('.control-group').addClass('error').removeClass('success');
                },
                unhighlight: function(label) {
                    $(label).closest('.control-group').removeClass('error');
                },
                success: function(label) {
                    label.closest('.control-group').addClass('success');
                }
            });
        }
    });

    Modals.Views.List = Backbone.View.extend({
        tagName: "ul",
        keep: true,

        initialize: function() {
            app.project.get("files").on("add remove change reset", function() {
                this.render();
            }, this);
        },

        render: function(manage) {
            var that = this;

            // Iterate over the passed collection and create a view for each item.
            app.project.get("files").ofType(this.options.type, function(model) {
                that.insertView(new Modals.Views.ListItem({
                    model: model
                }));
            });

            return manage(this).render().then(function(el) {
                $(el).sortable();
            });
        }
    });

    Modals.Views.ListItem = Backbone.View.extend({
        tagName: "li",
        template: "files/listitem",

        serialize: function() {
            return this.model.toJSON();
        }
    });

	// Required, return the module for AMD compliance
	return Modals;
});