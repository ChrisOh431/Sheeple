const express = require("express");
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const auth = (client_info) => {
    const { CLIENT_ID, CLIENT_SECRET } = client_info;

    let ACCESS_TOKEN;
    
    return async function (req, res, next) {
        // check if there's an access token in cookies
        // if not, check if there's a refresh token in cookies, then refresh access token
        // if neither, or refreshing token results in error, authenticate using Spotify's Code Grant Path

        console.log("\nauth: auth point hit");
        try {
            if (req.query.error) {
                return res.redirect("/");
            }

            if (ACCESS_TOKEN) {
                // user is already authorized and token hasn't expired
                console.log("auth: access token exists, continuing");
                req.headers.authorization = `Bearer ` + ACCESS_TOKEN
                return next();
            } else {
                // access token expired
                console.log(
                    "auth: no access token, requesting one from Reddit\n"
                );

                fetch("https://www.reddit.com/api/v1/access_token", {
                    method: 'POST',
                    body: 'grant_type=client_credentials',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Authorization': `Basic ` + Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')
                    }
                }).then((response) => {
                    response.json().then((saun) => {
                        ACCESS_TOKEN = saun.access_token;
                        console.log("new acc tok: ", saun);

                        req.headers.authorization = `Bearer ` + ACCESS_TOKEN
                        return next();
                    });
                })
            }
        } catch (error) {
            console.error("auth error: " + error);
        }
    };
};

module.exports = { auth };
