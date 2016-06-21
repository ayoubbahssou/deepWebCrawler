var page = require('webpage').create();

var system = require("system");

page.onConsoleMessage = function(msg) {
	console.log(msg);
};
/*page.onError = function(msg, trace) {
	console.log('error: ' + msg);
};*/

page.viewportSize = {
	width: 1200,
	height: 800
};
//http://www.careerbuilder.com/jobseeker/jobs/jobfindadv.aspx
//http://www.idealist.org/search/v2/advanced
//http://www.airfrance.com/MA/fr/local/process/standardbooking/SearchAction.do?

page.open(url, function (status) {

	page.includeJs('https://ajax.googleapis.com/ajax/libs/jquery/2.1.3/jquery.min.js', function () {

		page.onLoadFinished = function () {
			console.log('loadFinishied');
			page.render("apres1.png");

			phantom.exit();

		};

		page.evaluate(function () {

			var form = $('form').eq(1);
			var inputs = form.find('input[type=text]');
			var selects = form.find('select:not([disabled])');
			var checkboxes = form.find('input[type=checkbox]');
			var radios = form.find('input[type=radio]');
			console.log('inputs : '+inputs.length);
			console.log('selects : '+selects.length);
			console.log('checkboxes : '+checkboxes.length);
			console.log('radios : '+radios.length);
			var domaine =  ['aa', 'bb', 'cc', 'dd', 'ee','ff','gg','hh'];
			$.each(inputs, function(){
				$(this).val(domaine[Math.floor(Math.random()*domaine.length)]);
			});
			$.each(selects, function(){
				var options = $(this).children('option');
				var optionsLength = options.length;
				var randomOption = Math.floor(Math.random()*optionsLength);
				$(this).children('option[selected]').eq(0).prop('selected', false);
				$(this).children('option').eq(randomOption).prop('selected', true);
			});
			var radiosNames = [];
			$.each(form.find('input[type=radio]'), function(){
				var name = $(this).attr('name');
				if(!radiosNames.hasOwnProperty(name))
					radiosNames[name] = 1;
				else
					radiosNames[name] = radiosNames[name] + 1 ;
			});
			for(var prop in radiosNames){
				if(radiosNames.hasOwnProperty(prop)){
					$('#pwContent > div > form').find('input[type=radio][name='+prop+']').eq(Math.floor(Math.random()*radiosNames[prop])).prop('checked', true);;
				}
			}
			$.each(checkboxes, function(){
				$(this).prop('checked', Math.floor(Math.random()*10)<5 ? false : true);
			});
			form.find('[type=submit]').click();

		});

page.render("avant1.png");
});


});