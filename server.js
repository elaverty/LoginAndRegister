/** 
This is a pretty generic login and registration site.  It 
stores the user info in a mysql database.
I need to add some password hashing and I'd like to add a system
for password resets.
*/

require('dotenv').config()
require('ejs');

const express = require('express');
const cookieParser = require('cookie-parser');
const sessions = require('express-session');

const app = express();

const con = require('./configs/config.js');
const PORT = 4000;

app.set('view engine', 'ejs');

app.use(sessions({
    secret: process.env.SESSION_SECRET,
    saveUninitialized: true,
    cookie: { maxAge: 1000 * 60 * 60 * 24 }, //24 hours
    resave: false
}));

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));

app.get('/', (req, res) => {
    res.render('pages/login');
})

app.get('/register', (req, res) => {
    res.render('pages/register');
})

app.post('/newReg', (req, res) => {
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const email = req.body.email;
    const password = req.body.password;

    con.getConnection((err, connection) => {
        if (err) throw (err)
        console.log('DB connected successful: ' + connection.threadId)

        con.query(`SELECT * FROM users WHERE email = '${email}'`, function (err, result) {
            if (err) {
                console.log(err);
            };
            if (Object.keys(result).length > 0) {
                res.render('pages/failReg');
            } 
            else {
                function userPage() {
                    req.session.user = {
                        firstname: firstName,
                        lastname: lastName,
                        email: email,
                        password: password
                    };
                    res.render('pages/success', { firstname: firstName });
                }

                let sql = `INSERT INTO users (firstname, lastname, email, password) VALUES ('${firstName}', '${lastName}', '${email}', '${password}')`;
                con.query(sql, function (err, res) {
                    if (err) {
                        console.log(err);
                    } else {
                        userPage();
                    };
                });
            }
        });
    });
});

app.post('/dashboard', (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    con.getConnection((err, conn) => {
        if (err) throw (err)
        console.log('DB connected successful: ' + conn.threadId)

        con.query(`SELECT * FROM users WHERE email = '${email}' && password = '${password}'`, function (err, result) {
            if (err) {
                console.log(err);
            };
            function userPage() {
                req.session.user = {
                    firstname: result[0].firstname,
                    lastname: result[0].lastname,
                    email: email,
                    password: password,
                };
                res.render('pages/success', { firstname: result[0].firstname });
            }
            if (Object.keys(result).length > 0) {
                if (password === password)
                userPage();
            } else {
                res.render('pages/failLogin');
            }
        });
    });
});
app.listen(PORT, () => console.log(`Server Running at port ${PORT}`));