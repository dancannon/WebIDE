define(["jquery", "use!handlebars", "use!moment", "use!plugins/jquery.timeago"],

    function ($, Handlebars, moment) {
        var hasSessionStorage = !!sessionStorage;
        var JST = window.JST = window.JST || {};

        //Handlebars helpers
        Handlebars.registerHelper('date', function() {
            return new Date();
        });
        Handlebars.registerHelper('dateFormat', function(context, block) {
            if (moment) {
                var f = block.hash.format || "MMM Mo, YYYY";
                return moment(context || new Date()).format(f);
            }else{
                return context;
            }
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