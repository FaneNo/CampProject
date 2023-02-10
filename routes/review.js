const express = require('express');
//const { route } = require('./campground');
const router = express.Router({mergeParams: true});
const {validateReview, isLoggedIn, isReviewAuthor} = require('../middleware')
const catchAsync = require('../ultilities/catchAsync');
const Campground = require('../models/campground');
const Review = require('../models/review');
const expressError = require('../ultilities/expressError');
const {campgroundSchema, reviewSchema} = require('../schemas.js');


router.post('/',isLoggedIn,validateReview, catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    campground.review.push(review);
    await review.save();
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);

}));

router.delete('/:reviewID',isLoggedIn,isReviewAuthor, catchAsync(async (req, res) => {
    const {id, reviewID} = req.params;
    await Campground.findByIdAndUpdate(id,{$pull: {review: reviewID}});
    await Review.findByIdAndDelete(reviewID);
    res.redirect(`/campgrounds/${id}`);
}))


module.exports = router;
