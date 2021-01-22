const express = require('express')
const app = express()
const swaggerUi = require('swagger-ui-express')
const airports = require('./airports.json')
const YAML = require('js-yaml')
const fs = require('fs')
const docs = YAML.load(fs.readFileSync('./airports_config.yaml').toString())
const swaggerDocs = require('swagger-jsdoc')({
    swaggerDefinition: docs,
    apis: ['./server.js', './Airport.js']
})

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs, {explorer: true}))
app.use(express.json())

/**
 * @swagger
 * /airports:
 *   get:
 *     summary: Returns an array of airports
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number to return
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           default: 25
 *         description: Number of airports on a page
 *     responses:
 *       200:
 *         description: all requested the airports
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Airport'
 *       404:
 *         description: Not found
 *         content:
 *           application/json: {}
 */

app.get('/airports', (req, res) => {
    let {city, country, page, pageSize} = req.query
    if (!page) {
        page = 1
    }
    if (!pageSize) {
        pageSize = 25
    }
    let results = airports
    if (city) {
        results = results.filter(r => r.city === city)
    }
    if (country) {
        results = results.filter(r => r.country === country)
    }
    const airports_on_page = results.slice((page - 1) * pageSize, page * pageSize)
    if (airports_on_page.length > 0) {
        res.send(airports_on_page)
    } else {
        return res.status(404).json({ error: 'Airports not found' })
    }
})

/**
 * @swagger
 * /airports:
 *   post:
 *     summary: Adds a new airport
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:    
 *             $ref: '#/components/schemas/Airport'
 *     responses:
 *       200:
 *         description: new airport successfully added
 *         content:
 *           application/json: {}
 *       400:
 *         description: Bad Request
 *         content:
 *           application/json: {}
 *       409:
 *         description: Conflict - an airport with that icao already exists
 *         content:
 *           application/json: {}
 */

app.post('/airports', (req, res) => {
    const new_airport = {}
    const icao = req.body.icao
    let iata = ""
    if (req.body.iata) {
        iata = req.body.iata
    }
    const name = req.body.name
    const city = req.body.city
    let state = ""
    if (req.body.state) {
        state = req.body.state
    }
    let country = ""
    if (req.body.country) {
        country = req.body.country
    }
    let elevation = 0
    if (req.body.elevation) {
        elevation = req.body.elevation
    }
    let lat = 0.0
    if (req.body.lat) {
        lat = req.body.lat
    }
    let lon = -0.0
    if (req.body.lon) {
        lon = req.body.lon
    }
    let tz = ""
    if (req.body.tz) {
        tz = req.body.tz
    }
    if (airports.find(a => a.icao === icao)) {
        res.status(409).json({ error: 'Conflict - an airport with that icao already exists' })
    } else if (!icao || !name || !city) {
        res.status(400).json({ error: 'Bad request' })
    } else {
        new_airport['icao'] = icao
        new_airport['iata'] = iata
        new_airport['name'] = name
        new_airport['city'] = city
        new_airport['state'] = state
        new_airport['country'] = country
        new_airport['elevation'] = elevation
        new_airport['lat'] = lat
        new_airport['lon'] = lon
        new_airport['tz'] = tz
        airports.push(new_airport)
        res.json(req.body)
    }
})

/**
 * @swagger
 * /airports/{icao}:
 *   get:
 *     summary: Return the airport specified by ICAO
 *     parameters:
 *       - in: path
 *         name: icao
 *         schema:
 *           type: string
 *         required: true
 *         description: string ID (ICAO) of the airport to get
 *     responses:
 *       200:
 *         description: an airport by ICAO
 *         content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Airport'
 *       404:
 *         description: Not found
 *         content:
 *           application/json: {}
 */

app.get('/airports/:icao', (req, res) => {
    const my_airport = airports.find(a => a.icao === req.params.icao)
    if (my_airport) {
        res.send(my_airport)
    } else {
        return res.status(404).json({ error: 'Airport not found' })
    }
})

/**
 * @swagger
 * /airports/{icao}:  
 *   patch:
 *     summary: Updates an airport property
 *     parameters:
 *       - in: path
 *         name: icao
 *         schema:
 *           type: string
 *         required: true
 *         description: string ID (ICAO) of the airport to update
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:    
 *             $ref: '#/components/schemas/Airport'
 *     responses:
 *       200:
 *         description: airport successfully updated
 *         content:
 *          application/json: {}
 *       400:
 *         description: Bad Request
 *         content:
 *           application/json: {}
 *       404:
 *         description: Not found
 *         content:
 *           application/json: {}
 */

app.patch('/airports/:icao', (req, res) => {
    const old_airport = airports.find(a => a.icao === req.params.icao)
    if (old_airport) {
        const index = airports.indexOf(old_airport)
        airports.splice(index, 1)
        const new_airport = {}
        const icao = req.body.icao
        let iata = ""
        if (req.body.iata) {
            iata = req.body.iata
        }
        const name = req.body.name
        const city = req.body.city
        let state = ""
        if (req.body.state) {
            state = req.body.state
        }
        let country = ""
        if (req.body.country) {
            country = req.body.country
        }
        let elevation = 0
        if (req.body.elevation) {
            elevation = req.body.elevation
        }
        let lat = 0.0
        if (req.body.lat) {
            lat = req.body.lat
        }
        let lon = -0.0
        if (req.body.lon) {
            lon = req.body.lon
        }
        let tz = ""
        if (req.body.tz) {
            tz = req.body.tz
        }
        if (!icao || !name || !city) {
            res.status(400).json({ error: 'Bad request' })
        } else {
            new_airport['icao'] = icao
            new_airport['iata'] = iata
            new_airport['name'] = name
            new_airport['city'] = city
            new_airport['state'] = state
            new_airport['country'] = country
            new_airport['elevation'] = elevation
            new_airport['lat'] = lat
            new_airport['lon'] = lon
            new_airport['tz'] = tz
            airports.push(new_airport)
            res.json(req.body)
        }
    } else {
        res.status(404).json({ error: 'Not found' })
    } 
})

/**
 * @swagger
 * /airports/{icao}:
 *   delete:
 *     summary: Deletes the airport specified by ICAO
 *     parameters:
 *       - in: path
 *         name: icao
 *         schema:
 *           type: string
 *         required: true
 *         description: string ID (ICAO) of the airport to delete
 *     responses:
 *       200:
 *         description: airport successfully deleted
 *         content:
 *           application/json: {}
 *       400:
 *         description: Bad request
 *         content:
 *           application/json: {}
 */

app.delete('/airports/:icao', (req, res) => {
    const my_airport = airports.find(a => a.icao === req.params.icao)
    if (my_airport) {
        const index = airports.indexOf(my_airport)
        airports.splice(index, 1)
        res.json(my_airport)
    } else {
        res.status(400).json({ error: 'Bad request' })
    }
})

/**
 * @swagger
 * /:
 *   get:
 *     summary: landing page
 *     responses:
 *       200:
 *         description: return a page with a link to airports
 *         content:
 *           text/html
 */

app.get("/", (req, res) => {
    res.send(
      "<a href='/airports'>Click here</a> for the airports"
    );
  });

//   app.listen(3000, () => console.log("Airport API ready. Documents at http://localhost:3000/api-docs"))
module.exports = app