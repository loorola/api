var mongodb = require('mongodb');
var validation = require('./validation');

const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://user-1:FymbFf4WitrHpXtM@cluster0.txe0n.gcp.mongodb.net/mydb?retryWrites=true&w=majority";
const client = new MongoClient(uri, {useNewUrlParser: true});


exports.INITSPEC = async () => {
    try {
        await client.connect();
        let dbo = await client.db("mydb");
        dbo.createCollection("Spec", function (err, res) {
            if (err) throw err;
        })
    } finally {
        await client.close();
    }
}

exports.ADDSPEC = async (params) => {
    let result = null;
    await client.connect();
    let dbo = await client.db("mydb");
    if (validation.isEmpty(params.columnName)) {
        return "Request columnName should not be empty!";
    } else if (validation.isEmpty(params.dataType)) {
        return "Request dataType should not be empty!";
    } else if (validation.dataTypeIsValid(params.dataType)) {
        return "DataType should be TEXT, BOOLEAN or INTEGER";
    } else {
        return await dbo.collection("Spec").insertOne(params);
    }
}

exports.SHOWSPEC = async () => {
    await client.connect();
    let dbo = await client.db("mydb");
    return await dbo.collection("Spec").find({}).toArray();
}

exports.DELETEALL = async () => {
    await client.connect();
    let dbo = await client.db("mydb");
    return await dbo.collection("Spec").remove({});
}

exports.DELETEONE = async (id) => {
    await client.connect();
    let dbo = await client.db("mydb");
    return await dbo.collection("Spec").deleteOne({_id: new mongodb.ObjectID(id)});
}
