const http = require('http');
const requireTree = require('require-tree');
const _ = require('lodash');
const server = http.createServer(handler);
const MongoClient = require('mongodb').MongoClient

let conf = require('./conf/devConf.js')
let products = require('./conf/productlist.js')

let routes = {
    POST: {},
    GET: {}
}

let runtime = {
    db: {},
    log: {}
}
runtime.conf = conf
initDbs();
initMongoData();

function sendJson(obj, statusCode) {
    //console.log('obj --->', obj)
    let sObj = JSON.stringify(obj)
    this.setHeader("Content-Type", "application/json");
	this.setHeader("Access-Control-Allow-Origin", "*");
    this.statusCode = statusCode || 200
    this.end(sObj)
}

function handler(req, res) {
    //console.log(req)
    res.sendJson = sendJson;

    let method = req.method
    let url = req.url
	console.log('In handler -->',method,url)
     if (method == "OPTIONS") {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept,usergroup,appkey");
        return res.end();
    }

    if (!routes[method][url]) {
        res.sendJson({
            code: 404,
            message: 'Not found'
        }, 404)
    } else {
        let ct = req.headers['content-type']
	
        if (method == 'POST') {
            if (ct === 'application/json') {
                let body = '';
                req.on('data', (chunk) => {
                    body += chunk;
                }).on('end', () => {
                    console.log(body)
                    req.payload = JSON.parse(body)
                    routes[method][url](req, res);

                    // at this point, `body` has the entire request body stored in it as a string
                });

            }
        } else {
            routes[method][url](req, res);

        }

    }


    //	console.log(req)

}




function initApis(functions, filename, path) {

    functions['init'](runtime)

    functions = _.omit(functions, 'init')

    for (var fun in functions) {

        let pathName = path.replace(__dirname, '')
        pathName = pathName.substring(0, pathName.length - 3)
        pathName = pathName.concat('/' + fun)

        if (!routes[functions[fun].method][pathName]) {
            routes[functions[fun].method][pathName] = functions[fun].handler
        }

        //if(!routes[])
    }

}

function init() {
    requireTree('./apis', {
        each: initApis
    })
    console.log(routes)
}

//init();

function initDbs() {

    if (conf.mongo) {
        //runtime.db.redis = {}
	var url = 'mongodb://localhost:27017/test'
	MongoClient.connect(url, function(err, db) {
		runtime.db.mongodb = db
		init();
	})
    } else {
        init();
    }

}


function initMongoData(){
	
	//console.log(products)	
	var url = 'mongodb://localhost:27017/test';
	// Use connect method to connect to the Server
	MongoClient.connect(url, function(err, db) {

        var collection = db.collection('products');
		  // Insert some documents
  		collection.insertMany(products.list,function(err,result){
				//console.log(err,result)
		})
	})
}


server.listen(4794, () => {
    console.log('Server listening at 1234')
})
