const mongoose = require("mongoose");
const Loc = mongoose.model('Location');

const locationsReadOne = (req,res)=>{
    Loc
        .findById(req.params.locationid)
        .exec((err,location)=>{
            if(!location){
                return res
                    .status(404)
                    .json({'message': 'Location not found_2021810042_유승엽'});//입력한 아이디에 location이 없는경우
            }else if(err){
                return res.
                    status(404)
                    .json(err);//특정 이유로 에러가 발생한 경우
            }
            res.
                status(200)
                .json(location);//성공한 경우
        });
};

const locationsListbyDistance = async (req,res) =>{
    const lng = parseFloat(req.query.lng);
    const lat = parseFloat(req.query.lat);
    const near = {
        type:"Point",
        coordinates:[lng,lat]
    }
    const geoOptions = {
        distanceField:"distance.calculated",
        key:"coords",
        spherical: true,
        maxDistance:200000
    }
    if(!lng||!lat){
        return res.status(404).json({"message":"lng and lat query parameters are required_2021810042_유승엽"})
    }
    try{
        const results = await Loc.aggregate([
            {
                $geoNear:{
                    near,...geoOptions
                }
            }
        ]);
        const locations = results.map(result =>{
            return{
                _id:result._id,
                name:result.name,
                address:result.address,
                rating:result.rating,
                facilities:result.facilities,
                distance:`${result.distance.calculated.toFixed()}`
            }
        });
        res.status(200).json(locations);
    }catch(err){
        res.status(404).json(err);
    }
};

const locationsCreate = (req,res) =>{
    Loc.create(
        {
            name:req.body.name,
            address:req.body.address,
            facilities:req.body.facilities.split(","),
            coords:{
                type:"Point",
                coordinates:[
                    parseFloat(req.body.lng),
                    parseFloat(req.body.lat)
                ]
            },
            openingTimes:[
                {
                    days:req.body.days1,
                    opening:req.body.opening1,
                    closing:req.body.closing1,
                    closed:req.body.closed1
                },{
                    days:req.body.days2,
                    opening:req.body.opening2,
                    closing:req.body.closing2,
                    closed:req.body.closed2
                }

            ]

        },(err,location)=>{
            if(err){
                res.status(400).json(err);
            }else{
                res.status(201).json(location)
            }
        }
    )
};
const locationsUpdateOne = (req,res) =>{
    if(!req.params.locationid){
        return res.status(404).json({"message":"not found, locationid is required_2021810042_유승엽"});
    }
    Loc.findById(req.params.locationid).select('-reviews -rating')
    .exec((err,location)=>{
        if(!location){
            return res.status(404).json({"message":"location not found_2021810042_유승엽"});
        }else if(err){
            return res.status(400).json(err);
        }
        location.name = req.body.name;
        location.address = req.body.address;
        location.facilities = req.body.facilities.split(',');
        location.coords = [
            parseFloat(req.body.lng),
            parseFloat(req.body.lat)
        ];
        location.openingTimes=[{
            days:req.body.days1,
            opening:req.body.opening1,
            closing: req.body.closing1,
            closed:req.body.closed1
        },{
            days:req.body.days2,
            opening:req.body.opening2,
            closing:req.body.closing2,
            closed:req.body.closed2
        }];
        location.save((err,loc)=>{
            if(err){
                res.status(404).json(err);
            }else{
                res.status(404).json(loc);
            }
        })
    })
};
const locationsDeleteOne = (req,res) =>{};

module.exports={
    locationsCreate,
    locationsDeleteOne,
    locationsListbyDistance,
    locationsReadOne,
    locationsUpdateOne
}