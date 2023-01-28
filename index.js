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
    BAD_IP : "Invalid IP address provided",
    BAD_SOURCE : "Invalid source IP address provided",
    BAD_TARGET : "Invalid target IP address provided",
    BAD_SOURCE_PORT : "Invalid source port provided",
    BAD_TARGET_PORT : "Invalid target port provided"
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
     * Constructs a link using source, target, source port and target port
     * @constructor
     * @param {String} source 
     * @param {String} target 
     * @param {String} sourcePort 
     * @param {String} targetPort 
     * @param {String} label 
     */
    constructor(source, target, sourcePort, targetPort, label) {
        this.source = source;
        this.target = target;
        this.sourcePort = sourcePort;
        this.targetPort = targetPort;
        this.label = label ? label : "Default Link";
        this.id = crypto.randomBytes(16).toString('hex');
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

/**
 * Adds a link to the database
 * Receives source IP, target IP, source port, destination port, label (optional)
 * Responds with status 200 OK and the new link formed
 * Else 400 in case of Invalid input
 */
app.post('/addlink', (req, res) => {
    const source = req.body.source;
    const target = req.body.target;
    const sourcePort = req.body.sourcePort;
    const targetPort = req.body.targetPort;
    const label = req.body.label;
    try {
        if (!source || source == "") {
            throw new Error(ERROR_MESSAGES.BAD_SOURCE);
        } else if (!target || target == "") {
            throw new Error(ERROR_MESSAGES.BAD_TARGET);
        } else if (!sourcePort || sourcePort == "") {
            throw new Error(ERROR_MESSAGES.BAD_SOURCE_PORT);
        } else if (!targetPort || targetPort == "") {
            throw new Error(ERROR_MESSAGES.BAD_TARGET_PORT);
        } else {
            const link = new Link(source, target, sourcePort, targetPort, label);
            database.links.push(link);
            res.status(200).json(link);
        }
    } catch(err) {
        res.status(400).json({
            error : err.message
        })
    }
});

/**
 * GETs all the nodes present in the database
 */
app.get('/nodes', (req, res) => {
    const nodes = database.nodes;
    res.status(200).json(nodes);
})

/**
 * GETs all the links present in the database
 */
app.get('/links', (req, res) => {
    const links = database.links;
    res.status(200).json(links);
})

/**
 * GETs all the nodes and links present in the 
 * database in the format expected by cytoscape
 */
app.get('/graph/data', (req, res) => {
    const nodes = database.nodes.map(node => {
        return {
            data : {
                ip : node.ip,
                id : node.id,
                label : node.label
            }
        }
    });

    const links = database.links.map(link => {
        return {
            data : {
                source : link.source,
                target : link.target,
                id : link.id,
                label : link.label
            }
        };
    });

    const data = [].concat(nodes).concat(links);
    res.status(200).json(data);
})

app.listen(PORT, () => {
    console.log(`Listening on port: ${PORT}`);
});