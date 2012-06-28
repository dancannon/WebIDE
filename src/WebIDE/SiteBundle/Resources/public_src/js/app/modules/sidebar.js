define(["app/webide", "use!backbone", "app/modules/files", "plugins/jquery.mousetools", "plugins/jquery.contextMenu"],

function(webide, Backbone, Files) {
	// Create a new module
	var Sidebar = webide.module(),
		app = webide.app;

	// Example extendings
	Sidebar.Model = Backbone.Model.extend({
		defaults: {
			width: 275,
			active: true
		},
		initialize: function() {}
	});

	/** Views **/
	Sidebar.Views.FileTab = Backbone.View.extend({
		template: "sidebar/filetab",
        keep: true,

        initialize: function() {
            this.setViews({
                ".content": new Files.Views.Tree()
            });
        }
	});
	// This is the main sidebar view
	Sidebar.Views.Main = Backbone.View.extend({
		template: "sidebar/sidebar",
        className: "inner_container",
        keep: true,

		events: {
			"click #minimize_sidebar": "minimize_sidebar",
			"click #expand_sidebar": "expand_sidebar",
			"click .resize": "expand_sidebar"
		},

		initialize: function() {
			var that = this;
            this.setViews({
                "#sidebar_container": new Sidebar.Views.FileTab()
            });

			this.model = new Sidebar.Model();
            that.update_sidebar();

			//Setup events
			app.on("sidebar.update", function() {
				that.update_sidebar();
			});
			this.model.on("change", function() {
				app.trigger("sidebar.update", this.model.get("width"));
			}, this);
		},

        serialize: function() {
            return this.model.toJSON();
        },

		update_sidebar: function() {
			var el = this.$el;
			if (this.model.get("active") === true) {
				el.addClass("active");
				el.removeClass("inactive");
			} else {
				el.removeClass("active");
				el.addClass("inactive");
			}
			//Update widths
			this.$el.css("width", this.model.get("width"));
		},

		minimize_sidebar: function(event) {
			this.model.set({
				width: 7,
				active: false
			});
		},

		expand_sidebar: function(event) {
			if(!this.model.get("active")) {
				this.model.set({
					width: 275,
					active: true
				});
			}
		}
	});

	// Required, return the module for AMD compliance
	return Sidebar;

});