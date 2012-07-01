define(["jquery", "use!handlebars", "use!moment", "use!plugins/jquery.timeago"],

    function ($, Handlebars, moment) {
        var hasSessionStorage = !!sessionStorage;
        var JST = window.JST = window.JST || {};

        //Handlebars helpers
        Handlebars.registerHelper('date', function() {
            return new Date();
        });
        Handlebars.registerHelper('dateFormat', function(context, block) {
            var format;

            if(!(context instanceof Date)) {
                context = new Date();
            }
            if(block) {
                if(typeof block.hash !== "undefined" && typeof block.hash.format !== "undefined") {
                    format = block.hash.format;
                } else {
                    format = "MMM Mo, YYYY";
                }
            }
            return moment(context).format(format);
        });
        Handlebars.registerHelper('url', function(url) {
            return globals.baseUrl + url;
        });

        return window.template = {
            getFromCache: function(path) {
                if (hasSessionStorage && !globals.debug) {
                    return window.sessionStorage.getItem("template-" + path);
                } else {
                    return JST[path];
                }
            },
            isCached: function(path) {
                return !!this.getFromCache(path);
            },
            store: function(path, raw) {
                if (hasSessionStorage && !globals.debug) {
                    window.sessionStorage.setItem("template-" + path, raw);
                } else {
                    JST[path] = raw;
                }
            },
            fetch: function(path, done) {
                var that = this;

                if (!this.isCached(path)) {
                    $.ajax({
                        url:path,
                        dataType:"text",

                        success: function (contents) {
                            that.store(path, contents);
                            done(that.getFromCache(path));
                        }
                    });
                } else {
                    return done(this.getFromCache(path));
                }
            }
        };
    });