const express = require('express');
const app = express();
const path = require('path');
const ejsMate = require('ejs-mate');
const catchAsync = require('./ultilities/catchAsync');
const expressError = require('./ultilities/expressError');
const Joi = require('joi');
const Review = require('./models/review');
const methodOverride = require('method-override');
const mongoose = require('mongoose');
const Campground = require('./models/campground');
const session = require('express-session');
const flash = require('connect-flash');
const campgroundsRoutes = require('./routes/campground');
const reviewsRoutes = require('./routes/review');
const User = require('./models/user');
const userRoutes = require('./routes/users');
const passport = require('passport');
const localStrategy = require('passport-local');
const campground = require('./models/campground');


mongoose.set('strictQuery', true);
mongoose.connect('mongodb://127.0.0.1:27017/camp');

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Connected");
});

app.use(express.urlencoded({extended: true}));
app.set('views', path.join(__dirname, 'views'));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));


const sessionConfig = {
    secret: 'thisisasecret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}

app.use(session(sessionConfig))
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use((req, res, next) => {
    
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
});


app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');



app.use('/', userRoutes);
app.use('/campgrounds/', campgroundsRoutes);
app.use('/campgrounds/:id/reviews', reviewsRoutes);



app.get('/', async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', {campgrounds});
});




app.all('*', (req, res, next) => {
    next(new expressError('Page not found', 404));
})

app.use((err,req, res, next) =>{
    const {statusCode = 500} = err;
    if (!err.message) error.message = 'Oh No, Something Went Wrong!'
    res.status(statusCode).render('error', {err});
});

app.listen(3000, () => {
    console.log('Port 3000');
});
