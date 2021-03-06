const jwt = require('jsonwebtoken');
const axios = require("axios");

const dbConnectionViaTriggerRouter = "triggerRouter/database/calendarAccess";

const credentials = {
  client: {
    id: process.env.APP_ID,
    secret: process.env.APP_PASSWORD,
  },
  auth: {
    tokenHost: 'https://login.microsoftonline.com',
    authorizePath: 'common/oauth2/v2.0/authorize',
    tokenPath: 'common/oauth2/v2.0/token'
  }
};
const oauth2 = require('simple-oauth2').create(credentials);

function getAuthUrl() {
  const returnVal = oauth2.authorizationCode.authorizeURL({
    redirect_uri: process.env.REDIRECT_URI,
    scope: process.env.APP_SCOPES
  });
  console.log(`Generated auth url: ${returnVal}`);
  return returnVal;
}

async function getTokenFromCode(auth_code, res) {
  let result = await oauth2.authorizationCode.getToken({
    code: auth_code,
    redirect_uri: process.env.REDIRECT_URI,
    scope: process.env.APP_SCOPES
  });

  const token = oauth2.accessToken.create(result);

  // Parse the identity token
  const user = jwt.decode(token.token.id_token);

  
  var userNameArr = user.name.split(',');
  user.name = userNameArr[1] + " " +  userNameArr[0];
  token.token.user = user;

  console.log('Token created: ', token.token);

  setAccessToken(token.token);
  return  token.token;
}

async function getAccessToken(res) {
  // Do we have an access token cached?
  const dbAccessTokenResponse = await axios(calendarAdapter);

  if (token) {
    // We have a token, but is it expired?
    // Expire 5 minutes early to account for clock differences
    const FIVE_MINUTES = 300000;
    const expiration = new Date(parseFloat(dbAccessTokenResponse.expires_at - FIVE_MINUTES));
    if (expiration > new Date()) {
      // Token is still good, just return it
      return token;
    }
  }

  // Either no token or it's expired, do we have a
  // refresh token?
  const refresh_token = dbAccessTokenResponse.refresh_token;
  if (refresh_token) {
    const newToken = await oauth2.accessToken.create({refresh_token: refresh_token}).refresh();
    setAccessToken(newToken.token);
    return newToken.token.access_token;
  }

  // Nothing in the cookies that helps, return empty
  return null;
}

function setAccessToken(token) {
  axios.post(dbConnectionViaTriggerRouter, token)
    .then((res) => {
      console.log(`statusCode: ${res.statusCode}`)
      console.log(res)
    })
    .catch((error) => {
      console.error(error)
    })
}

exports.getAccessToken = getAccessToken;

exports.getTokenFromCode = getTokenFromCode;

exports.getAuthUrl = getAuthUrl;
