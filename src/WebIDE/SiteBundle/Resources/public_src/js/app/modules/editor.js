define(["app/webide", "use!backbone", "app/modules/files", "app/modules/modals", "use!codemirror", "use!cm_xml", "use!cm_html", "use!cm_css", "use!cm_js", "jqueryui"],

    function(webide, Backbone, Files, Modals, CodeMirror) {
        "use strict";

        // Create a new module
        var Editor = webide.module(),
            app = webide.app;

        // Example extendings
        Editor.Model = Backbone.Model.extend({
            defaults: {
                id: 0,
                column_sizes: [100/2, 100/2],
                panel_sizes: [100/3, 100/3, 100/3]
            }
        });

        Editor.Views.Panel = Backbone.View.extend({
            template: "editor/panel",
            className: "panel",
            keep: true,
            codemirror: null,

            events: {
                "focusin .frame": "focus_in",
                "focusout .frame": "focus_out",
                "click .fullscreen": "fullscreen",
                "click .exit_fullscreen": "exit_fullscreen"
            },

            initialize: function() {
                var that = this;
                app.on("application:init", function() {
                    app.project.get('files').on("add remove fetch", function(event) {
                        this.update_textarea();
                    }, that);
                    app.on("file:select file:close", function(args) {
                        if(args.type === this.type) {
                            this.update_textarea();
                        }
                    }, that);

                    this.initialize_cm();
                    this.update_textarea();
                }, this);
            },

            serialize: function() {
                return {
                    name: this.name,
                    type: this.type
                };
            },

            render: function(manage) {
                return manage(this).render();
            },

            change: function(editor, changes, forceCompile) {
                var selected = app.project.get('files').getSelected(this.mode);
                if(!selected) {
                    return;
                }

                selected.set("content", editor.getValue());
                app.trigger("app:reload");
            },

            initialize_cm: function() {
                var selected = app.project.get('files').getSelected(this.type),
                    $textarea = $("textarea", this.el),
                    value = selected ? selected.get("content") : "";

                if(!selected) {
                    this.$el.addClass("disabled");
                } else {
                    this.$el.removeClass("disabled");
                }

                var foldFunc;

                CodeMirror.commands.js_autocomplete = function(cm) {
                    CodeMirror.simpleHint(cm, CodeMirror.javascriptHint);
                };

                if(this.type === "html") {
                    foldFunc = CodeMirror.newFoldFunction(CodeMirror.tagRangeFinder);
                } else if(this.type === "css") {
                    foldFunc = CodeMirror.newFoldFunction(CodeMirror.braceRangeFinder);
                } else if(this.type === "javascript") {
                    foldFunc = CodeMirror.newFoldFunction(CodeMirror.braceRangeFinder);
                }

                this.codemirror = CodeMirror.fromTextArea($textarea.get(0), {
                    mode: this.type,
                    lineNumbers: true,
                    lineWrapping: true,
                    onChange: this.change,
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
                    })
                }

                this.codemirror.setValue(value);
                this.codemirror.refresh();
            },

            update_textarea: function() {
                var selected = app.project.get('files').getSelected(this.type);
                //If nothing is selected disable the textarea
                if(!selected) {
                    this.$el.addClass("disabled");
                    return;
                } else {
                    this.$el.removeClass("disabled");
                }

                var $textarea = $("textarea", this.el),
                    value = selected.get("content");

                $textarea.val(value);

                this.codemirror.setValue(value);
                this.codemirror.refresh();
            },

            /**
             * Event for textarea gaining focus
             */
            focus_in: function(event) {
                this.$el.find('.panel_name').fadeOut(150);
            },
            /**
             * Event for textarea losing focus
             */
            focus_out: function(event) {
                this.$el.find('.panel_name').fadeIn(150);
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
            }
        });

        Editor.Views.HtmlPanel = Editor.Views.Panel.extend({
            name: "HTML",
            type: "html",
            id: "html_panel",

            events: {
                "focusin .frame": "focus_in",
                "focusout .frame": "focus_out",
                "click .fullscreen": "fullscreen",
                "click .exit_fullscreen": "exit_fullscreen",
                "click .settings": "showSettings"
            },

            initialize: function() {
                Editor.Views.Panel.prototype.initialize.apply(this, arguments);
                this.setViews({
                    ".file_tabs" : [new Files.Views.Tab({model: app.project, type: "html"})]
                });
            },

            showSettings: function(event) {
                $("#html_config").modal('show');
            }
        });
        Editor.Views.CSSPanel = Editor.Views.Panel.extend({
            name: "CSS",
            type: "css",
            id: "css_panel",

            initialize: function() {
                Editor.Views.Panel.prototype.initialize.apply(this, arguments);
                this.setViews({
                    ".file_tabs" : [new Files.Views.Tab({collection: app.project.get('files'), type: "css"})]
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
                    ".file_tabs" : [new Files.Views.Tab({collection: app.project.get('files'), type: "javascript"})]
                });
            }
        });
        Editor.Views.PreviewPanel = Backbone.View.extend({
            template: "editor/preview",
            id: "preview_panel",
            className: "panel",
            keep: true,

            events: {
                "focusin .frame": "focus_in",
                "focusout .frame": "focus_out",
                "click .fullscreen": "fullscreen",
                "click .exit_fullscreen": "exit_fullscreen"
            },

            /**
             * Event for textarea gaining focus
             */
            focus_in: function(event) {
                this.$el.find('.panel_name').fadeOut(150);
            },
            /**
             * Event for textarea losing focus
             */
            focus_out: function(event) {
                this.$el.find('.panel_name').fadeIn(150);
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
            }
        });


        // This will fetch the tutorial template and render it.
        Editor.Views.Main = Backbone.View.extend({
            template: "editor/workspace",
            id: "workspace",
            keep: true,

            initialize: function() {
                var that = this;
                this.model = new Editor.Model();

                this.setViews({
                    "#column_left": [new Editor.Views.HtmlPanel(), new Editor.Views.CSSPanel(), new Editor.Views.JSPanel()],
                    "#column_right": [new Editor.Views.PreviewPanel()]
                });

                //Setup events
                app.on("application:init", function() {
                    that.update_panels();
                });
                app.on("editor:update", function() {
                    that.update_panels();
                });
                app.on("sidebar.update", function(sidebar_width) {
                    that.update_workspace(sidebar_width);
                });
                app.on("app:reload", function() {
                    that.reload();
                });
                app.on("app:run", function() {
                    that.reload(true);
                });
                app.on("editor:fullscreen", function(args) {
                    var column_sizes = this.model.get("column_sizes").slice(0);
                    var panel_sizes = this.model.get("panel_sizes").slice(0);

                    this.$el.find('.panel').each(function(key, panel) {
                        if(panel == args.panel.$el[0]) {
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
                    this.update_workspace();
                }, this);
                app.on("editor:fullscreen:exit", function(args) {
                    var column_sizes = this.model.get("default_layout").column_sizes;
                    var panel_sizes = this.model.get("default_layout").panel_sizes;

                    this.model.set("column_sizes", column_sizes);
                    this.model.set("panel_sizes", panel_sizes);

                    this.$el.find('.column').show();

                    this.$el.find('.panel').removeClass('fullscreen');
                    this.$el.find('.panel').removeClass('hide');

                    this.update_panels();
                    this.update_workspace();
                }, this);


                //Backbone does not support this event so it needs to be bound manually
                $(window).resize(function() {
                    app.trigger("editor:update");
                });
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
            },

            update_workspace: function(sidebar_width) {
                var el = this.$el;
                el.css("left", sidebar_width);
            }
        });

        // Required, return the module for AMD compliance
        return Editor;
    });