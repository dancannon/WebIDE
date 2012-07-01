define(["app/webide", "use!backbone", "app/modules/files", "app/modules/modals", "use!keymaster", "use!codemirror", "use!cm_xml", "use!cm_html", "use!cm_css", "use!cm_js", "jqueryui"],

    function(webide, Backbone, Files, Modals, key, CodeMirror) {
        "use strict";

        // Create a new module
        var Editor = webide.module(),
            app = webide.app;

        // Example extendings
        Editor.Model = Backbone.Model.extend({
            defaults: {
                id: 0,
                column_sizes: [100/2, 100/2],
                panel_sizes: [100/3, 100/3, 100/3, 100]
            }
        });

        Editor.Views.Textarea = Backbone.View.extend({
            template: "editor/textarea",
            tagName: "textarea",
            codemirror: null,
            keep: true,

            serialize: function() {
                return {
                    file: this.model.toJSON()
                };
            },

            render: function(manage) {
                var that = this;
                return manage(this).render().then(function(el) {
                    if(!el.parentNode) {
                        return;
                    }

                    var foldFunc;

                    CodeMirror.commands.js_autocomplete = function(cm) {
                        CodeMirror.simpleHint(cm, CodeMirror.javascriptHint);
                    };

                    if(this.type === "html") {
                        foldFunc = CodeMirror.newFoldFunction(CodeMirror.tagRangeFinder);
                    } else {
                        foldFunc = CodeMirror.newFoldFunction(CodeMirror.braceRangeFinder);
                    }

                    this.codemirror = CodeMirror.fromTextArea(el, {
                        mode: this.model.get("type"),
                        lineNumbers: true,
                        lineWrapping: true,
                        onChange: function(cm, event) {
                            that.model.set("content", cm.getValue());

                            app.trigger("reload");
                        },
                        onGutterClick: foldFunc,
                        extraKeys: {
                            "Ctrl-Q": function(cm){foldFunc(cm, cm.getCursor().line);}
                        }
                    });

                    if(this.type === "javascript") {
                        this.codemirror.setOption("extraKeys", {
                            "Ctrl-Q": function(cm){foldFunc(cm, cm.getCursor().line);},
                            "Ctrl-Space": "js_autocomplete",
                            "'>'": function(cm) { cm.closeTag(cm, '>'); },
                            "'/'": function(cm) { cm.closeTag(cm, '/'); }
                        });
                    }

                    this.codemirror.setValue(this.model.get("content"));
                    this.codemirror.refresh();
                });
            },

            cleanup: function() {
                if(this.codemirror) {
                    var element = this.codemirror.getWrapperElement();
                    if(element) {
                        $(element).remove();
                    }
                }
            }
        });

        Editor.Views.Panel = Backbone.View.extend({
            template: "editor/panel",
            className: "panel disabled",
            keep: true,
            codemirror: null,

            events: {
                "click .fullscreen": "fullscreen",
                "click .exit_fullscreen": "exit_fullscreen"
            },

            initialize: function() {
                app.on("file:select file:close", this.update_textarea, this);
                app.project.on("add:files remove:files", function(file) {
                    this.update_textarea({
                        type: file.get('type')
                    });
                }, this);

                app.trigger("file:select", {
                    type: this.type
                });
            },

            serialize: function() {
                return {
                    name: this.name,
                    type: this.type
                };
            },

            fullscreen: function() {
                app.trigger("editor:fullscreen", {
                    panel: this
                });
            },

            exit_fullscreen: function() {
                app.trigger("editor:fullscreen:exit", {
                    panel: this
                });
            },

            update_textarea: function(args) {
                if(args.type === this.type) {
                    var selected = app.project.get('files').getSelected(this.type);

                    if(selected) {
                        this.$el.removeClass("disabled");
                        this.setView(".frame", new Editor.Views.Textarea({
                            model: selected
                        })).render();
                    } else {
                        var view = this.getView(function(view) {
                            return view instanceof Editor.Views.Textarea;
                        });

                        if(view) {
                            this.$el.addClass("disabled");
                            view.remove();
                        }
                    }
                }
            }
        });

        Editor.Views.HtmlPanel = Editor.Views.Panel.extend({
            name: "HTML",
            type: "html",
            id: "html_panel",

            initialize: function() {
                Editor.Views.Panel.prototype.initialize.apply(this, arguments);
                this.setViews({
                    ".file_tabs" : new Files.Views.Tab({type: "html"})
                });
            }
        });
        Editor.Views.CSSPanel = Editor.Views.Panel.extend({
            name: "CSS",
            type: "css",
            id: "css_panel",

            initialize: function() {
                Editor.Views.Panel.prototype.initialize.apply(this, arguments);
                this.setViews({
                    ".file_tabs" : new Files.Views.Tab({type: "css"})
                });
            }
        });
        Editor.Views.JSPanel = Editor.Views.Panel.extend({
            name: "JS",
            type: "javascript",
            id: "javascript_panel",

            initialize: function() {
                Editor.Views.Panel.prototype.initialize.apply(this, arguments);
                this.setViews({
                    ".file_tabs" : new Files.Views.Tab({type: "javascript"})
                });
            }
        });
        Editor.Views.PreviewPanel = Editor.Views.Panel.extend({
            template: "editor/preview",
            id: "preview_panel",
            className: "panel",
            keep: true,

            initialize: function() {}
        });


        // This will fetch the tutorial template and render it.
        Editor.Views.Main = Backbone.View.extend({
            template: "editor/workspace",
            keep: true,

            initialize: function() {
                var that = this;
                this.model = new Editor.Model();

                this.setViews({
                    "#column_left": [new Editor.Views.HtmlPanel(), new Editor.Views.CSSPanel(), new Editor.Views.JSPanel()],
                    "#column_right": [new Editor.Views.PreviewPanel()]
                });

                //Setup events
                app.on("editor:update", this.update_panels, this);
                app.on("reload", this.reload, this);
                app.on("run", this.run, this);
                app.on("editor:fullscreen", this.fullscreen, this);
                app.on("editor:fullscreen:exit", this.exit_fullscreen, this);


                //Backbone does not support this event so it needs to be bound manually
                $(window).resize(function() {
                    app.trigger("editor:update");
                });

                this.update_panels();
            },

            run: function() {
                this.reload(true);
            },

            reload: function(execJs) {
                //Sort collection before rendering
                app.project.get('files').sort();

                var file = app.project.get('files').getSelected("html");

                //Prepare attributes
                if(!file) {
                    return;
                }

                //Inject html into frame
                var contents = "<html><head>";

                //Add each css file
                app.project.get('files').ofType("css", function(file) {
                    contents += "<style>" + file.get('content') + "</style>";
                });

                app.project.get('files').ofType("javascript", function(file) {
                    if(execJs) {
                        contents += "<script type='text/javascript'>" + file.get('content') + "</script>";
                    } else {
                        contents += "<script type='code/javascript'>" + file.get('content') + "</script>";
                    }
                });

                contents += "</head><body>";
                contents += file.get('content');
                contents += "</body></html>";

                var previewFrame = $(".preview")[0];

                if(previewFrame) {
                    var preview =  previewFrame.contentDocument ||  previewFrame.contentWindow.document;
                    preview.open();
                    preview.write(contents);
                    preview.close();
                }
            },

            update_panels: function() {
                var el = this.$el,
                    columns = $(".column", el),
                    panels = $(".panel", el);

                $(columns[0]).css("width", this.model.get("column_sizes")[0] + "%");
                $(columns[1]).css("width", this.model.get("column_sizes")[1] + "%");

                $(panels[0]).css("height", this.model.get("panel_sizes")[0] + "%");
                $(panels[1]).css("height", this.model.get("panel_sizes")[1] + "%");
                $(panels[2]).css("height", this.model.get("panel_sizes")[2] + "%");
                $(panels[3]).css("height", this.model.get("panel_sizes")[3] + "%");
            },

            fullscreen: function(args) {
                var that = this;

                var column_sizes = this.model.get("column_sizes").slice(0);
                var panel_sizes = this.model.get("panel_sizes").slice(0);

                this.$el.find('.panel').each(function(key, panel) {
                    if(panel === args.panel.$el[0]) {
                        panel_sizes[key] = 100;
                    } else {
                        panel_sizes[key] = 0;
                    }
                    args.panel.$el.css("height", that.$el.height());

                    that.$el.find('.panel').addClass('hide');
                    args.panel.$el.addClass('fullscreen');
                    args.panel.$el.removeClass('hide');
                });
                this.$el.find('.column').each(function(key, column) {
                    if($.contains(column, args.panel.$el[0])) {
                        $(column).css("width", "100%");
                        column_sizes[key] = 100;
                    } else {
                        $(column).css("width", "0%");
                        $(column).hide();
                        column_sizes[key] = 0;
                    }
                });

                this.model.set("default_layout", {
                    column_sizes: this.model.get("column_sizes"),
                    panel_sizes: this.model.get("panel_sizes")
                });

                this.model.set("column_sizes", column_sizes);
                this.model.set("panel_sizes", panel_sizes);

                this.update_panels();
            },

            exit_fullscreen: function(args) {
                var column_sizes = this.model.get("default_layout").column_sizes;
                var panel_sizes = this.model.get("default_layout").panel_sizes;

                this.model.set("column_sizes", column_sizes);
                this.model.set("panel_sizes", panel_sizes);

                this.$el.find('.column').show();

                this.$el.find('.panel').removeClass('fullscreen');
                this.$el.find('.panel').removeClass('hide');

                this.update_panels();
            }
        });

        // Required, return the module for AMD compliance
        return Editor;
    });