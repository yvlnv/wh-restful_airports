const app = require('../server')
const request = require('supertest')

describe("Aiport server", () => {
    test("can GET first page", (done) => {
        request(app)
            .get('/airports')
            .expect(200)
            .expect(response => {
                expect(response.body.length).toBe(25)
            })
            .end(done)
    })
    test("can't GET more than 28868 airports", (done) => {
        request(app)
            .get('/airports?page=30&pageSize=1000')
            .expect(404)
            .end(done)
    })
    test("can POST a new aiport", (done) => {
        request(app)
            .post('/airports')
            .send({icao: 'YANA', name: "Yana Airport", city: "Oryol"})
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)
            .end(() => {
                request(app)
                    .get('/airports/YANA')
                    .expect(200)
                    .expect(response => {
                        expect(response.body.name).toBe("Yana Airport")
                    })
                    .end(done)
            })
    })
    test("can't POST an aiport without required field", (done) => {
        request(app)
            .post('/airports')
            .send({icao: 'SERG', city: "Oryol"})
            .expect(400)
            .end(done)
    })
    test("can't POST an aiport with existing ICAO", (done) => {
        request(app)
            .post('/airports')
            .send({icao: 'UUEE'})
            .expect(409)
            .end(done)
    })
    test("can GET aiport by ICAO", (done) => {
        request(app)
            .get('/airports/UUEE')
            .expect(200)
            .expect(response => {
                expect(response.body.iata).toBe('SVO')
            })
            .end(done)
    })
    test("can't GET non-existent aiport", (done) => {
        request(app)
            .get('/airports/AAAA')
            .expect(404)
            .end(done)
    })
    test("can PATCH an aiport", (done) => {
        request(app)
            .get('/airports/00AK')
            .expect(response => {
                expect(response.body.name).toBe('Lowell Field')
            })
            .end(() => {
                request(app)
                    .patch('/airports/00AK')
                    .send({icao:"00AK",iata:"",name:"Lowell Field Airport",city:"Anchor Point",state:"",country:"",elevation:"",lat:"",lon:"",tz:""})
                    .expect(200)
                    .end(() => {
                        request(app)
                            .get('/airports/00AK')
                            .expect(response => {
                                expect(response.body.name).toBe('Lowell Field Airport')
                            })
                            .end(done)
                    })
            })
    })
    test("can't PATCH an aiport without required fields", (done) => {
        request(app)
            .patch('/airports/00AK')
            .send({icao: '00AK', city: "Anchor Point"})
            .expect(400)
            .end(done)
    })
    test("can DELETE an aiport", (done) => {
        request(app)
            .get('/airports/02TX')
            .expect(200)
            .end(() => {
                request(app)
                    .delete('/airports/02TX')
                    .expect(200)
                    .end(() => {
                        request(app)  
                            .get('/airports/02TX')
                            .expect(404)
                            .end(done)
                    })
            })
    })
    test("can't DELETE non-existent aiport", (done) => {
        request(app)
            .delete('/airports/AAAA')
            .expect(400)
            .end(done)
    })
})