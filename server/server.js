const express = require('express'),
      https = require('https'),
      path = require('path'),
      conf = require('./config.js'),
      bodyParser = require('body-parser'),
      morgan = require('morgan'),
      historyApiFallback = require('connect-history-api-fallback'),
      app = express(),
      url = require('url'),
      jade = require('jade'),
      passport = require('passport'),
      LTIStrategy = require('passport-lti');

app.set( 'views', './views' ) ;
app.set( 'view engine', 'jade' ) ;
app.engine( 'jade', jade.__express ) ;

// Using morgan for request logging.
app.use(morgan('combined'));

// Without this, SAML loops endlessly. Might be required for other functionality, too.
app.use(bodyParser.urlencoded({extended: true}));

app.set('trust proxy', 1);

const strategy = new LTIStrategy(conf.getLtiOptions(), (profile, callback) => {
  if (! profile) {
    callback("Error: No Profile");
  } else {
    let user = {  userid: profile.custom_userid,
                  courseid: profile.custom_courseid,
                  sis_course_id: profile.custom_sis_course_id,
                  sis_section_ids: profile.custom_sis_section_ids,
                  roles: profile.custom_roles,
                  cssCommon: profile.custom_css_common
              };
     return callback(null, user);
  }
});
passport.use(strategy);

app.use(passport.initialize());
app.post('/launch',
  passport.authenticate('lti',
  {failureRedirect: '/views/index.html', session:false}),
  (req, res, next) => {
         res.render('main_jade', {
                      consumerParams: JSON.stringify(req.body, null, 4),
                      user: JSON.stringify(req.user, null, 4),
                      cssCommon: req.user.cssCommon,
                   });
  }
);

// Serve static files from the scripts directory.  First, add historyApiFallback
// so that we our paths don't 404 for lack of file.
app.use(historyApiFallback());
app.use(express.static(path.join(__dirname, '../views'), {
  fallthrough: false,
  dotfiles: 'ignore'
}));

// Requests for anything outside scripts directory should return index.html.
app.get('*', (req, res, next) => {
  console.log('Request: [GET]', req.originalUrl);
  res.sendFile(path.resolve(__dirname, 'index.html'));
  next();
});

const port = 8443;
https.createServer(conf.getsslOptions(), app).listen(port);
console.log(`Listening on ${port}`);
