const express = require('express');
const router = express.Router();
const {expressjwt: jwt} = require('express-jwt');
const auth = jwt({
    secret: process.env.JWT_SECRET,
    algorithms:['HS256'],
    userProperty:'req.auth'
})
const ctrlLocations = require('../controllers/locations');
const ctrlReviews = require("../controllers/reviews");
const ctrlAuth = require("../controllers/authrntication");

router.post('/register',ctrlAuth.regiser);
router.post('/login',ctrlAuth.login);

router
    .route("/locations")
    .get(ctrlLocations.locationsListbyDistance)
    .post(ctrlLocations.locationsCreate);
router
    .route('/locations/:locationid')
    .get(ctrlLocations.locationsReadOne)
    .put(ctrlLocations.locationsUpdateOne)
    .delete(ctrlLocations.locationsDeleteOne);
router
    .route('/locations/:locationid/reviews')
    .post(auth,ctrlReviews.reviewsCreate);
router
    .route('/locations/:locationid/reviews/:reviewid')
    .get(ctrlReviews.reviewsReadOne)
    .put(auth,ctrlReviews.reviewsUpdateOne)
    .delete(auth,ctrlReviews.reviewsDelete)

module.exports =router;