const request = require('request');

const apiOption = {
    server: 'http://localhost:3000'
};

if(process.env.NODE_ENV === "production"){
    apiOption.server = "https://loc-8r-api.onrender.com";
}

const formatDistance = (distance)=>{
    let thisDistance = 0;
    let unit='m';
    if(distance>1000){
        thisDistance = parseFloat(distance/1000).toFixed(1);
        unit = 'km';
    }else{
        thisDistance = Math.floor(distance);
    }
    return thisDistance + unit;
};

/*get 'home' page*/
const homelist = (req,res)=>{
    const path = `/api/locations`;
    const requestOptions = {
        url:`${apiOption.server}${path}`,
        method: 'get',
        json:{},
        qs:{
            lat:36.9923,
            lng:127.1126,
            maxdistnce:200000
        }
    };
    request(
        requestOptions,
        (err,{statusCode},body)=>{
            console.log("1"+body.length);
            let data = [];
            if(statusCode === 200 && body.length){
            data = body.map((item)=>{
                item.distance = formatDistance(item.distance);
                return item;
            })
        };
            renderHomepage(req,res,data);
        }
    )
};

const renderHomepage = (req,res,responsebody)=>{
    console.log(responsebody);
    let message = null;
    if(!(responsebody instanceof Array)){
        message = "API Lookup error";
        responsebody = [];
    }else{
        if(!responsebody.length){
            message = "No places found nearby";
        }
    }
    res.render('locations-list',{
        title:'Loc8r - find a place to work with wifi',
        pageHeader:{
            title:'Loc8r',
            strapline:"FInd places to work with wifi near you!!"
        },
        sidebar:"Looking for wifi and a seat? Loc8r helps you find a places to work \
        when out and about. Perhaps with coffee, cake or a pint? \
        Let Loc8r help you find the place you're looking for. ",
        locations:responsebody,
        message
    });
};

/*get 'locatipon info' page*/
const getlocationInfo = (req,res,callback)=>{
    const path = `/api/locations/${req.params.locationid}`;
    const requestOption = {
        url: `${apiOption.server}${path}`,
        method: "get",
        json:{}
    };
    request(
        requestOption,
        (err,{statusCode},body)=>{
            const data = body;
            if(statusCode === 200){
            if("type" in data.coords){
                data.coords={
                    lng:body.coords.coordinates[0],
                    lat:body.coords.coordinates[1]
                }}
            else{
                data.coords={
                    lng:body.coords[0],
                    lat:body.coords[1]
                }
            }
            callback(req,res,data);
        }
        else{
            showError(req, res, statusCode);
        }
        }
    )
};

const showError = (req,res,status)=>{
    let title="";
    let content = '';
    if(status === 404){
        title = '404, page not found';
        content = "Oh deer. Looks like you can\'t find this page. Sorry"
    }else{
        title = `${status}, something's gone wrong`
        content = 'Something, somewhere, has gone just a little bit wrong.';
    }
    res.status(status);
    res.render('generic-text',{
        title,
        content
    })
}

const locationInfo = (req,res)=>{
    getlocationInfo(req,res,(req,res,responseData)=>renderDetailPage(req,res,responseData));
}

/*get 'Add review' Page*/
const addReview = (req,res)=>{
    getlocationInfo(req,res,(req,res,responseData)=>renderReviewForm(req,res,responseData));
}

const renderDetailPage = (req,res,location)=>{
    res.render('location-info',
        {
            title:location.name,
            pageHeader:{title: location.name},
            sidebar:{
                context: ' is on Loc8r because it has accessible wifi and space to sit down with laptop and get some work done',
                callToAction:'If you\'ve been and  you like it or if you don\'t please leave a review to help other people just like you.'
            },
            location
        }
    )

}
 
const renderReviewForm = function(req,res,{name}){
    console.log(name);
    res.render('location-review-form',{
        title: `Review${name} on Loc8r`,
        pageHeader: {title:`Review ${name}`},
        error: req.query.err
    })
}

const doAddReview = (req,res)=>{
    const locationid = req.params.locationid;
    const path = `/api/locations/${locationid}/reviews`;
    const postData = {
        author: req.body.name,
        rating:parseInt(req.body.rating,10),
        reviewText: req.body.review
    };
    const requestOption = {
        url: `${apiOption.server}${path}`,
        method:"POST",
        json: postData
    };
    request(
        requestOption,
        (err,{statusCode},{name})=>{
            if(statusCode == 201){
                res.redirect(`/location/${locationid}`);

            }else if(statusCode === 400 && name && name === 'ValidationError'){
                res.redirect(`/location/${locationid}/review/new?err=val`);
            }
            else{
                showError(req,res,statusCode);
            }
        }
    )
}

module.exports={
    homelist,
    locationInfo,
    addReview,
    doAddReview
}