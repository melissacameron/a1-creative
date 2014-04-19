
var passport = require('passport');
var TwitterStrategy = require('passport-twitter').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;

var TWITTER_CONSUMER_KEY = "S4keITke4Kvyl8pRxfvX8esEJ";
var TWITTER_CONSUMER_SECRET = "ysHyuLxHfAkIBF0j8sZOQ7TNKlfgoHvwXffBGHxhnnWU1AHKqd";

var FACEBOOK_APP_ID = "642165729170682";
var FACEBOOK_APP_SECRET = "d77af94f21bff559d5a5847530d9bee4";

//Passport session setup
passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(obj, done) {
    done(null, obj);
});

//Use TwitterStrategy within Passport
passport.use(new TwitterStrategy({
        consumerKey: TWITTER_CONSUMER_KEY,
        consumerSecret: TWITTER_CONSUMER_SECRET,
        //PASTE YOUR CALLBACK URL HERE
        callbackURL: "http://127.0.0.1:3000/auth/twitter/callback" 
    },
    function(token, tokenSecret, profile, done) {
        // asynchronous verification, for effect...
        process.nextTick(function () {

            // To keep the example simple, the user's Twitter profile is returned to
            // represent the logged-in user.  In a typical application, you would want
            // to associate the Twitter account with a user record in your database,
            // and return that user instead.
            return done(null, profile);
        });
    }
));

//dependencies for each module used
var express = require('express');
var http = require('http');
var path = require('path');
var handlebars = require('express3-handlebars');
var app = express();

//route files to load
var index = require('./routes/index');

//database setup - uncomment to set up your database
//var mongoose = require('mongoose');
//mongoose.connect(process.env.MONGOHQ_URL || 'mongodb://localhost/DATABASE1);

//Configures the Template engine
app.engine('handlebars', handlebars());
app.set('view engine', 'handlebars');
app.set('views', __dirname + '/views');
/* ADDED BY ME from the example */
app.use(express.logger());
app.use(express.cookieParser());
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.session({ secret: 'keyboard cat' }));
app.use(passport.initialize());
app.use(passport.session());
/* END of new express set up from passport example */
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.bodyParser());

//ROUTES
app.get('/', index.view);

app.get('/auth/twitter',
      passport.authenticate('twitter'));

// twitter callback (logs you in to twitter)
app.get('/auth/twitter/callback',
    passport.authenticate('twitter', { failureRedirect: '/' }), //---originally '/login'
    function(req, res) {
        res.redirect('/UserHasLoggedInTwitter');
    });

//display a message in index.handlebars to check if user is really logged in
app.get('/UserHasLoggedInTwitter', function(req, res) {
    res.render('index', { msg: req.user.username + " is logged in to Twitter!" });
});


app.get('/tweets',	function(req, res)	{	
	res.render('tweets');	
});


//set environment ports and start application
app.set('port', process.env.PORT || 3000);
http.createServer(app).listen(app.get('port'), function(){
	console.log('Express server listening on port ' + app.get('port'));
});


//TWIT
var Twit = require('twit')

var T = new Twit({
    consumer_key:         'S4keITke4Kvyl8pRxfvX8esEJ'
  , consumer_secret:      'ysHyuLxHfAkIBF0j8sZOQ7TNKlfgoHvwXffBGHxhnnWU1AHKqd'
  , access_token:         '583346260-hvSmlVFXd08oO6bqPdTdrAdF3ij0Zw2HEQT0cMPt'
  , access_token_secret:  '7Rkkzn3Tx1PKIvDmAfufTDSyY3My2mNeFlxDO8iVysILa'
})

exports.twitter = T;

app.get('/twitter/statuses', function(req,res) {
	T.get("statuses/user_timeline", function (err,reply) {
		console.log(res);
	})
});


var tweets = T.get('followers/ids', { screen_name: 'mcameron200' },  function (err, reply) {
});
console.log(tweets);


//FB GRAPH

var conf = {
    client_id:      '642165729170682'
  , client_secret:  'd77af94f21bff559d5a5847530d9bee4'
  , scope:          'user_likes, basic_info, email, user_about_me, user_birthday, user_location, publish_stream, read_stream'
  , redirect_uri:   'http://127.0.0.1:3000/auth/facebook'
};

var graph = require('fbgraph');

app.get('/auth/facebook', function(req, res) {

  // we don't have a code yet
  // so we'll redirect to the oauth dialog
  if (!req.query.code) {
    var authUrl = graph.getOauthUrl({
        "client_id":     conf.client_id
      , "redirect_uri":  conf.redirect_uri
      , "scope":         conf.scope
    });

    if (!req.query.error) { //checks whether a user denied the app facebook login/permissions
      res.redirect(authUrl);
    } else {  //req.query.error == 'access_denied'
      res.send('access denied');
    }
    return;
  }

  // code is set
  // we'll send that and get the access token
  graph.authorize({
      "client_id":      conf.client_id
    , "redirect_uri":   conf.redirect_uri
    , "client_secret":  conf.client_secret
    , "code":           req.query.code
  }, function (err, facebookRes) {
    res.redirect('/UserHasLoggedIn');
  });

});

// user gets sent here after being authorized
app.get('/UserHasLoggedIn', function(req, res) {
  res.render("index", { title: "Logged In" });
});

app.get('/UserHasLoggedIn', loggedin.getLikes());


//Grab Facebook Likes
/**app.get('/fblikes', function(req,res) {
  graph.get('/me/likes', function(err, res2) {
  // res.send(res2); // { id: '4', name: 'Mark Zuckerberg'... }
  res.json(res2);
})
});**/

//app.get('loggedin', res2.getLikes);

//Grab Facebook statuses
app.get('/fbfeed', function(req,res) {
  graph.get('/me/feed', function(err,res2) {
    res.send(res2); // sends text response to browser
  })
});

//Grab Twitter timeline
app.get('/twitter', function(req,res) {
  T.get('statuses/user_timeline', function (err, reply) {
    res.send(reply);
  })
});


//Sample twitter data
/**T.get('followers/ids', { screen_name: 'mcameron200' },  function (err, reply) {
   console.log(reply); 
});

T.get('statuses/user_timeline', { screen_name: 'mcameron200' },  function (err, reply) {
    console.log(reply);
  });
**/