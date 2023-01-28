const express = require('express');
const cors = require('cors');
const fs = require('fs');
const bodyParser = require('body-parser');
const app = express();
const PORT = 3000;
const morgan = require('morgan');
const crypto = require('crypto');

const database = {};
database["nodes"] = [];
database["links"] = [];
database["services"] = [];
const nodeIPtoPortMap = JSON.parse(fs.readFileSync('./ports.json', 'utf-8'));
const nodeIPtoPropertiesMap = JSON.parse(fs.readFileSync('./nodes.json', 'utf-8'));

const ERROR_MESSAGES = {
    BAD_IP : "Invalid IP address provided"
}

class Node {
    /**
     * Constructs a node using ip address
     * @constructor
     * @param {String} ip 
     */
    constructor(ip) {
        this.ip = ip;
        this.label = nodeIPtoPropertiesMap[`${ip}`]["label"];
        this.ports = nodeIPtoPortMap[`${ip}`];
        this.id = crypto.randomBytes(16).toString('hex');
    }
}

class Link {
    /**
     * Constructs a link using source and target
     * @constructor
     * @param {String} source 
     * @param {String} target 
     */
    constructor(source, target, sourcePort, targetPort) {
        this.source = source;
        this.target = target;
        this.sourcePort = sourcePort;
        this.targetPort = targetPort;
    }
}

app.use(cors());
app.use(express.json());
app.use(morgan('combined'));

app.get('/data', (req, res) => {
    res.status(200).json(database);
})
/**
 * Adds a node to the database
 * Receives IP address in the request body in String format
 * Sends back response 200 OK if node got added
 * Else 500 if any exception is thrown
 */
app.post('/addnode', (req, res) => {
    const ip = req.body.ip;
    try {
        if (ip && ip != "") {
            const node = new Node(ip);
            database.nodes.push(node);
            res.status(200).json(node);
        } else {
            res.status(400).json({
                error : ERROR_MESSAGES.BAD_IP
            });
        }
    } catch (err) {
        res.status(500).json({
            error : err
        })
    };
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