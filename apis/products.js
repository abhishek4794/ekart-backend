let R;
let collection;

module.exports.init = function(runtime) {
	R = runtime
	//console.log(R.db.mongodb)
	collection = R.db.mongodb.collection('products');
}

module.exports.list = {
    method: 'GET',
    handler: list
}

function list(req, res) {
	
    collection.find({}).toArray(function(err, docs) {
    	
    	if(docs.length != 0){
    		let user = docs[0]

	    		res.sendJson({code:200,data:docs})
	    	
	    }
	    else{
	    	res.sendJson({code:500,data:[]})
	    }
    })
	
}
