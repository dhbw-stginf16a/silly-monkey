var express = require('express');
var router = express.Router();
var authHelper = require('../helper/auth');

/* GET home page. */
router.get('/', async function(req, res, next) {
  let parms = { title: 'Home', active: { home: true } };
  var accessToken = "";
  var userName = "";

  const sessionToken = await authHelper.getAccessToken(res);
  if(sessionToken) {
    accessToken = sessionToken.access_token;
    userName = sessionToken.user.name;
  }

  if (accessToken && userName) {
    parms.user = userName;
    parms.accessToken = `${accessToken}`;
  } else {
    parms.signInUrl = authHelper.getAuthUrl();
    parms.debug = parms.signInUrl;
  }

  res.send(parms);
});

module.exports = router;