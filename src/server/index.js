
var Commands = require('commands');
var express = require('express');
var app = express();

(require('properties-reader')('src/properties/' + process.env.NODE_ENV + '.properties'))
    .bindToExpress(app, __dirname, true);

(require('properties-reader')('src/properties/i18n.properties')).each(function (key, value) {
    key = 'i18n-' + key;
    app.set(key, app.locals[key] = value);
});

app.use(express.logger({
    stream: require('fs').createWriteStream(app.get('access.log.path'), {flags: 'a'}),
    buffer: app.get('access.log.buffering'),
    format: app.get('access.log.format')
}));

if(process.env.NODE_ENV === 'development') {
    app.set('version', 'dev');
    app.use(express.errorHandler({showStack: true, dumpExceptions: true}));
    app.use('/dev', require('less-middleware')(app.get('static.content.dir')));
    app.use('/dev', express.static(app.get('static.content.dir'), {maxAge: app.get('static.content.cache')} ));
}
else {
    app.set('version', require('../../package.json').version);
}

app.set('views', require('path').join(__dirname, '../templates'));
app.set('view engine', 'mustache');
app.engine('mustache', require('hogan-middleware').__express);

app.locals.version = app.get('version');
app.locals.i18n = function (key) {
    var val = app.get('i18n-' + key);
    var args = arguments;

    if (/\{.+\}/.test(val)) {
        val = val.replace(/\{([^\}]+)\}/, function (_, key) {
            return this.hasOwnProperty(key) ? this[key] : '';
        }.bind(args.length === 2 && typeof args[1] === "object" ? args[1] : [].slice.call(args, 1)));
    }

    return val === undefined ? '' : val;
};

app.set('models', require('./models/index')(app.get('properties')));

//app.use('/user', require('./routes/user'));
//

app.get('/', function (req, res) {
    res.render('comment');
});

app.all('/comments/:url', function (req, res, next) {
    Comment.find({url: req.params.url}).then(function (err, comments) {
        res.locals.url = req.params.url;
        res.locals.comments = comments;
        next();
    });
});

app.get('/comments/:url', function (req, res) {
    res.render('comments');
});

app.post('/comments/:url', function (req, res) {
    var data = req.body;
    data.url = req.param.url;

    app.get('models').createComment(data).save().then(function (err, comment) {
        res.locals.comments.unshift(comment);
        res.locals.comment = comment;
        res.render('comment-saved');
    });
});

app.listen(Commands.get('port', Commands.get('port', app.get('server.port'))));

