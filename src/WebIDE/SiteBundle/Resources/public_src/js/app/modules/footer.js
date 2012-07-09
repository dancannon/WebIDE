define(["app/webide","use!backbone"],

function(webide, Backbone) {
    "use strict";

    // Create a new module
    var Footer = webide.module(),
        app = webide.app;

    Footer.Views.LastSavedView = Backbone.View.extend({
        template: "footer/last_saved",
        keep: true,

        initialize: function() {
            app.on("save", this.render, this);
        },

        render: function(manage) {
            return manage(this).render().then(function(el) {
                $('time.timeago', el).timeago();
            });
        }
    });

	// This will fetch the tutorial template and render it.
	Footer.Views.Main = Backbone.View.extend({
		template: "footer/footer",
        keep: true,

        initialize: function() {
            this.setViews({
                ".saved": new Footer.Views.LastSavedView()
            });
        }
	});

	// Required, return the module for AMD compliance
	return Footer;

});