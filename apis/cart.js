let R;
let collection;

module.exports.init = function(runtime) {
	R = runtime
	//console.log(R.db.mongodb)
	collection = R.db.mongodb.collection('user');
}

module.exports.add = {
    method: 'POST',
    handler: add
}

module.exports.list = {
    method: 'POST',
    handler: list
}

module.exports.delete = {
    method: 'POST',
    handler: deleteFromCart
}

function add(req, res) {
	
    let { quantity,item,uniqueId,color} = req.payload
		item.color = color
		let cost = item.price * quantity
		
		collection.find({$and:[{uniqueId:uniqueId},{"cart._id":item._id}]}).toArray(function(err, docs) {
			console.log(docs.length)
			if(docs.length != 0){
				console.log('In already Present')
				collection.update(
			   	    	{ uniqueId:uniqueId,"cart._id": item._id},{ $inc:{"cart.$.quantity":quantity,"cart.$.cost":cost,totalCost:cost}},
			   	     function(err, response) {
      				if (err){
      					console.log(err)
      					return res.sendJson({code:500,data:[]},500)
      				}
      				else{
      					//console.log(object)
      					console.log('Done')
      					return res.sendJson({code:200,data:[]})
      				}
      				});
			}
			else{
				item.quantity = quantity
				item.cost = cost

				collection.update(
				   { uniqueId:uniqueId },
				   { 	
				   		$push: { cart: item },
				   		$inc:{ totalCost:cost }
				   },
				function(err, response) {
			   		 if (err) {
			   		 	console.log(err,'<----err')
			   		 	return res.sendJson({code:500,data:[]},500)
			   		 }
			   		 else{
			   		 	console.log('Item Pushed')
			   		 	return res.sendJson({code:200,data:[]})
			   		 }
			   		})

			}
		})
	
}

function list(req, res) {
	
    let { uniqueId } = req.payload

    collection.find({uniqueId:uniqueId}).toArray(function(err, docs) {
    	if(err){
    		return res.sendJson({code:500,data:[]},500)
    	}
    	else{
    		if(docs.length!=0){
    			return res.sendJson({code:200,data:docs[0].cart,totalCost:docs[0].totalCost})
    		}
    		else{
    			return res.sendJson({code:500,message:'User not exist',data:[]},500)
    		}
    	}
    })
 }

function deleteFromCart(req,res){

	let { uniqueId,item } = req.payload
	let { _id,cost } = item
	console.log(_id,-Math.abs(cost))
	collection.update({uniqueId:uniqueId},{
			$pull: {"cart": {_id: _id}},
			$inc:{ totalCost:-Math.abs(cost) }
		},function(err,response){

		if(err){
			console.log(err)
			return res.sendJson({code:500,message:err},500)
		}
		else{
			return res.sendJson({code:200,data:'Deleted Sucessfully'})
		}
	})
}