/**
 * Created by ayoub on 13/04/16.
 */
var express = require('express');
var request = require('request');
var cheerio = require('cheerio');
var _=require('underscore')
var util = require('util');
var app     = express();
//app.use(express.static(path.join(__dirname, 'public')));
app.get('/',function(req, res){
    res.render(index.html);
})
//app.get('/getForm', function(req, res){
    var resObj={};
    var counter=0;
    //URLs we're testing with
    url4='http://www.careerbuilder.com/jobseeker/jobs/jobfindadv.aspx';
    url3='https://accounts.google.com/SignUp?service=mail&continue=https%3A%2F%2Fmail.google.com%2Fmail%2F&ltmpl=default'
    url1='http://www.airfrance.com/MA/fr/local/process/standardbooking/SearchAction.do?';
    url2='http://www.booking.com/index.html?aid=309654;label=booking-be-en-emea-JOFDxcYL2n0dvFIqgaMlSQS63676439692:pl:ta:p1:p2812,000:ac:ap1t1:neg:fi:tikwd-22550641:lp1009974:li:dec:dm;ws=&gclid=Cj0KEQjw6My4BRD4ssKGvYvB-YsBEiQAJYd77et0hIUdPwnFJrAWKHX-MtO7nz4t-fqncbOYp2aVHA0aAraU8P8HAQ'
    request(url4, function(error, response, html){
        if(!error){
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
                var addDataToFormData = function(key, value,source) {
                    data={};
                    //the type of the input.ex: text or multiple choices...
                    data['type'] = value;
                    //the source of the key.ex:from  a previous lebel (p)
                    data['source'] = source;
                    formData[key] =data;

                };
                //we'll process each input field
                formDom.find("input").each( function () {
                   // console.log('the input')
                    //get the previous element
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
                    /*
                    we'll face some problems processing radio input and <select>
                    the if bellow treats the case of the input=radio
                    note to self:add <select> case
                     */
                     if($(this).attr("type")=='radio'){
                            //in this case then the input type is multichoice
                            //check if we already handeled an input with the same name
                            //if no then we first create the array then we push the choice
                            //if yes add the new value to the choices' array
                            if(!($(this).attr("name") in formData)){
                                formData[$(this).attr("name")]=[];
                                var data={};
                                data['value']=label;
                                data['source']=source;
                                formData[$(this).attr("name")].push(data);
                            }
                            else{
                                var data={};
                                data['value']=label;
                                data['source']=source;
                                formData[$(this).attr("name")].push(data);
                            }
                        }
                        else{
                            //if it's not radio then we simply add it to the formData
                            addDataToFormData(label,$(this).attr("type"),source);
                        }

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

                    var children=$(this)['0'].children;
                    var optionsArray=[]
                    var options = children.map(function(i,option) {

                        if(i.name=='option') {
                            optionsArray.push(i.children[0].data)
                            //console.log(i.children[0].data)
                     }

                       //return option.value;
                    });
                    formData[label]=optionsArray;
                })

                console.log(formData);
                resObj[counter]=formData;
                counter++;
                //res.send(formData)
            })
        }
        else{
            console.log('oops!!check the internet cnx')
        }
    });
   // res.send(resObj)
//});

app.listen('8081')
console.log('Magic happens on port 8081');

