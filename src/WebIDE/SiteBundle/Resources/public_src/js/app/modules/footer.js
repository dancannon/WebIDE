define(["app/webide",

// Libs
"use!backbone"

// Modules
// Plugins
],

function(webide, Backbone) {

	// Create a new module
	var Footer = webide.module();

	// This will fetch the tutorial template and render it.
	Footer.Views.Main = Backbone.View.extend({
		template: "footer/footer",
		id: "footer",
		className: "clearfix",
        keep: true
	});

	// Required, return the module for AMD compliance
	return Footer;

});