/**
 * Created by ayoub on 13/04/16.
 */
var express = require('express');
var request = require('request');
var cheerio = require('cheerio');
var _=require('underscore');
var builder = require('xmlbuilder');
var util = require('util');
var fs=require('fs');
var kw=require('./models');
var mysql      = require('mysql');
var connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : 'dimasql007',
    database : 'dwcdb'
});

connection.connect();

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
app.get('/formSubmitter',function(req, res){
    res.render('formSubmitter.html')
})
app.get('/getForm', function(req, res){
    var resObj={};
    var hideHiddenElements=req.query['hideHiddenElements'];
   // console.log(hideHiddenElements)
    resObj['name']='forms';
    resObj['children']=[];
    var formStructures=[];
    var counter=1;
    //URLs we're testing with
    url5='http://www.idealist.org/search/v2/advanced'
    url4='http://www.careerbuilder.com/jobseeker/jobs/jobfindadv.aspx';
    url3='https://accounts.google.com/SignUp?service=mail&continue=https%3A%2F%2Fmail.google.com%2Fmail%2F&ltmpl=default'
    url1='http://www.airfrance.com/MA/fr/local/process/standardbooking/SearchAction.do?';
    url2='http://www.booking.com/index.html?aid=309654;label=booking-be-en-emea-JOFDxcYL2n0dvFIqgaMlSQS63676439692:pl:ta:p1:p2812,000:ac:ap1t1:neg:fi:tikwd-22550641:lp1009974:li:dec:dm;ws=&gclid=Cj0KEQjw6My4BRD4ssKGvYvB-YsBEiQAJYd77et0hIUdPwnFJrAWKHX-MtO7nz4t-fqncbOYp2aVHA0aAraU8P8HAQ'
   var url=req.query['url']
    console.log(url)
    request(url, function(error, response, html){
        if(!error){
            //console.log(req.body)
            //var html='<body><form><fieldset id="whereFields"><dl><dt><label>before</label></dt><dd><input type="text" class="locationAutocomplete text ui-autocomplete-input" name="search_location_name" id="advanced_search_location_name" autocomplete="off" role="textbox" aria-autocomplete="list" aria-haspopup="true"><input type="hidden" name="search_location" id="advanced_search_location" class="hidden"></dd></dl></fieldset></form></body></html>'
          //get a list of all the words in the page
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
                //prepare the json for casper js
                var formStructure={};
                var selects=[];
                var radios=[];
                var simpleInputs=[];



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

                    var name=$(this).attr("name");



                    //get the previous element
                    if ($(this).attr("type")=='hidden' &&  hideHiddenElements=='true')
                    {
                        return true;
                    }


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
                                var radio={}
                                radio['tagName']=$(this).attr("name");
                                radio['name']=label;
                                radio['options']=[]
                                radios.push(radio)
                                formData.children[cnt].children.push(child);
                            }
                            var child={};
                            child['name']=label;
                            child['source']=source;
                          /*  var input={}

                            input["name"]=label;
                            input['tagName']=name;*/
                           
                            //child['children']=[];
                            formData.children[cnt].children[cntt].children.push(child);
                            radios[cntt].options.push($(this).attr("value"));
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
                            var input={}

                            input["name"]=label;
                            input['tagName']=name;

                            //  child['children']=[];
                            formData.children[cnt].children.push(child);
                            simpleInputs.push(input);
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
                                var radio={}
                                radio['tagName']=$(this).attr("name");
                                radio['name']=label;
                                radio['options']=[]
                                radios.push(radio)
                                child['name']=$(this).attr("name");

                                child['children']=[]
                                formData.children.push(child);
                            }
                            var child={};
                            child['name']=label;
                            child['source']=source;
/*                            var input={}

                            input["name"]=label;
                            input['tagName']=name;*/

                            // child['children']=[];
                            formData.children[cnt].children.push(child);
                            radios[cnt].options.push($(this).attr("value"));
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

                            var input={}

                            input["name"]=label;
                            input['tagName']=name;

                            //child['children']=[];
                            formData.children.push(child);
                            simpleInputs.push(input);
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
                    var name=$(this).attr("name");
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
                        var selectOptions=[]

                        var options = children.map(function (i, option) {

                            if (i.name == 'option') {
                                var child={}
                                child['name']=i.children[0].data;
                                //child['children']=[];
                                optionsArray.push(child);
                                selectOptions.push(i.children[0].data)
                                //console.log(i.children[0].data)
                            }

                            //return option.value;
                        });
                        var child={}
                        var input={}
                        child['name']=label;
                        child['type']="select";
                        child['children']=optionsArray
                        input["name"]=label;
                        input['tagName']=name;
                        input["options"] =selectOptions;



                        formData.children[cnt].children.push(child);
                        selects.push(input);
                    }else {
                        var children = $(this)['0'].children;
                        var optionsArray = []
                        var selectOptions=[]
                        var options = children.map(function (i, option) {

                            if (i.name == 'option') {
                                var child={}
                                child['name']=i.children[0].data;
                                //child['children']=[];
                                optionsArray.push(child);
                                selectOptions.push(i.children[0].data)

                            }

                            //return option.value;
                        });
                        var child={}
                        var input={}

                        child['name']=label;
                        child['type']="select";
                        //child['children']=[];
                        child['children']=optionsArray;
                       input["name"]=label;
                        input['tagName']=name;
                        input["options"] =selectOptions;

                        formData.children.push(child);
                        selects.push(input);

                    }
                })
                formStructure ["definedChoices"]=selects;
                formStructure["simpleInputs"]=simpleInputs;
          //      formStructure["radios"]=radios;

                formStructure ["definedChoices"].push.apply(formStructure ["definedChoices"],radios);
                formStructure["action"]=$(this).attr("action");
                //create the counters
                var coordinates=[]
                for(var i=0;i<formStructure.definedChoices.length;i++){
                 coordinates[i]=formStructure.definedChoices[i].options.length;
                }
                formStructure.coordinates=coordinates;
                formStructure['lat']=0;
                formStructure['long']=0;
                formStructure['coorx']=0;
                formStructure['coory']=0;
                formStructures.push(formStructure);
               // console.log(formData);
                resObj.children.push(formData);
                counter++;

            })
        }else{
            console.log('oops!!check the internet cnx')
        }
    });

    setTimeout(function(){

        var schema = builder.create('xs:schema')
           /* ,{
            'xmlns':"http://www.w3.org/2001/XMLSchema",
            'targetNamespace':"http://www.w3.com",
            'xmlns':"http://www.w3.com",
            'elementFormDefault':"qualified"
        });*/
        schema.att('xmlns',"http://www.w3.org/2001/XMLSchema");
        schema.att('targetNamespace',"http://www.w3.com")
        schema.att('xmlns',"http://www.w3.com")
        schema.att('elementFormDefault',"qualified")

        var root=schema.ele('xs:element',{'name': 'forms'});

        var complexType=root.ele('xs:complexType');
        var sequence=complexType.ele('xs:sequence');
       for(var i = 0; i <resObj.children.length ; i++)
        {
            var form = sequence.ele('xs:element',{'name':resObj.children[i].name});
            var complexType1=form.ele('xs:complexType');
            var sequence1=complexType1.ele('xs:sequence');
            for(var j= 0; j <resObj.children[i].children.length ; j++){
                if (resObj.children[i].children[j].hasOwnProperty('children')){
                    if(resObj.children[i].children[j].type!='select'){
                        //then it's a fieldset
                        var fieldset = sequence1.ele('xs:element',{'name':resObj.children[i].children[j].name});
                        var complexType2=fieldset.ele('xs:complexType');
                        var sequence2=complexType2.ele('xs:sequence');
                        for(var k= 0; k <resObj.children[i].children[j].children.length ; k++) {
                            if(resObj.children[i].children[j].children[k].type=='select'){
                                var select = sequence2.ele('xs:element',{'name':resObj.children[i].children[j].children[k].name});
                                var simpleType2=select.ele('xs:simpleType');
                                var restriction=simpleType2.ele('xs:restriction',{'base':'xs:string'});
                                for(var l= 0; l <resObj.children[i].children[j].children[k].children.length ; l++) {
                                    var enumeration=restriction.ele('xs:enumeration',{'value':resObj.children[i].children[j].children[k].children[l].name})
                                }
                            }else{
                                var element=sequence2.ele('xs:element');
                                element.att('name',resObj.children[i].children[j].children[k].name);
                                element.att('type','xs:string')
                            }
                        }
                    }else{
                        //it's a select not a fieldset
                        var select = sequence1.ele('xs:element',{'name':resObj.children[i].children[j].name});
                        var simpleType1=select.ele('xs:simpleType');
                        var restriction=simpleType1.ele('xs:restriction',{'base':'xs:string'});
                        for(var l= 0; l <resObj.children[i].children[j].children.length ; l++) {
                            var enumeration=restriction.ele('xs:enumeration',{'value':resObj.children[i].children[j].children[l].name})
                        }
                    }
                }else{
                    //it's a simple element'
                    var element=sequence1.ele('xs:element');
                    element.att('name',resObj.children[i].children[j].name);
                    element.att('type','xs:string')
                }

            }
        }
        var xmlString = root.end({
            pretty: true,
            indent: '  ',
            newline: '\n',
            allowEmpty: false
        });
        //get the base url of the target form
        pathArray = url.split( '/' );
        targetWebSite = pathArray[2];
        fs.writeFile(targetWebSite,xmlString, function (err) {

            if (err) throw err;

            console.log('It\'s saved! in the app folder');

        });
        fs.writeFile(targetWebSite+" form structure",JSON.stringify(formStructures), function (err) {

            if (err) throw err;

            console.log('It\'s saved! in the app folder');

        });
        //console.log(xmlString);
        resObj.xmls=xmlString;
        resObj.formStructures=formStructures;
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
app.get('/getDomainName', function(req, res) {
    var url = req.query['url'];
    pathArray = url.split('/');
    targetWebSite = pathArray[2];
    var obj = JSON.parse(fs.readFileSync(targetWebSite + " key words", 'utf8'));
  //  console.log(obj[1].keyword);
    connection.query('SELECT id_n from english_index where lemma="job"', function(err, rows, fields) {
        if (!err) {
            console.log('The solution is: ', rows);
            var domains = rows[0].id_n.split(' ');
            console.log(domains)
         /*   var domainsQuery="('";
            for (var i=0;i<domains.length-1;i++){
                domainsQuery+=domains[i]+"','";
            }
            var size=domains.length-1
            domainsQuery+=domains[size]+"')"
            console.log(domainsQuery)*/
              var sql='SELECT english from semfield where synset="'+domains[0]+'"';
      /*   var inserts = [domainsQuery];
            sql = mysql.format(sql, inserts);
            //sql+=domainsQuery;*/
            connection.query(sql,function (err,rows){
                if (!err) {
                    console.log('The solution is: ', rows);
                    res.json(rows[0])
                }else
                    console.log(err);
            })

        } else
            console.log('Error while performing Query.');
    });

   // connection.end();
  /*  sql.connect("mssql://root:dimasql007@localhost/dwcdb").then(function () {
       console.log('fff')
       new sql.Request().query('select * from english_index where lemma="job"').then(function(recordset) {
          
           console.log(recordset);
       }).catch(function(err) {
           // ... query error checks
       
       });
   })*/
    //res.json(obj)

    /*  request.post({
     headers: {'content-type' : 'application/x-www-form-urlencoded',
     ' Host':' multiwordnet.fbk.eu',
     'User-Agent': 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:47.0) Gecko/20100101 Firefox/47.0',
     'Accept-Language': 'en-US,en;q=0.5',
     'Accept-Encoding': 'gzip, deflate',
     'Referer': 'http://multiwordnet.fbk.eu/online/multiwordnet-head.php',
     'Cookie': 'countvisit=4129717; PHPSESSID=oujmvdap5aud85j4pba0ptidu0',
     'Connection': 'keep-alive'
     },
     url:     'http://multiwordnet.fbk.eu/online/multiwordnet-main-frame.php',
     data:    {
     language:'english',
     field:'word',
     word:obj[1].keyword,
     go:'Search'
     }
     }, function(error, response, html){*/
  /*  request("http://multiwordnet.fbk.eu/online/multiwordnet.php", function(error, response){
        var cookie = response.headers['set-cookie']
    request.post({
        headers: {
            'content-type': 'application/x-www-form-urlencoded',
            'Cookie': cookie
        },
        url: 'http://multiwordnet.fbk.eu/online/multiwordnet-main-frame.php',
        body: "language=english&field=word&word=sign&go=Search"
    }, function (error, response, html) {
        console.log(html)
    })
})*/
})
app.get('/getWordList', function(req, res){


    var url=req.query['url'];
    var numberOfKeyWords=parseInt(req.query['numberOfKeyWords']);
    console.log(numberOfKeyWords)
   // console.log(req.query['url'])
   /* fs.writeFile(targetWebSite,xmlString, function (err) {

        if (err) throw err;

        console.log('It\'s saved! in the app folder');

    });*/
    request.post({
        headers: {'content-type' : 'application/x-www-form-urlencoded'},
        url:     'http://www.seowebpageanalyzer.com/',
        body:    "url="+url
    }, function(error, response, html){
var wordList=[]
        var $ = cheerio.load(html);
       var table= $('table').first();
       // console.log(table);
      ///  var tb=[1,2,3,3,3];
        table.find("tr").each( function (i,element) {
            var children = $(this).children();
            var row = {
                "keyword" : $(children[0]).text(),
                "frequency" : $(children[1]).text()
            };

            wordList.push(row);
           // console.log(i)
        });
        //send ony the number required by the user
        var slicedWordList=wordList.slice(0, numberOfKeyWords+1);
        pathArray = url.split( '/' );
        targetWebSite = pathArray[2];
//        fs.writeFile(targetWebSite+" key words",util.inspect(slicedWordList), function (err) {
        fs.writeFile(targetWebSite+" key words",JSON.stringify(slicedWordList), function (err) {

            if (err) throw err;

            console.log('It\'s saved! in the app folder');

        });
res.json(slicedWordList);
//console.log(wordList);

      /*  $('table').each(function(){
i++;
console.log('in'+i)

        });*/

    });
   /* request(url, function(error, response, html){
        if(!error){
           
            $('form').each(function(){


                });

        }else{
            console.log('oops!!check the internet cnx')
        }
    });*/




});
app.set('port', (process.env.PORT || 8082));
/*app.listen('8082')
console.log('Magic happens on port 8082');*/
app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});



