define(["app/webide","use!backbone", "jquery", "jqueryui", "use!bootstrap"],

function(webide, Backbone, Files) {

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
            "click #submit": "submit"
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
                    $(':input', el)
                        .not(':button, :submit, :reset')
                        .val('')
                        .removeAttr('checked')
                        .removeAttr('selected');

                });

                this.$el.on('keypress', function(e) {
                    if(e.which === 13) {
                        that.submit();
                    }
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
        },

        close: function(event) {
            //Remove keyboard events
            $(document).off('keyup.dismiss.modal');

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

        submit: function() {
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
        }
	});

    Modals.Views.RenameFile = Modals.Views.Modal.extend({
        id: "rename_file",
        template: "modals/rename",

        events: {
            "click #cancel": "cancel",
            "click #submit": "submit"
        },

        submit: function() {
            var model = app.project.get('files').getByCid(this.$el.find('#cid').val());

            if(model) {
                model.set({
                    name: this.$el.find("#filename").val()
                });
            }

            this.$el.modal("hide");
        }
    });

    Modals.Views.DeleteFile = Modals.Views.Modal.extend({
        id: "delete_file",
        template: "modals/delete_file",

        submit: function() {
            var model = app.project.get('files').getByCid(this.$el.find('#cid').val());

            if(model) {
                var currSelected = app.project.get('files').getSelected(model.get('type') );
                if(currSelected) {
                    currSelected.set("selected", false);
                }

//                app.trigger("file:select", {
//                    file: selectedFile,
//                    type: selectedFile.get("type")
//                });

                model.destroy();
            }

            //After creating new file hide modal
            this.$el.modal("hide");
        }
    });

    Modals.Views.HtmlConfig = Modals.Views.Modal.extend({
        id: "html_config",
        template: "modals/html_config",

        initialize: function() {
            this.setViews({
                "#js_files": [new Modals.Views.List({type: "javascript"})],
                "#css_files": [new Modals.Views.List({type: "css"})]
            });
        },

        postRender: function(el) {
            $("#settingsTab a", el).click(function (e) {
                e.preventDefault();
                $(this).tab('show');
            });
        },

        submit: function() {
            this.$el.find('.files ul').find('li').each(function(index, item) {
                var view = app.project.get('files').getView(function(view) {
                    return view.$el = item;
                });

                if(view) {
                    var metaData = app.project.get('files').get('metaData').get(view.model.id);

                    if(metaData) {
                        metaData.set('order' ,index);
                        metaData.set('active', item.find('active').selected());
                    } else {
                        app.project.get('files').get('metaData').create({
                            id: view.model.id,
                            order: index,
                            active: item.find('active').selected()
                        });
                    }
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