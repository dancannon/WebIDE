define(["jquery", "use!handlebars", "use!moment"],

    function ($, Handlebars, moment) {
        var hasSessionStorage = !!sessionStorage;

        //Init cache
        var JST = {};

        //Handlebars helpers
        Handlebars.registerHelper('date', function(context, block) {
            if (moment) {
                var f = block.hash.format || "MMM Mo, YYYY";
                return moment(context).format(f);
            }else{
                return context;
            }
        });
        Handlebars.registerHelper('url', function(url) {
            return globals.baseUrl + url;
        });

        return {
            getFromCache: function(path) {
                if (hasSessionStorage && !globals.debug) {
                    var cached = window.sessionStorage.getItem("template-" + path);

                    if (!!cached) {
                        return Handlebars.compile(cached);
                    } else {
                        return cached;
                    }
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
                    JST[path] = Handlebars.compile(raw);
                }
            },
            fetch: function(path, done) {
                var that = this;
                if (!this.isCached(path)) {
                    $.ajax({
                        url:path,
                        type:"get",
                        dataType:"text",
                        cache:false,
                        global:false,

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
