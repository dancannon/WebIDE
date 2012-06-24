/*
 *
 * Task: handlebars
 * Description: Compile handlebars templates to JST file
 * Dependencies: handlebars
 * Contributor(s): @tbranyen
 *
 */

module.exports = function(grunt) {
    grunt.registerMultiTask( "copy", "Copy files to destination folder", function() {
        function copyFile( src, dest ) {
            grunt.file.copy( src, dest );
        }
        var files = grunt.file.expandFiles( this.file.src ),
            target = this.file.dest + "/",
            strip = this.data.strip,
            renameCount = 0,
            fileName;
        if ( typeof strip === "string" ) {
            strip = new RegExp( "^" + grunt.template.process( strip, grunt.config() ).replace( /[\-\[\]{}()*+?.,\\\^$|#\s]/g, "\\$&" ) );
        }
        files.forEach(function( fileName ) {
            var targetFile = strip ? fileName.replace( strip, "" ) : fileName;
            copyFile( fileName, target + targetFile );
        });
        grunt.log.writeln( "Copied " + files.length + " files." );
        for ( fileName in this.data.renames ) {
            renameCount += 1;
            copyFile( fileName, target + grunt.template.process( this.data.renames[ fileName ], grunt.config() ) );
        }
        if ( renameCount ) {
            grunt.log.writeln( "Renamed " + renameCount + " files." );
        }
    });

};
