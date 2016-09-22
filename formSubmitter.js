
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
    var pathArray = casper.cli.args[0].split( '/' );
   var  targetWebSite = pathArray[2];
var data  = JSON.parse(fs.read(targetWebSite+ ' form structure'));
    
    
//utils.dump(data);

this.echo(casper.cli.args[2]);  
var formNumber=parseInt(casper.cli.args[1])-1
this.echo(formNumber);
switch(casper.cli.args[2]){
 case "default": 
     this.fill('form[action="'+data[formNumber].action+'"]', {}, true);

     break;
  case "onlyOneByOne":
var lat= data[formNumber].lat
var long= data[formNumber].long
var len=data[formNumber].coordinates.length;
   if(data[formNumber].lat==data[formNumber].coordinates[long]){
       //we reached the last option
       //move on to the next multichoice input
       //set the counter to 0
       data[formNumber].lat=-1;
       //check if we reached the last multichoice input
       //if so,we go back to the first one
       if(len<=long){
           data[formNumber].long=0
       }else{
       data[formNumber].long++;
}
   }
  data[formNumber].lat++;
      //now we fill the form
      var formFiller={};
      formFiller[data[formNumber].definedChoices[long].tagName]=data[formNumber].definedChoices[long].options[lat]
this.echo(formFiller)
fs.write(targetWebSite+ ' form structure', JSON.stringify(data), 'w');
fs.write(targetWebSite, JSON.stringify(formFiller), 'w');
      this.fill('form[action="'+data[formNumber].action+'"]', formFiller, true);

    break;

}
     //this.fill('form[action="'+data[formNumber].action+'"]', {}, true);
});

casper.then(function() {
   this.echo(this.getTitle());
});

casper.run(function() {
 this.echo(this.getTitle());
 this.capture('ae.png');
});




