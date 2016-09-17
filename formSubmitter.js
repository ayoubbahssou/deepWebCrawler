
var casper = require('casper').create({
    verbose: true,
 logLevel: 'debug'
});

var fs = require('fs');
var utils = require('utils');
//'http://www.idealist.org/search/v2/advanced'
casper.start(casper.cli.args[0], function() {
    // search for 'casperjs' from google form
 this.echo(this.getTitle());
var data  = JSON.parse(fs.read('inde.js'));
//utils.dump(data);

//this.echo(data.selects);  
var formNumber=parseInt(casper.cli.args[1])-1
switch(casper.cli.args[2]){
 case "":
  
    break;
  case "":
   
    break;
}
  this.fill('form[action="'+data[formNumber].action+'"]', { 'search_asset_type':'job' }, true);
});

casper.then(function() {
  
});

casper.run(function() {
 this.echo(this.getTitle());
 this.capture('ae.png');
});



