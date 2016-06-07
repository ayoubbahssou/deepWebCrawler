/**
 * Created by ayoub on 13/04/16.
 */
var express = require('express');
var request = require('request');
var cheerio = require('cheerio');
var _=require('underscore');
var builder = require('xmlbuilder');
var util = require('util');
var app     = express();
app.use(express.static(__dirname + '/public'));
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
app.get('/',function(req, res){
    res.render(index.html);
})
app.get('/getForm', function(req, res){
    var resObj={};
    resObj['name']='forms';
    resObj['children']=[];
    var counter=1;
    //URLs we're testing with
    url5='http://www.idealist.org/search/v2/advanced'
    url4='http://www.careerbuilder.com/jobseeker/jobs/jobfindadv.aspx';
    url3='https://accounts.google.com/SignUp?service=mail&continue=https%3A%2F%2Fmail.google.com%2Fmail%2F&ltmpl=default'
    url1='http://www.airfrance.com/MA/fr/local/process/standardbooking/SearchAction.do?';
    url2='http://www.booking.com/index.html?aid=309654;label=booking-be-en-emea-JOFDxcYL2n0dvFIqgaMlSQS63676439692:pl:ta:p1:p2812,000:ac:ap1t1:neg:fi:tikwd-22550641:lp1009974:li:dec:dm;ws=&gclid=Cj0KEQjw6My4BRD4ssKGvYvB-YsBEiQAJYd77et0hIUdPwnFJrAWKHX-MtO7nz4t-fqncbOYp2aVHA0aAraU8P8HAQ'
   var url=req.param('url')
    console.log(req.param('url'))
    request(url, function(error, response, html){
        if(!error){
            //console.log(req.body)
            //var html='<body><form><fieldset id="whereFields"><dl><dt><label>before</label></dt><dd><input type="text" class="locationAutocomplete text ui-autocomplete-input" name="search_location_name" id="advanced_search_location_name" autocomplete="off" role="textbox" aria-autocomplete="list" aria-haspopup="true"><input type="hidden" name="search_location" id="advanced_search_location" class="hidden"></dd></dl></fieldset></form></body></html>'
            var $ = cheerio.load(html);
            //var $ = cheerio.load('<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>Title</title></head><body> <form action="demo_form.asp"> <label>First name:</label> <div><input type="text" name="firstname" value="Mickey"></div><br>  <label>Last name</label>  <input type="text" name="lastname" value="Mouse"><br><br>  <label for="male">Male</label><input type="radio" name="gender" id="male" value="male"><br><label for="female">Female</label><input type="radio" name="gender" id="female" value="female"><br><label for="other">Other</label><input type="radio" name="gender" id="other" value="other"><br><br><input type="submit" value="Submit"></form></body></html>');
            /*
            for now we process all forms in the page
            we need to find a way to detect the more important form
            also we need to detect the form in case it's not included in the tag <form> (html<html5)
             */
            $('form').each(function(){
                console.log("a new form");

                var formDom = $(this);
                //this is the object that well contain the form information
                var formData = {};
                formData['name']='form '+counter;

                formData['children']=[]
                var addDataToFormData = function(key, value,source) {
                    data={};
                    //the type of the input.ex: text or multiple choices...
                    data['type'] = value;
                    //the source of the key.ex:from  a previous lebel (p)
                    data['source'] = source;
                    formData[key] =data;

                };
                //we'll process each input field
                formDom.find("input").each( function (index) {
                   // console.log('the input')
                   
                    //get the previous element

                    var prev=$(this).prev();
                    var parent=$(this).parent();
                    //get the parent's previous element
                    var prevparent=$(this).parent().prev();
                    //get the parent's parent's previous element (grand paarent :D)
                    var prevgparent=$(this).parent().parent().prev();
                    var label,source;
                   //check if the input fiel have a previous label/span/br tag
                    if(prev[0]  && prev[0].hasOwnProperty('name') && (prev[0].name=='label'|| prev[0].name=='span' || prev[0].name=='br')){
                        //the label of the inout field
                        label=prev.text().replace(/[\n\t\r]/g,"")
                        /*the source of the label
                        this will help us enhance the algorithm
                        n3erfo exactly where did we get the label from
                         */
                        //source=orevious
                        source='p'
                        //if not,then check if the input field's parent has a previous label/span/br tag
                    }else if(parent[0]  && parent[0].hasOwnProperty('name') && (parent[0].name=='label'|| parent[0].name=='span' || parent[0].name=='br')){
                        label=parent.text().replace(/[\n\t\r]/g,"")
                        //source=the Parent's Previous element PP
                        source='parent'
                        //if not then check if the input field has a previous label/span/br tag
                    }else if(prevparent[0]  && prevparent[0].hasOwnProperty('name') && (prevparent[0].name=='label'|| prevparent[0].name=='span' || prevparent[0].name=='br')){
                        label=prevparent.text().replace(/[\n\t\r]/g,"")
                        //source=the Parent's Previous element PP
                        source='pp'
                        //if not then check if the input field has a previous label/span/br tag
                    }else if(prevparent[0]  && prevparent.children().first()[0] &&prevparent.children().first()[0].hasOwnProperty('name') && (prevparent.children().first()[0].name=='label'|| prevparent.children().first()[0].name=='span' || prevparent.children().first()[0].name=='br')){
//                        label=prevparent.children().first().text().replace(/[\n\t\r]/g,"")
                        if(''!=prevparent.children().first().text()){
                            label=prevparent.children().first().text()
                        }
                        else{
                            //in this case the label tag contaings another tag(span,strong..)
                            label=prevparent.children().first().children().first().text()
                        }

                        //console.log(prevparent.children().first().children().first().text())
                        //source=the Parent's Previous element PP
                        source='ppfc'
                        //if not then check if the input field has a previous label/span/br tag
                    }else if(prevgparent[0]  && prevgparent[0].hasOwnProperty('name') && (prevgparent[0].name=='label'|| prevgparent[0].name=='span' || prevgparent[0].name=='br')){
                        label=prevgparent.text().replace(/[\n\t\r]/g,"")
                        //source=the Grand Parent's Previous element GPP

                        source='gpp'
                        //if not then we'll use the attribute name
                        //note to self:we should also consider using the attr id
                    }else{
                        label=$(this).attr("name")
                        //source=the attribut name of the inut field
                        source='attr'
                    }


                    var  fieldsetLookUp=$(this).parent();
                    while(fieldsetLookUp[0]  && fieldsetLookUp[0].hasOwnProperty('name') && fieldsetLookUp[0].name!='form' && fieldsetLookUp[0].name!='fieldset'){
                        fieldsetLookUp=fieldsetLookUp.parent();
                    }
                    if( fieldsetLookUp[0].name=='fieldset'){
                        var id;
                        console.log('this input belongs to a fieldset!');
                        if(fieldsetLookUp.attr('id')){
                            id=fieldsetLookUp.attr('id');
                        }else if(fieldsetLookUp.attr('class')){
                            id=fieldsetLookUp.attr('class');
                        }else{
                            fieldsetLookUp.attr('id',index);
                            id=index;
                            //console.log(fieldsetLookUp.html())
                        }
                        var cnt=0
                        while(cnt<formData.children.length){
                            if(formData.children[cnt].name!=id){
                                cnt++;
                            }else{
                                break
                            }

                        }
                        if(cnt==formData.children.length){
                            var child={}
                            child['name']=id;
                            child['children']=[]
                            formData.children.push(child);
                        }
                        if($(this).attr("type")=='radio'){
                            //in this case then the input type is multichoice
                            //check if we already handeled an input with the same name
                            //if no then we first create the array then we push the choice
                            //if yes add the new value to the choices' array
                           var cntt=0
                            while(cntt<formData.children[cnt].children.length){
                                if(formData.children[cnt].children[cntt].name!=$(this).attr("name")){
                                    cntt++;
                                }else{
                                    break
                                }

                            }
                            if(cntt==formData.children[cnt].children.length){
                                var child={}
                                child['name']=$(this).attr("name");
                                child['children']=[];
                                formData.children[cnt].children.push(child);
                            }

                            var child={};
                            child['name']=label;
                            child['source']=source;
                            //child['children']=[];
                            formData.children[cnt].children[cntt].children.push(child);

                        }else{
                            var type=''
                            if($(this).attr("type")=='hidden'){
                                type=' (hidden)'
                            }
                            //if($(this).attr("type")!='hidden'){
                            var child={};
                            child['type']=$(this).attr("type");
                            child['source']=source;
                            child['name']=label+type;
                          //  child['children']=[];
                            formData.children[cnt].children.push(child);
                            //}

                        }
                    }else{
                        console.log('this input doesn\'t belongs to a fieldset!');
                        if($(this).attr("type")=='radio'){
                            //in this case then the input type is multichoice
                            //check if we already handeled an input with the same name
                            //if no then we first create the array then we push the choice
                            //if yes add the new value to the choices' array
                            var cnt=0
                            while(cnt<formData.children.length){
                                if(formData.children[cnt].name!=$(this).attr("name")){
                                    cnt++;
                                }else{
                                    break
                                }

                            }
                            if(cnt==formData.children.length){
                                var child={}
                                child['name']=$(this).attr("name");
                                child['children']=[]
                                formData.children.push(child);
                            }
                            var child={};
                            child['name']=label;
                            child['source']=source;
                           // child['children']=[];
                            formData.children[cnt].children.push(child);
                        }
                        else{
                            //if it's not radio then we simply add it to the formData
                            //addDataToFormData(label,$(this).attr("type"),source);
                            var type=''
                            if($(this).attr("type")=='hidden'){
                                type=' (hidden)'
                            }
                            var child={};
                            child['type']=$(this).attr("type");
                            child['source']=source;
                            child['name']=label+type;
                            //child['children']=[];
                            formData.children.push(child);

                        }

                    }
                    
                    /*
                    we'll face some problems processing radio input and <select>
                    the if bellow treats the case of the input=radio
                    note to self:add <select> case
                     */

            });
                formDom.find("select").each( function () {
                    //console.log($(this).toString())

                    var prev=$(this).prev();
                    //get the parent's previous element
                    var prevparent=$(this).parent().prev();
                    //get the parent's parent's previous element (grand paarent :D)
                    var prevgparent=$(this).parent().parent().prev();
                    var label,source;
                    //check if the input fiel have a previous label/span/br tag
                    if(prev[0]  && prev[0].hasOwnProperty('name') && (prev[0].name=='label'|| prev[0].name=='span' || prev[0].name=='br')){
                        //the label of the inout field
                        label=prev.text().replace(/[\n\t\r]/g,"")
                        /*the source of the label
                         this will help us enhance the algorithm
                         n3erfo exactly where did we get the label from
                         */
                        //source=orevious
                        source='p'
                        //if not,then check if the input field's parent has a previous label/span/br tag
                    }else if(prevparent[0]  && prevparent[0].hasOwnProperty('name') && (prevparent[0].name=='label'|| prevparent[0].name=='span' || prevparent[0].name=='br')){
                        label=prevparent.text().replace(/[\n\t\r]/g,"")
                        //source=the Parent's Previous element PP
                        source='pp'
                        //if not then check if the input field has a previous label/span/br tag
                    }else if(prevgparent[0]  && prevgparent[0].hasOwnProperty('name') && (prevgparent[0].name=='label'|| prevgparent[0].name=='span' || prevgparent[0].name=='br')){
                        label=prevgparent.text().replace(/[\n\t\r]/g,"")
                        //source=the Grand Parent's Previous element GPP

                        source='gpp'
                        //if not then we'll use the attribute name
                        //note to self:we should also consider using the attr id
                    }else{
                        label=$(this).attr("name")
                        //source=the attribut name of the inut field
                        source='attr'
                    }

                    var  fieldsetLookUp=$(this).parent();
                    while(fieldsetLookUp[0]  && fieldsetLookUp[0].hasOwnProperty('name') && fieldsetLookUp[0].name!='form' && fieldsetLookUp[0].name!='fieldset'){
                        fieldsetLookUp=fieldsetLookUp.parent();
                    }
                    if( fieldsetLookUp[0].name=='fieldset'){
                        var id;
                        console.log('this input belongs to a fieldset!');
                        if(fieldsetLookUp.attr('id')){
                            id=fieldsetLookUp.attr('id');
                        }else if(fieldsetLookUp.attr('class')){
                            id=fieldsetLookUp.attr('class');
                        }else{
                            fieldsetLookUp.attr('id',index);
                            id=index;
                            //console.log(fieldsetLookUp.html())
                        }
                        var cnt=0
                        while(cnt<formData.children.length){
                            if(formData.children[cnt].name!=id){
                                cnt++;
                            }else{
                                break
                            }

                        }
                        if(cnt==formData.children.length){
                            var child={}
                            child['name']=id;
                            child['children']=[]
                            formData.children.push(child);
                        }

                        var children = $(this)['0'].children;
                        var optionsArray = [];
                        var options = children.map(function (i, option) {

                            if (i.name == 'option') {
                                var child={}
                                child['name']=i.children[0].data;
                                //child['children']=[];
                                optionsArray.push(child);
                                //console.log(i.children[0].data)
                            }

                            //return option.value;
                        });
                        var child={}
                        child['name']=label;
                        child['type']="select";
                        child['children']=optionsArray

                        formData.children[cnt].children.push(child);
                    }else {
                        var children = $(this)['0'].children;
                        var optionsArray = []
                        var options = children.map(function (i, option) {

                            if (i.name == 'option') {
                                var child={}
                                child['name']=i.children[0].data;
                                //child['children']=[];
                                optionsArray.push(child);
                            }

                            //return option.value;
                        });
                        var child={}
                        child['name']=label;
                        child['type']="select";
                        //child['children']=[];
                        child['children']=optionsArray;

                        formData.children.push(child);
                    }
                })

                console.log(formData);
                resObj.children.push(formData);
                counter++;

            })
        }else{
            console.log('oops!!check the internet cnx')
        }
    });

    setTimeout(function(){
        //console.log(resObj)
        var root = builder.create('xs:element',{'name': 'forms'});
        var complexType=root.ele('xs:complexType');
        var sequence=complexType.ele('xs:sequence');
       for(var i = 0; i <resObj.children.length ; i++)
        {
            var form = sequence.ele('xs:element',{'name':'form '+i+1});
            var complexType=form.ele('xs:complexType');
            var sequence=complexType.ele('xs:sequence');
            for(var j= 0; j <resObj.children[i].children.length ; j++){
                if (resObj.children[i].children[j].hasOwnProperty('children')){
                    if(resObj.children[i].children[j].type!='select'){
                        //then it's a fieldset
                        var fieldset = sequence.ele('xs:element',{'name':resObj.children[i].children[j].name});
                        var complexType=fieldset.ele('xs:complexType');
                        var sequence=complexType.ele('xs:sequence');
                        for(var k= 0; k <resObj.children[i].children[j].children.length ; k++) {
                            if(resObj.children[i].children[j].children[k].type=='select'){
                                var select = sequence.ele('xs:element',{'name':resObj.children[i].children[j].children[k].name});
                                var simpleType=select.ele('xs:simpleType');
                                var restriction=simpleType.ele('xs:restriction',{'base':'xs:string'});
                                for(var l= 0; l <resObj.children[i].children[j].children[k].children.length ; l++) {
                                    var enumeration=restriction.ele('xs:enumeration',{'value':resObj.children[i].children[j].children[k].children[l].name})
                                }
                            }else{
                                var element=sequence.ele('xs:element');
                                element.att('name',resObj.children[i].children[j].children[k].name);
                                element.att('type','xs:string')
                            }
                        }
                    }else{
                        //it's a select not a fieldset
                        var select = sequence.ele('xs:element',{'name':resObj.children[i].children[j].name});
                        var simpleType=select.ele('xs:simpleType');
                        var restriction=simpleType.ele('xs:restriction',{'base':'xs:string'});
                        for(var l= 0; l <resObj.children[i].children[j].children.length ; l++) {
                            var enumeration=restriction.ele('xs:enumeration',{'value':resObj.children[i].children[j].children[l].name})
                        }
                    }
                }else{
                    //it's a simple element'
                    var element=sequence.ele('xs:element');
                    element.att('name',resObj.children[i].children[j].name);
                    element.att('type','xs:string')
                }

            }
        }
        console.log(root.toString());
        res.json(resObj); }, 6000);
  /*
  * <xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema"
   targetNamespace="http://www.w3.com"
   xmlns="http://www.w3.com" elementFormDefault="qualified">
   <xs:element name="Personne">
   <xs:complexType>
   <xs:sequence>
   <xs:element name="nom" type="xs:string"/>
   <xs:element name="prenom" type="xs:string"/>
   <xs:element name="poids" type="xs:integer"/>
   <xs:element name="taille" type="xs:float"/>
   <xs:element name="ddn" type="xs:date"/>
   <xs:element name="adresse" type="xs:string"/>
   </xs:sequence>
   </xs:complexType>
   </xs:element>
   </xs:schema>
  * */


});
app.set('port', (process.env.PORT || 8082));
/*app.listen('8082')
console.log('Magic happens on port 8082');*/
app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});



