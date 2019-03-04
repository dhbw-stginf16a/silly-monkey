const jwt = require('jsonwebtoken');

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

var sessionToken = {};

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
  token.token.user = user;
  console.log('Token created: ', token.token);

  sessionToken = token.token;
  return sessionToken;
}

async function getAccessToken(res) {
  // Do we have an access token cached?
  let token = sessionToken;

  if (token) {
    // We have a token, but is it expired?
    // Expire 5 minutes early to account for clock differences
    const FIVE_MINUTES = 300000;
    const expiration = new Date(parseFloat(sessionToken.expires_at - FIVE_MINUTES));
    if (expiration > new Date()) {
      // Token is still good, just return it
      return token;
    }
  }

  // Either no token or it's expired, do we have a
  // refresh token?
  const refresh_token = sessionToken.refresh_token;
  if (refresh_token) {
    const newToken = await oauth2.accessToken.create({refresh_token: refresh_token}).refresh();
    sessionToken = newToken;
    return newToken.token.access_token;
  }

  // Nothing in the cookies that helps, return empty
  return null;
}

exports.getAccessToken = getAccessToken;

exports.getTokenFromCode = getTokenFromCode;

exports.getAuthUrl = getAuthUrl;