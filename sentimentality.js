require("dotenv").config();

const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const express = require('express');

const app = express();

const { auth } = require("./authentikatherine");
var CLIENT_ID = process.env.CLIENT_ID;
var CLIENT_SECRET = process.env.CLIENT_SECRET;
console.log(CLIENT_ID);
console.log(CLIENT_SECRET);

const authFunc = auth({ CLIENT_ID, CLIENT_SECRET })

const port = 3000;

const subList = [
    "technology",
    "gadgets",
    "buyitforlife",
    "productreviews",
    "laptops",
    "phones",
    "roomporn",
    "gaming",
    "buildapc",
    "buildapcsales",
    "headphones",
    "battlestations",
    "malefashionadvice",
    "femalefashionadvice",
    "interestingasfuck",
    "apphookup",
    "cars",
];
const querySubs = subList.join("+");

const { Sentilyze } = require("./analysis");

app.get('/', authFunc, async (req, res) => {
    if (!req.query) return res.end();
    const topic = req.query.product;
    const limit = 25;
    const querySubs = subList.join("+");
    const query = `http://www.reddit.com/r/${querySubs}/search.json?q=${topic}&sort=top&restrict_sr=false&limit=${10}`;

    fetch(query).then((data, err) => {
        data.json().then((data) => {
            if (data) {
                const posts = data.data.children;
                fetch(`http://www.reddit.com/comments/${posts[0].data.id}.json?sort=top&limit=40&threaded=false&depth=0`).then(
                    (resp) => {
                        resp.json().then((usable) => {
                            let bodyObjs = [];
                            usable.forEach(listing => bodyObjs.push(...listing.data.children));

                            const postTexts = bodyObjs.map(contentful => contentful.data.body);
                            const sentiments = postTexts.map(postTexts => Sentilyze(postTexts));

                            const outsents = sentiments.filter(x => x.text != "");

                            return res.json(outsents);
                        })
                    }
                )
            }
        });
    });
})






app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
});