//require modules
const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const User = require('./models/user');

//create app
const app = express();

//configure app
let port = 3000;
let host = 'localhost';
app.set('view engine', 'ejs');

//connect to database
mongoose.connect('mongodb://localhost:27017/demos',
    { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true })// should set this because we set email to be unique
    .then(() => {
        app.listen(port, host, () => {
            console.log('Server is running on port', port);
        });
    })
    .catch(err => console.log(err.message));

//mount middleware
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('tiny'));

//set up routes
app.get('/', (req, res) => {
    res.render('index');
});

//render signup page
app.get('/new', (req, res) => {
    res.render('new');
});

//post for adding new user
app.post('/', (req, res, next) => {
    let user = new User(req.body);
    user.save()
        .then(() => {
            res.redirect('/login')
        })
        .catch(err => next(err));
});

//login form render
app.get('/login', (req, res) => {
    res.render('login');
});

// post login form
app.post('/login', (req, res) => {
    //authenticate user's login req
    let email = req.body.email;
    let password = req.body.password;

    //get the user that matches the email
    User.findOne({ email: email })
        .then(user => {
            if (user) {
                //user found as it's not null value
                user.comparePassword(password) //calling our custom method in user
                    .then(result => {
                        if (result)
                            res.redirect('/profile')
                        else {
                            console.log('wrong password')
                            res.redirect('/login');
                        }
                    })
                    .catch(err => next(err))
            }
            else {
                console.log('wrong email');
                res.redirect('/login');
            }
        })
        .catch(err => next(err));
})

app.use((req, res, next) => {
    let err = new Error('The server cannot locate ' + req.url);
    err.status = 404;
    next(err);

});

app.use((err, req, res, next) => {
    console.log(err.stack);
    if (!err.status) {
        err.status = 500;
        err.message = ("Internal Server Error");
    }

    res.status(err.status);
    res.render('error', { error: err });
});
