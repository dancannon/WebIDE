/*
 *
 * Task: handlebars
 * Description: Compile handlebars templates to JST file
 * Dependencies: handlebars
 * Contributor(s): @tbranyen
 *
 */

module.exports = function(grunt) {
    grunt.registerMultiTask("handlebars", "Compile underscore templates to JST file", function() {
        var files = grunt.file.expandFiles(this.file.src),
            target = this.file.dest,
            namespace = this.data.namespace || "JST",
            strip = this.data.strip,
            contents = "";

        if ( typeof strip === "string" ) {
            strip = new RegExp( "^" + grunt.template.process( strip, grunt.config() ).replace( /[\-\[\]{}()*+?.,\\\^$|#\s]/g, "\\$&" ) );
        }

        namespace = "this['" + namespace + "']";
        contents = namespace + " = " + namespace + " || {};\n\n";

        files.forEach(function(filepath) {
            var templateFunction = require("handlebars").precompile(grunt.file.read(filepath)).toString();
            filepath = strip ? filepath.replace( strip, "" ) : filepath;

            contents += namespace + "['" + filepath + "'] = " + templateFunction + "\n\n";
        });

        grunt.file.write(target, contents);

        if (grunt.errors) { return false; }
        grunt.log.writeln("File \"" + target + "\" created.");
    });
};
