let R;
let collection;
var md5 = require('md5');

module.exports.init = function(runtime) {
    R = runtime
        //console.log(R.db.mongodb)
    collection = R.db.mongodb.collection('user');
}

module.exports.login = {
    method: 'POST',
    handler: login
}

function login(req, res) {
    var username = req.payload.username
    var password = req.payload.password
    console.log('In login',username,password)
    collection.find({
        username: username
    }).toArray(function(err, docs) {
        console.log(docs.length)
        if (docs.length != 0) {
            let user = docs[0]
            console.log(user.password, ' =====', password)
            if (user.password === md5(password)) {
                res.sendJson({
                    code: 200,
                    displayName: username,
                    uniqueId: user.uniqueId
                })
            } else {
                res.sendJson({
                    code: 500,
                    data: []
                })
            }
        } else {
            res.sendJson({
                code: 500,
                data: []
            })
        }
    })

}