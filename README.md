# THIS ISN'T REAL, YET.  RUN AWAY.

## BrowserID Authenticated Sessions for Connect

BrowserID allows you to implement incredibly convenient
website authentication without any storage requirements.

Signed cookies allow you to implement sessions without any
server storage requirments.

The connect framework let's zap together web applications
with redonkulous efficiency.

**connect-browserid** puts the first two together in a way
that's crazy easy to use in the third.  It's magic.

## How you use it

### install connect-browserid

    npm install connect-browserid

### put the middleware in your server

    app.use(express.session);
    app.use(require('connect-browserid')({
      secret: "yabba dabba do",
      audience: "https://example.com"
    }.authUser());
    app.use(app.router);

This middleware must come after session but before router middlewares.

### throughout your code, req.user is the authenticated user

    if (req.user) res.send('hi ' + req.user);
    else res.send('I don't know you.');

### post an assertion to `/auth` to authenticate

    navigator.id.getVerifiedEmail(function(assertion) {
        if (assertion) {
            $.post("/auth", assertion, function(res) {
                if (res.success) alert("now you're logged in as: " + res.user);
                else alert("log in failure: " + res.reason);                 
            });        
        }
    });    

