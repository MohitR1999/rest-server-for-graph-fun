const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
const PORT = 3000;

const database = [];

class Node {
    /**
     * Constructs a node using ip address
     * @param {String} ip 
     */
    constructor(ip) {
        const ipAddress = ip;
        const id = ip;
        const label = ip.split(".").join("_");
        this.data = {
            ip : ipAddress,
            id : id,
            label : label
        }
    }
}

class Link {
    /**
     * Adds a link to the database
     * @param {String} source 
     * @param {String} target 
     */
    constructor(source, target) {
        this.data = {
            id : `${source}-${target}`,
            source : source,
            target : target
        }
    }
}

app.use(cors());
app.use(express.json());

app.get('/data', (req, res) => {
    res.status(200).json(database);
})

app.post('/addnode', (req, res) => {
    const ip = req.body.ip;
    const node = new Node(ip);
    database.push(node);
    res.status(200).json(node);
});

app.post('/addlink', (req, res) => {
    const source = req.body.source;
    const target = req.body.target;
    const link = new Link(source, target);
    database.push(link);
    res.status(200).json(link);
});

app.listen(PORT, () => {
    console.log(`Listening on port: ${PORT}`);
});