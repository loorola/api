const request = require('supertest')
const app = "http://localhost:3000"
const jwt = require('jsonwebtoken');
const fs = require('fs')
let privateKey = fs.readFileSync('./private.pem', 'utf8');
const jwtForTest = "eyJhbGciOiJIUzM4NCIsInR5cCI6IkpXVCJ9.eyJib2R5IjoiU29tZXRoaW5nQmVsb25nVG9Vc2VyIiwiaWF0IjoxNTk3MzAwOTkzfQ.s7h0dCnrju8J6X2gfyGKe71a5AorlOxpgLFkg2mLnIQz_oMvcb8hbWOjDANloao7"

const table = "Data"
const dbname = 'mydb'

const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://user-1:FymbFf4WitrHpXtM@cluster0.txe0n.gcp.mongodb.net/mydb?retryWrites=true&w=majority";
const client = new MongoClient(uri, {useNewUrlParser: true});

describe('API CRUD TEST', () => {
    let dbo;

    beforeAll(async () => {
        await client.connect();
        dbo = await client.db(dbname);

        spec_result = await dbo.collection("Spec").findOne({})
        //Create Spec

        let spec_obj = [
            {columnName: 'name', dataType: 'TEXT'},
            {columnName: 'valid', dataType: 'BOOLEAN'},
            {columnName: 'count', dataType: 'INTEGER'}
        ];

        if (spec_result == null) {
            await dbo.collection("Spec").insertMany(spec_obj);
        }


        var sample_obj = [
            {column1: "Apple", column2: 1, column3: 1},
            {column1: "Banana", column2: 0, column3: -12},
        ];

        await dbo.collection(table).insertMany(sample_obj);
    });

    afterAll(async () => {
        await client.close();
    });

    it('Insert Cookie', async () => {

        let query = {"column1": "Cookie", "column2": 1, "column3": 103};
        let result = await dbo.collection(table).find(query).toArray();

        const res = await request(app)
            .post('/data')
            .set('authorization', jwtForTest)
            .query({value: '{"name":"Cookie", "valid":1,"count":103}'})

        expect(res.statusCode).toEqual(200)

        let result2 = await dbo.collection(table).find(query).toArray();

        expect(result.length + 1).toEqual(result2.length);
    })

    it('Insert Apple', async () => {
        let query = {"column1": "Apple", "column2": 1, "column3": 50};
        let result = await dbo.collection(table).find(query).toArray();

        const res = await request(app)
            .post('/data')
            .set('authorization', jwtForTest)
            .query({value: '{"name":"Apple", "valid":1,"count":50}'})

        expect(res.statusCode).toEqual(200)

        let result2 = await dbo.collection(table).find(query).toArray();

        expect(result.length + 1).toEqual(result2.length);
    })

    it('Query Single criteria', async () => {

        const res = await request(app)
            .get('/data')
            .set('authorization', jwtForTest)
            .query({criteria: '{"name":"Cookie"}'})

        expect(res.statusCode).toEqual(200)

        let query = {"column1": "Cookie"};
        let result = await dbo.collection(table).find(query).toArray();

        expect(result).toBeDefined();
        expect(JSON.stringify(res.body.sort(compare))).toEqual(JSON.stringify(result.sort(compare)))
    })

    it('Query 2 criteria', async () => {

        const res = await request(app)
            .get('/data')
            .set('authorization', jwtForTest)
            .query({criteria: '{"name":"Apple", "valid":1}'})

        expect(res.statusCode).toEqual(200)

        let query = {"column1": "Apple", "column2": 1};
        let result = await dbo.collection(table).find(query).toArray();

        expect(result).toBeDefined();
        expect(JSON.stringify(res.body.sort(compare))).toEqual(JSON.stringify(result.sort(compare)))
    })

    it('Modify', async () => {

        let query = {"column1": "Banana"};
        let result = await dbo.collection(table).find(query).toArray();

        for (let re of result) {
            re.column2 = 1
        }

        const res = await request(app)
            .put('/data')
            .set('authorization', jwtForTest)
            .query({criteria: '{"name":"Banana"}', options: '{"valid": 1}'})

        expect(res.statusCode).toEqual(200)

        let result2 = await dbo.collection(table).find(query).toArray();

        expect(result).toBeDefined();
        expect(result2).toBeDefined();
        expect(JSON.stringify(result2.sort(compare))).toEqual(JSON.stringify(result.sort(compare)))
    })


    it('Insert, Wrong format, column2 0.5-> boolean', async () => {

        const res = await request(app)
            .post('/data')
            .set('authorization', jwtForTest)
            .query({value: '{"name":"Cookie", "valid":0.5,"count":103}'})

        expect(res.statusCode).toEqual(400)

        expect(res.body).toEqual("The 2 parameter should be in BOOLEAN data type!");
    })

    it('Insert, Wrong format, column3 string->int', async () => {

        const res = await request(app)
            .post('/data')
            .set('authorization', jwtForTest)
            .query({value: '{"name":"Cookie", "valid":1,"count":"Apple"}'})

        expect(res.statusCode).toEqual(400)

        expect(res.body).toEqual("The 3 parameter should be in INTEGER data type!");
    })

    it('Modify, Wrong format, column2 0.5->boolean', async () => {

        const res = await request(app)
            .put('/data')
            .set('authorization', jwtForTest)
            .query({criteria: '{"name":"Banana"}', options: '{"valid": 0.5}'})

        expect(res.statusCode).toEqual(400)

        expect(res.body).toEqual("mismatched criteria dataType on valid, which should be in BOOLEAN");
    })

    it('Modify, Wrong format, column3 string->int', async () => {

        const res = await request(app)
            .put('/data')
            .set('authorization', jwtForTest)
            .query({criteria: '{"name":"Banana"}', options: '{"count": "Apple"}'})

        expect(res.statusCode).toEqual(400)

        expect(res.body).toEqual("mismatched criteria dataType on count, which should be in INTEGER");
    })

    it('Access without JWT', async () => {

        const res = await request(app)
            .put('/data')
            .query({criteria: '{"name":"Banana"}', options: '{"count": "Apple"}'})

        expect(res.statusCode).toEqual(500)
    })
})

describe('/jwt Endpoints and verify', () => {
    let token = ""
    it('Get /jwt', async () => {
        const res = await request(app)
            .get('/jwt')

        token = res.text;
        expect(res.statusCode).toEqual(200)
    })

    it('Verify jwt', async () => {
        await jwt.verify(token, privateKey, {algorithm: "HS384"}, (err, user) => {
            console.log(err);
            expect(err).toBeFalsy();
        });
    })
})

function compare(a, b) {
    if (a._id < b._id) {
        return -1;
    }
    if (a._id > b._id) {
        return 1;
    }
    return 0;
}
