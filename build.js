var bundle = require('browserify')();
var uglify = require('uglify-js');
var fs = require('fs');

bundle.add('./reformer.usernamefield.js');
bundle.bundle({standalone: 'reformerUsernameField'}, function (err, source) {
    var fileName = 'dist/reformer.usernamefield.js';
    if (err) console.error(err);
    fs.writeFileSync(fileName, source);
    fs.writeFileSync('dist/reformer.usernamefield.min.js', uglify.minify(fileName).code);
});
