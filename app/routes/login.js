module.exports = function(app, passport, appPath) {
    var express = require('express');
    var path = require('path');

    app.get('/', function(req, res){
     // res.render('index.ejs');
     res.render('login.ejs', {message:req.flash('loginMessage')});
    });
   
    app.get('/login', function(req, res){
     res.render('login.ejs', {message:req.flash('loginMessage')});
    });

    app.get('/index', function(req, res){
        res.render('index.ejs');
    });
   
    app.post('/login', passport.authenticate('local-login', {
     successRedirect: '/bApp',
     failureRedirect: '/login',
     failureFlash: true
    }),
     function(req, res){
      if(req.body.remember){
       req.session.cookie.maxAge = 1000 * 60 * 3;
      }else{
       req.session.cookie.expires = false;
      }
      res.redirect('/');
     });
   
    app.get('/signup', function(req, res){
     res.render('signup.ejs', {message: req.flash('signupMessage')});
    });
   
    app.post('/signup', passport.authenticate('local-signup', {
     successRedirect: '/login',
     failureRedirect: '/signup',
     failureFlash: true
    }));
   
    app.get('/bApp', isLoggedIn, function(req, res){
        //Der Applikation zugriff auf Verzeichnisse geben
        app.use(express.static(appPath + '/public'));
        res.sendFile(path.join(appPath + '/public/index.html'));
/*     res.render('profile.ejs', {
      user:req.user
     }); */
    });
   
    app.get('/logout', function(req,res){
     req.logout();
     req.session.destroy();
     res.redirect('/login');
    });
   };
   
   function isLoggedIn(req, res, next){
    if(req.isAuthenticated())
    return next();
    res.redirect('/');
   }