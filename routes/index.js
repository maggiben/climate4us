
/*
 * GET home page.
 */

exports.index = function(req, res){
    console.log("index");
    res.render('index', {
        title: 'Express',
        css: 'style.css',
        content: 'Hello Wold Express 3.x'
    });
};
exports.register = function(req, res){
    console.log("register");
    res.render('register', {
        title: 'register',
        css: 'style.css',
    });
};
