var express = require('express');
var router = express.Router();
const ctrlOthers = require("../contorllers/other");
const ctrlLocations = require("../contorllers/locations");

/* Locations page. */
router.get('/', ctrlLocations.homelist);
router.get("/location/:locationid",ctrlLocations.locationInfo);
router
    .route('/location/:locationid/review/new')
    .get(ctrlLocations.addReview)
    .post(ctrlLocations.doAddReview);

/*other pages*/
router.get("/about",ctrlOthers.about);

module.exports = router;
