/**
 * Created by ayoub on 13/04/16.
 */
var express = require('express');
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');

var app     = express();
//app.get('/getForm', function(req, res){
    console.log("got here");
    //url='http://www.airfrance.com/MA/fr/local/process/standardbooking/SearchAction.do?';
    url='http://www.booking.com/index.html?aid=309654;label=booking-be-en-emea-JOFDxcYL2n0dvFIqgaMlSQS63676439692:pl:ta:p1:p2812,000:ac:ap1t1:neg:fi:tikwd-22550641:lp1009974:li:dec:dm;ws=&gclid=Cj0KEQjw6My4BRD4ssKGvYvB-YsBEiQAJYd77et0hIUdPwnFJrAWKHX-MtO7nz4t-fqncbOYp2aVHA0aAraU8P8HAQ'
    //request(url, function(error, response, html){
      //  if(!error){
           // var $ = cheerio.load(html);
            var $ = cheerio.load('<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>Title</title></head><body> <form action="demo_form.asp"> <label>First name:</label> <div><input type="text" name="firstname" value="Mickey"><div><br>  <label>Last name</label>  <input type="text" name="lastname" value="Mouse"><br><br>  <label for="male">Male</label><input type="radio" name="gender" id="male" value="male"><br><label for="female">Female</label><input type="radio" name="gender" id="female" value="female"><br><label for="other">Other</label><input type="radio" name="gender" id="other" value="other"><br><br><input type="submit" value="Submit"></form></body></html>');
            var title, release, rating;
            var json = { title : "", release : "", rating : ""};

            // We'll use the unique header class as a starting point.

    console.log("before the selector");
            $('form').filter(function(){
                console.log("in the selector");

                var formDom = $(this);
                var formData = {};
                //console.log('formDom is: '+formDom);
                var addDataToFormData = function(key, value) {
                    formData[key] = value;
                };
                console.log(formDom);
                formDom.find("input").each( function () {
                    console.log('the input')
                    var prev=$(this).prev()

                    //console.log(typeof(prev));
                    //console.log(prev[0].name);
             //       console.log(prev.text());
                    //condition ? expr1 : expr2
                    if(prev[0]  && prev[0].hasOwnProperty('name') && (prev[0].name=='label'|| prev[0].name=='span' || prev[0].name=='br')){
                        if($(this).attr("type")=='radio'){
                            //if ('key' in myObj)
                            if(!($(this).attr("name") in formData)){
                                formData[$(this).attr("name")]=[];
                                formData[$(this).attr("name")].push($(this).val());
                            }
                            else{
                                formData[$(this).attr("name")].push($(this).val());
                            }
                        }
                        else{
                            //var type= $(this).attr("type")=='radio' ? 'multiple choices':$(this).attr("type");
                            //addDataToFormData($(this).attr("name"),type);
                            addDataToFormData(prev.text(),$(this).attr("type"));
                        }
                    }
                    else{
                    if($(this).attr("type")=='radio'){
                        //if ('key' in myObj)
                        if(!($(this).attr("name") in formData)){
                            formData[$(this).attr("name")]=[];
                            formData[$(this).attr("name")].push($(this).val());
                        }
                        else{
                            formData[$(this).attr("name")].push($(this).val());
                        }
                    }
                    else{
                    //var type= $(this).attr("type")=='radio' ? 'multiple choices':$(this).attr("type");
                    //addDataToFormData($(this).attr("name"),type);
                    addDataToFormData($(this).attr("name"),$(this).attr("type"));
                    }
                }
            });

                console.log("fghfgh");
                console.log(formData);
                //res.send(children)
            })
        /*}
        else{
            console.log('oops!!')
        }
    })*/
//});

app.listen('8081')
console.log('Magic happens on port 8081');

