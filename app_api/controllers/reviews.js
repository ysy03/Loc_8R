const mongoose = require('mongoose');
const Loc = mongoose.model('Location');
const User = mongoose.model('User');

const getAuthor =(req,res,callback)=>{
    if(req.auth && req.auth.email){
        User.findOne({email:req.auth.email}).exec(
            (err,user)=>{
                if(!user){
                    return res.status(404).json({"message":"User not found"});
                }else if(err){
                    console.log(err);
                    return res.status.json(err);
                }
                callback(req,res,user.name);
            }
        )
    }
    else{
        return res.status(404).json({"message":"User not found"});
    }
}

const doAddReview =(req,res,location,author)=>{
    if(!location){
        res.status(404).json({"message":"Location is not Found_2021810042_유승엽"});
    }else{
        const{rating,reviewText} = req.body;
        location.reviews.push({
            author,
            rating,
            reviewText
        });
        location.save((err,location)=>{
            if(err){
                res.status(400).json(err)
            }else{
                updateAverageRating(location._id);
                const thisReview = location.reviews.slice(-1).pop();
                res.status(201).json(thisReview);
            }
        })
    }
}


const dosetAverageRating=(location)=>{
    console.log(location.reviews.length);
    if(location.reviews&&location.reviews.length>0){
        const count = location.reviews.length;
        const total = location.reviews.reduce((acc,{rating})=>{
            return acc+rating;
        },0)
    location.rating = parseInt(total/count,10);
    location.save(err=>{
        if(err){
            console.log(err);
        }else{
            console.log(`Average rating updated to ${location.rating}`)
        }
    })
}
}

const updateAverageRating =(locationid)=>{
    console.log(locationid)
    Loc.findById(locationid).select("rating reviews")
    .exec((err,location)=>{
        if(!err){
            console.log(location._id);
            dosetAverageRating(location);
        }
    })
}

const reviewsCreate = (req,res) =>{
    getAuthor(req,res,(req,res,username)=>{
    const locationid = req.params.locationid;
    if(locationid){
        Loc.findById(locationid).select("reviews")
        .exec((err,location)=>{
            if(err){
                res.status(400).json(err);
            }else{
                doAddReview(req,res,location,username);
            }
        })
    }else{
        res.status(404).json({"message":"Location not found"});
    }
    })
    
};
const reviewsReadOne = (req,res) =>{
    Loc
        .findById(req.params.locationid)
        .select('name reviews')
        .exec((err,location)=>{
            if(!location){
                return res
                    .status(404)
                    .json({"message":"location not found 2021810042_유승엽"});
            }else if(err){
                return res.status(404).json(err);
            }
            if(location.reviews && location.reviews.length > 0){
                const review = location.reviews.id(req.params.reviewid);

                if(!review){
                    return res
                    .status(404)
                    .json({"message":"review not found 2021810042_유승엽"});
                }else{
                    const response = {
                        location:{
                            name:location.name,
                            id: req.params.locationid
                        },
                        review
                    };

                    return res.status(200).json(response);
                }
            }
            else{
                return res.status(404).json({"message":"no reviews Found_2021810042_유승엽"})
            }
        })
};
const reviewsUpdateOne = (req,res) =>{
   if(!req.params.locationid||!req.params.reviewid){
        return res.status(404).json({"message":"not found,locationid and reviewid are both required!_2021810042_유승엽"});
   }
   Loc.findById(req.params.locationid).select('reviews')
   .exec((err,location)=>{
        if(!location){
            return res.status(404).json({"message":"Location not found"});
        }else if(err){
            return res.status(400).json(err);
        }
        if(location.reviews&&location.reviews.length>0){
            const thisReview = location.reviews.id(req.params.reviewid);
            if(!thisReview){
                res.status(404).json({"message":"review not found_2021810042_유승엽"})
            }else{
                thisReview.author = req.body.author;
                thisReview.rating = req.body.rating;
                thisReview.reviewText = req.body.reviewText;
                location.save((err,location)=>{
                    if(err){
                        return res.status(404).json(err);
                    }else{
                        updateAverageRating(location._id);
                        res.status(200).json(thisReview);
                    }
                })
            }
        }else{
            res.status(404).json({"message":"No review to update_2021810042_유승엽"});
        }
   })
};
const reviewsDelete = (req,res) =>{
    const{locationid,reviewid} =req.params;
    if(!locationid||!reviewid){
        return res.status(404).json({"message":"Not Found,location and reviewed are both required_2021810042_유승엽"});
    }
    Loc.findById(locationid).select('reviews')
    .exec((err,location)=>{
        if(!location){
            return res.status(404).json({"message":"Location not Found_2021810042_유승엽"});
        }else if(err){
            return res.status.json(err);
        }
        if(location.reviews && location.reviews.length>0){
            if(!location.reviews.id(reviewid)){
                return res.status(404).json({"message":"Review not Found_2021810042_유승엽"});
            }else{
                location.reviews.id(reviewid).remove();
                location.save(err=>{
                    if(err){
                        return res.status(404).json(err);
                    }else{
                        updateAverageRating(location._id);
                        res.status(204).json(null);
                    }
                })
            }
        }else{
            res.status.json({"message":"No review to delete_2021810042_유승엽"})
        }
    })
};

module.exports = {
    reviewsCreate,
    reviewsDelete,
    reviewsReadOne,
    reviewsUpdateOne
}