var auth = require('../app');


exports.getHashtag = function(req, res) {
	auth.ig.tags.recent({
	name: req.body.hashtag,
	complete: function(data) {
		//create an image array
		imageArr = [];
		//Map will iterate through the returned data obj
		data.map(function(item) {
			//create temporary json object
			tempJSON = {};
			tempJSON.url = item.images.standard_resolution.url;
			//insert json object into image array
			imageArr.push(tempJSON);
		});
		//turn image array and the hashtag name into data to return
		data = {imageArray: imageArr, hashtagValue:req.body.hashtag};
		//return data to the webpage
		res.render('hashtag', data);
	}
	})
};

exports.getLikes = function(req,res) {
  graph.get('/me/likes', function(err, res2) {
  // res.send(res2); // { id: '4', name: 'Mark Zuckerberg'... }
  res.json(res2);
})
});


exports.printStatuses = function(req, res) {
	T.get('statuses/user_timeline', function (err, reply) {
		var jsonArray = [];
		function increment(i) { 
  			if (i < 20) {
		    var tempJSON = {};
		    tempJSON.text = reply[i].text;
		    jsonArray.push(tempJSON);
		    increment(i+1);
		}
		increment(0);
		var data = {statuses: jsonArray};
		res.render('tweets', data);
});
}