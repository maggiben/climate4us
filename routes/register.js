
/*
 * GET register page.
 */

exports.register = function(req, res){
    console.log("register");
    res.render('register', {
        title: 'register',
        css: 'style.css',
    });
};
