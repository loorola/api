var mongodb = require('mongodb');
var specDB = require('./specDB');
var validation = require('./validation');

const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://user-1:FymbFf4WitrHpXtM@cluster0.txe0n.gcp.mongodb.net/mydb?retryWrites=true&w=majority";
const client = new MongoClient(uri, {useNewUrlParser: true});

exports.INITDATA = async () => {
    try {
        await client.connect();
        let dbo = await client.db("mydb");
        dbo.createCollection("Data", function (err, res) {
            if (err) throw err;
        })
    } finally {
        await client.close();
    }
}

exports.ADDDATA = async (params) => {
    let param = Object.values(params);
    let key = Object.keys(params);
    let spec = await specDB.SHOWSPEC();
    let valid = validation.dataIsValid(key, param, spec);
    if (valid.trim() === "1") {
        await client.connect();
        let dbo = await client.db("mydb");
        return await dbo.collection("Data").insertOne(param2Record(param));
    }
    return valid;

    //await client.connect();
    //let dbo = await client.db("mydb");
    //return await dbo.collection("Data").insertOne(params);
}

exports.SHOWDATA = async (data) => {
    await client.connect();
    let dbo = await client.db("mydb");

    if (data != null) {
        let spec = await specDB.SHOWSPEC();
        let criteria = await mapColumn(data, spec);
        if (typeof criteria != 'string') return await dbo.collection("Data").find(criteria).toArray();

    } else {
        return await dbo.collection("Data").find({}).toArray();
    }


}

exports.DELETEDATA = async (id) => {
    await client.connect();
    let dbo = await client.db("mydb");
    return await dbo.collection("Data").deleteOne({_id: new mongodb.ObjectID(id)});
}


let spec2Record = (spec) => {
    let obj = {};
    for (let i = 0; i < spec.length; i++) {
        let num = i + 1;
        if (spec[i].dataType.trim() === "TEXT") {

            obj["column" + num] = "Apple";
        } else if (spec[i].dataType.trim() === "BOOLEAN") {
            obj["column" + num] = 0;
        } else {
            obj["column" + num] = 11;
        }
    }
    return obj;
}

let param2Record = (value) => {
    let obj = {};
    for (let i = 0; i < value.length; i++) {
        let num = i + 1;
        obj["column" + num] = value[i];
    }
    return obj;
}

exports.CREATETABLE = async () => {
    let spec = await specDB.SHOWSPEC();
    for (let i = 0; i < 10; i++) {
        ADDDATA(spec2Record(spec));

    }
}


let mapColumn = async (crit, spec) => {
    let crit_param = Object.values(crit);
    let crit_key = Object.keys(crit);
    let obj = {};
    let isFound = false;
    for (let i = 0; i < crit_param.length; i++) {
        let num = 0;
        for (let j = 0; j < spec.length; j++) {
            if (crit_key[i].trim() === spec[j].columnName) {
                num = j + 1;
                obj["column" + num] = crit_param[i];
                if (
                    spec[j].dataType.trim() === "TEXT" && typeof crit_param[i] !== "string"
                    || spec[j].dataType.trim() === "INTEGER" && !validation.isInteger(crit_param[i])
                    || spec[j].dataType.trim() === "BOOLEAN" && !validation.isBoolean(crit_param[i])
                ) return "mismatched criteria dataType on " + spec[j].columnName + ", which should be in " + spec[j].dataType;
                isFound = true;
                break;
            }
        }
        if (!isFound) return "Field " + crit_key[i] + " not found!";
        isFound = false;
    }
    return obj;
}

exports.MODIFY = async (crit, options) => {
    let spec = await specDB.SHOWSPEC();
    let criteria = await mapColumn(crit, spec);
    let opt = await mapColumn(options, spec);
    if (typeof criteria === 'string') {
        return criteria;
    } else if (typeof opt === 'string') {
        return opt;
    } else {
        await client.connect();
        let dbo = await client.db("mydb");

        return await dbo.collection("Data").updateMany(criteria, {$set: opt}, {upsert: true});
    }
}

exports.DELETEALL = async () => {
    await client.connect();
    let dbo = await client.db("mydb");
    return await dbo.collection("Data").remove({});
}

