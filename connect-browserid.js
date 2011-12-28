var https = require('https')
  , qs = require('querystring');

/* TODOs:
 * automagically register the route POST /auth and GET /logout ???
 * get ride of global audience */

var audience = null;

/**
 * Gets email out of the session.
 *
 * For user's who have previously authenticated
 * via BrowserID, they have a verified email. This
 * middleware will populate the req.user with an
 * email address.
 */
exports.authUser = function authUser(options){
  /* Here we could support:
   * verifier - (node-browserid|https://browserid.org/verify)
   */
  options = options || {};
  if (options.audience) {
    audience = options.audience;
  }
  return function authUser(req, res, next) {
    if (req.user) return next();
    /* Complecting authentication with a User object is
     * a bad idea. Just doing email for now. */
    req.user = null;

    /* TODO how do we do error handling? */
    var no_sess = 'Error: connect-browserid requires session middleware!';
    if (!req.session) return next(no_sess);

    if (req.session.verifiedEmail) {
      req.user = req.session.verifiedEmail;
      res.local('user', req.user);
      console.log("Cool we have " + req.user);
    } else {
      console.log("Seeting user to null");
      res.local('user', null);
    }

    return next();
  };
};

function get_audience(req) {
  if (audience) {
    return audience;
  } else {
    return "TODO form audience from req";
  }
};

/**
 * We'll assume CSRF etc is handled orthoganally to this route?
 *
 * /auth is an AJAX request that returns a 200 and JSON with
 * an email element or a
 * 403 with a reason element as to why verification failed.
 *
 * A side effect is that this starts a user's session and subsequent
 * requests will have req.user set to the user's email address.
 */
exports.auth = function(req, res){
  function onVerifyResp(bidRes) {
    var data = "";
    bidRes.setEncoding('utf8');
    bidRes.on('data', function (chunk) {
      data += chunk;
    });
    bidRes.on('end', function () {
      var verified = JSON.parse(data);
      res.contentType('application/json');
      if (verified.status == 'okay') {
        req.session.verifiedEmail = verified.email;
      } else {
        res.writeHead(403);
      }
      res.write(data);
      res.end();
    });
  };
  console.info("auth called with assertion");
  if (req.method === 'POST') {
    var assertion = req.body.assertion;

    var body = qs.stringify({
      assertion: assertion,
      audience: get_audience(req)
    });

    var request = https.request({
      host: 'browserid.org',
      path: '/verify',
      method: 'POST',
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
        'content-length': body.length
      }
    }, onVerifyResp);
    request.write(body);
    request.end();
  }
};

/**
 * We'll assume CSRF etc is handled orthoganally to this route?
 *
 * /auth is an AJAX request that returns a 200 and JSON with
 * an email element or a
 * 403 with a reason element as to why verification failed.
 *
 * A side effect is that this starts a user's session and subsequent
 * requests will have req.user set to the user's email address.
 */
exports.logout = function (options) {
  // Is there a better name for functions that create routes?
  // like createLogout or whatever...
  options = options || {};
  if (!options.next) {
    options.next = '/';
  }
  return function(req, res){
    req.session.destroy();
    res.redirect(options.next);
  };
};