let R;
let collection;
var uniqid = require('uniqid');

module.exports.init = function(runtime) {
    R = runtime
        //console.log(R.db.mongodb)
    collection = R.db.mongodb.collection('user');
}

module.exports.place = {
    method: 'POST',
    handler: placeOrder
}

module.exports.list = {
    method: 'POST',
    handler: list
}

function placeOrder(req, res) {
    let {
        uniqueId
    } = req.payload


    collection.find({
        uniqueId: uniqueId
    }).toArray(function(err, docs) {
        if (docs.length != 0) {
            let order = {
                orderDate: new Date(),
                totalCost: docs[0].totalCost,
                orderId: uniqid(),
                items: docs[0].cart
            }

            console.log(order)

            collection.update({
                uniqueId: uniqueId
            }, {
                $set: {
                    cart: [],
                    totalCost: 0
                },
                $push: {
                    orders: order
                }
            }, function(err, response) {
                if (err) {
                    console.log(err)

                } else {
                    //console.log(response)
                    return res.sendJson({
                        code: 200,
                        message: 'Order Placed'
                    })
                }

            })

        } else {
            return res.sendJson({
                code: 500,
                message: 'User not exist',
                data: []
            }, 500)
        }
    })


}

function list(req, res) {
    let {
        uniqueId
    } = req.payload


    collection.find({
        uniqueId: uniqueId
    }).toArray(function(err, docs) {
        if (docs.length != 0) {
            return res.sendJson({
                code: 200,
                data: docs[0].orders
            })
        } else {
            return res.sendJson({
                code: 500,
                message: 'User not exist',
                data: []
            }, 500)
        }
    })
}