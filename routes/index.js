var express = require('express');
var router = express.Router();
var specDB = require('../controllers/specDB.js');
var dataDB = require('../controllers/dataDB.js');
const fs = require('fs')

const jwt = require('jsonwebtoken');
const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://user-1:FymbFf4WitrHpXtM@cluster0.txe0n.gcp.mongodb.net/mydb?retryWrites=true&w=majority";
const client = new MongoClient(uri, {useNewUrlParser: true});


router.get('/spec', isAuthenticated, async function (req, res, next) {
    let result = await specDB.SHOWSPEC();
    res.send({result});
    client.close();
});

router.delete('/spec/deleteAll', isAuthenticated, async function (req, res) {
    let result = await specDB.DELETEALL();
    res.send({result});
    client.close();
})

router.put('/spec/modify', isAuthenticated, async function (req, res) {
    await dataDB.DELETEALL();
    await dataDB.CREATETABLE();

});

router.delete('/spec/deleteOne', isAuthenticated, async (req, res) => {
    let id = req.query.id;
    let result = await specDB.DELETEONE(id);
    await dataDB.DELETEALL();
    await dataDB.CREATETABLE();
    res.send({result});
    client.close();
})

router.post('/spec/add', isAuthenticated, async (req, res) => {
    params = {
        columnName: req.query.columnName,
        dataType: req.query.dataType
    }
    let result = await specDB.ADDSPEC(params);
    client.close();

    res.json(result);
});


router.get('/data', isAuthenticated, async (req, res) => {
    let criteria = null;
    if (req.query.criteria != null) criteria = JSON.parse(req.query.criteria);
    let result = await dataDB.SHOWDATA(criteria);

    if (typeof result == 'string')
        res.status(400)
    res.json(result);
    client.close();
})

//modify
router.put('/data', isAuthenticated, async (req, res, next) => {
    let criteria = JSON.parse(req.query.criteria);
    let options = JSON.parse(req.query.options);
    let result = await dataDB.MODIFY(criteria, options);

    if (typeof result == 'string')
        res.status(400)

    res.json(result);
    client.close();
})

//add
router.post('/data', isAuthenticated, async (req, res) => {
    //let result = await dataDB.ADDDATA(req.query);
    let result = await dataDB.ADDDATA(JSON.parse(req.query.value));

    if (typeof result == 'string')
        res.status(400)

    res.json(result);
    client.close();
});

router.delete('/data', isAuthenticated, async (req, res) => {
    let id = req.query.id;
    let result = await dataDB.DELETEDATA(id);
    res.json(result);
    client.close();
});


// For get jwt
router.get('/jwt', (req, res, next) => {
    let privateKey = fs.readFileSync('./private.pem', 'utf8');
    let token = jwt.sign({"body": "SomethingBelongToUser"}, privateKey, {algorithm: 'HS384'});
    res.send(token);
})

function isAuthenticated(req, res, next) {
    if (typeof req.headers.authorization !== "undefined") {
        let token = req.headers.authorization;
        let privateKey = fs.readFileSync('./private.pem', 'utf8');
        jwt.verify(token, privateKey, {algorithm: "HS384"}, (err, user) => {
            if (err) {
                res.status(500).json({error: "Not Authorized"});
                throw new Error("Not Authorized");
            }
            return next();
        });
    } else {
        res.status(500).json({error: "Not Authorized"});
        throw new Error("Not Authorized");
    }
}

module.exports = router;