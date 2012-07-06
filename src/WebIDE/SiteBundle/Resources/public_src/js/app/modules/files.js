define(["app/webide", "use!underscore", "use!backbone", "app/modules/versions", "jquery", "jqueryui", "use!plugins/backbone.relational", "plugins/jquery.contextMenu"],

    function (webide, _, Backbone, Versions) {
        // Create a new module
        var Files = webide.module(),
            app = webide.app;

        // Events
        app.on("file:create", function(args) {
            if (!app.project.get("files").any(function(file) {
                return (file.get('name') === args.name) && (file.get('type') === args.type);
            })) {
                args.project = app.project;
                args.selected = true;

                var selected = app.project.get("files").getSelected(args.type);
                if(selected) {
                    selected.set("selected", false);
                }

                var newfile = app.project.get("files").add(new Files.Model(args));

                app.trigger("file:select", {
                    file: newfile,
                    type: newfile.get("type")
                });

            } else {
                app.trigger("application:notify", {
                    text: "A file already exists with that name",
                    type: "error"
                });
            }
        });
        app.on("file:import", function(args) {
            if (!app.project.get("files").any(function(file) {
                return (file.get('name') === args.name) && (file.get('type') === args.type);
            })) {
                //Load file
                $.getJSON('/resource/' + args.url).success(function(data) {
                    args.project = app.project;
                    args.resource = args.url;
                    args.content = data.content;
                    args.selected = true;

                    var selected = app.project.get("files").getSelected(args.type);
                    if(selected) {
                        selected.set("selected", false);
                    }

                    var newfile = app.project.get("files").add(new Files.Model(args));

                    app.trigger("file:select", {
                        file: newfile,
                        type: newfile.get("type")
                    });
                }).error(function(data) {
                        app.trigger("application:notify", {
                            message: data.message,
                            type: "error"
                        });
                    });
            } else {
                app.trigger("application:notify", {
                    text: "A file already exists with that name",
                    type: "error"
                });
            }
        });

        Files.Model = Backbone.RelationalModel.extend({
            defaults:{
                active:true,
                selected:false,
                resource:"",
                project: null,
                order: 0,
                type:'html',
                content: ""
            },

            initialize: function() {
                this.defaults.order = app.project.get('files').nextOrder();
            },

            urlRoot: globals.baseUrl + '/files',


            isSelected: function(type) {
                if(type) {
                    if (this.get("type") !== type) {
                        return false;
                    }
                }

                return this.get("selected");
            },

            isActive: function(type) {
                if(type) {
                    if (this.get("type") !== type) {
                        return false;
                    }
                }

                return this.get("active");
            },

            isResource: function() {
                return this.get("resource") === "";
            },

            nextOrder: function() {
                return app.project.get('files').nextOrder();
            }
        });

        Files.Collection = Backbone.Collection.extend({
            url: globals.baseUrl + '/files',
            model: Files.Model,

            ofType: function (type, callback) {
                return this.filter(function (file) {
                    if (file.get("type") !== type) {
                        return false;
                    }

                    if (callback) {
                        callback(file);
                    }
                    return true;
                });
            },
            getSelected: function(type) {
                return this.find(function (file) {
                    return file.isSelected(type);
                });
            },

            nextOrder: function() {
                if (!this.length) {
                    return 1;
                } else {
                    return this.last().get('order') + 1;
                }
            },

            comparator: function(file) {
                return file.get('order');
            }
        });

        // This will fetch the tutorial template and render it.
        Files.Views.Tree = Backbone.View.extend({
            template:"files/tree",
            className:"filetree",
            tagName: "ul",

            initialize: function() {
                app.on("file:select", this.render, this);
                app.project.on("add:files remove:files", this.render, this);
            },

            render: function(manage) {
                this.views = {};

                app.project.get('files').each(function(file) {
                    this.insertView("#" + file.get("type") + "_tree ul", new Files.Views.TreeItem({
                        model: file,
                        id: file.get('id')
                    }));
                }, this);

                return manage(this).render().then(function(el) {
                    var that = this;
                    //Create context menu
                    $('.directory > a', el).contextPopup({
                        items: [
                            {label: "New file", icon: "file", action: function(event) {
                                var modalEl =  $("#new_file");

                                $("#filetype option", modalEl).filter(function() {
                                    return $(this).val() === $(event.target).parent('li').data('type');
                                }).attr('selected', true);

                                modalEl.modal('show');
                            }}
                        ]
                    });

                    var sortableEl = this.$el.find('.directory .filetree');

                    sortableEl.sortable({
                        axis: 'y',

                        stop: function(event, ui) {
                            sortableEl.find('li').each(function(index, itemEl) {
                                var file = app.project.get('files').get(itemEl.id);
                                if(file) {
                                    file.set('order', index + 1);
                                }
                            });

                            app.trigger("preview:update");
                        }
                    });
                });
            }
        });

        Files.Views.TreeItem = Backbone.View.extend({
            template:"files/file_tree",
            tagName: "li",
            className: "file",
            keep: false,

            events: {
                "dblclick ": "select_file"
            },

            initialize: function() {
                this.model.on("change:name", this.render, this);
                this.model.on("remove", this.remove, this);
            },

            serialize: function() {
                return this.model.toJSON();
            },

            select_file: function() {
                var that = this;

                app.project.get('files').map(function(file) {
                    if(file === that.model) {
                        file.set("selected", true);
                        file.set("active", true);
                    } else if(file.get("type") === that.model.get("type")) {
                        file.set("selected", false);
                    }
                });

                app.trigger("file:select", {
                    type: this.model.get("type")
                });
            },

            rename: function() {
                $("#rename_file #cid").val(this.model.cid);
                $("#rename_file").modal('show');
            },


            delete_file: function() {
                var that = this;

                $("#delete_file #cid").val(this.model.cid);
                $("#delete_file").modal('show');

                app.trigger("file:close", {
                    type: this.model.get("type")
                });
            },

            render: function(manage) {
                var that = this;
                return manage(this).render().then(function(el) {
                    $(el).addClass("file_" + this.model.get("type"));

                    var files = $(el).find('a').each(function(index, element) {
                        $(element).contextPopup({
                            items: [
                                {label: "Open", icon: "folder-open", action: function() {
                                    that.select_file();
                                }},
                                {label: "New file", icon: "file", action: function(event) {
                                    var modalEl =  $("#new_file");

                                    $("#filetype option", modalEl).filter(function() {
                                        return $(this).val() === $(event.target).parent('li').data('type');
                                    }).attr('selected', true);

                                    modalEl.modal('show');
                                }},
                                {label: "Rename", icon: "pencil", action: function() {
                                    that.rename();
                                }},
                                {label: "Delete", icon: "trash", action: function() {
                                    that.delete_file();
                                }}
                            ]
                        });
                    });
                });
            }
        });

        Files.Views.Tab = Backbone.View.extend({
            tagName: "ul",

            initialize: function() {
                var that = this;

                this.type = this.options.type || "";

                app.on("file:select", this.render, this);
                app.project.on("add:files remove:files", this.render, this);

            },

            render: function(manage) {
                var view = manage(this),
                    that = this,
                    collection = app.project.get('files'),
                    files = collection.ofType(that.type),
                    callback = function(file) {
                        if(!file.get("active")) {
                            return;
                        }

                        that.insertView(new Files.Views.TabItem({
                            model: file
                        }));
                    };

                this.views = {};

                //Add each file to the tabs
                _.each(files, callback);
                if(files.length > 0) {
                    this.insertView(new Files.Views.EndTabItem());
                }

                return view.render();
            }
        });

        Files.Views.EndTabItem = Backbone.View.extend({
            tagName: "li",
            className: "end_file_tab"
        });

        Files.Views.TabItem = Backbone.View.extend({
            template:"files/file_tab",
            tagName: "li",
            className: "file_tab",

            events: {
                "click .close": "close",
                "click": "select_file"
            },

            initialize: function() {
                this.model.on("change:name", this.render, this);
                this.model.on("remove", this.remove, this);
            },

            serialize: function() {
                return this.model.toJSON();
            },

            render: function(manage) {
                var that = this;
                return manage(this).render().then(function(el) {
                    that.$el.attr("id", that.model.id);
                    if(that.model.isSelected()) {
                        that.$el.addClass("tab_active");
                    } else {
                        that.$el.removeClass("tab_active");
                    }
                });
            },

            select_file: function(event) {
                var that = this;

                app.project.get('files').map(function(file) {
                    if(file === that.model) {
                        file.set("selected", true);
                    } else if(file.get("type") === that.model.get("type")) {
                        file.set("selected", false);
                    }
                });

                app.trigger("file:select", {
                    type: this.model.get("type")
                });
            },

            close: function(event) {
                this.model.set("active" , false);
                this.model.set("selected" , false);
                this.remove();

                app.trigger("file:close", {
                    type: this.model.get("type")
                });

                event.stopPropagation();
            }
        });

        // Required, return the module for AMD compliance
        return Files;
    });