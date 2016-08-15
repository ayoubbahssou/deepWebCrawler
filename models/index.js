var mongoose = require('mongoose');
var q = require('q');
var mongoose = require('mongoose');
//var    autoIncrement = require('mongoose-auto-increment');

mongoose.connect('mongodb://localhost:27017/dwc');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  // we're connected!
	console.log('succesfully connected!!');
});
var keyWordSchema= mongoose.Schema({
     label:String,
     domain:String,
     possibleValues:[String]
});


var Keyword= mongoose.model('keyword', keyWordSchema);
var save=function(obj,cb) {
    var kw = new Keyword(obj);
    kw.save(function (err, kw) {
        if (err) return cb(err);
        cb(null,kw);
    });
};
//test if save works
/*save({label: 'job', domain: 'job'},function (err,res){
 if(err)console.log('failed');
 console.log(res.toString())
 });
save({label: 'Job', domain: 'job'},function (err,res){
    if(err)console.log('failed');
    console.log(res.toString())
});*/
exports.getDomainName=function(label) {

    var deferred = q.defer();
    Keyword.findOne({'label': label}, function (err, res) {

        if (err) {
            deferred.reject(new Error(err));
            console.log(err);

        }
        if (res == undefined) {
            console.log('no domain name for this keyword');
            deferred.resolve(false);
        }
        if (res) {

                deferred.resolve(res.domain)
            }
       
    });
    return deferred.promise;
};
/*
getDomainName('Job').then(function (res) {
    console.log(res);
});*/
