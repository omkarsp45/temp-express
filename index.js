const express = require('express');
const app = express();

let numberOfRequestsForUser = {};

setInterval(function () {
    numberOfRequestsForUser = {};
}, 10000);

function middleware(req, res, next) {
    const userId = req.headers["user-id"];
    if (!userId) {
        return res.status(400).send("User ID is required");
    }
    if (!numberOfRequestsForUser[userId]) {
        numberOfRequestsForUser[userId] = 0;
    }
    numberOfRequestsForUser[userId]++;
    if (numberOfRequestsForUser[userId] > 5) {
        return res.status(429).send("Too many requests. Please try again later.");
    }
    next();
}

app.get('/', middleware, (req, res) => {
    res.send('Hello World!');
});
app.listen(3000, () => {
    console.log('Server is running on http://localhost:30010');
});
