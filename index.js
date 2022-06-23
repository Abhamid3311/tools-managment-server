const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const jwt = require('jsonwebtoken');


const app = express();
const port = process.env.PORT || 5000;

//Middleware
app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_user}:${process.env.DB_pass}@cluster0.39p4u.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

//Verify JWT
function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ message: "Unauthorized Access" });
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: "Forbidden Access" })
        }
        req.decoded = decoded;
        next();
    });
}



async function run() {
    try {
        await client.connect();
        const toolsCollection = client.db("tools_managment").collection("tools");
        const reviewCollection = client.db("tools_managment").collection("reviews");
        const orderCollection = client.db("tools_managment").collection("orders");
        const userCollection = client.db("tools_managment").collection("users");

        //GET TOOLS
        app.get('/tools', async (req, res) => {
            const query = {};
            const cursor = toolsCollection.find(query);
            const tools = await cursor.toArray();
            res.send(tools);
        });
        //Get Singel Tool
        app.get('/tools/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const tool = await toolsCollection.findOne(query);
            res.send(tool);
        });
        //Post Tool 
        app.post('/tools', async (req, res) => {
            const newTool = req.body
            const addtool = await toolsCollection.insertOne(newTool);
            res.send(addtool);
        });

        //GET Reviews
        app.get('/review', async (req, res) => {
            const query = {};
            const cursor = reviewCollection.find(query);
            const reviews = await cursor.toArray();
            res.send(reviews);
        });

        //Post Review 
        app.post('/review', async (req, res) => {
            const newReview = req.body
            const addReview = await reviewCollection.insertOne(newReview);
            res.send(addReview);
        });

        //Update Quantity
        app.put('/tools/:id', async (req, res) => {
            const id = req.params.id;
            const updateQuantity = req.body;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updatedDoc = {
                $set: {
                    myOrder: updateQuantity.myOrder,
                }
            };
            const result = await toolsCollection.updateOne(filter, updatedDoc, options);
            res.send(result);
        });

        //Post Order
        app.post('/order', async (req, res) => {
            const newOrder = req.body
            const addOrder = await orderCollection.insertOne(newOrder);
            res.send(addOrder);
        });

        //GET Order
        app.get('/order', async (req, res) => {
            const query = {};
            const cursor = orderCollection.find(query);
            const orders = await cursor.toArray();
            res.send(orders);
        });

        //GET My Order
        app.get('/order/:email', async (req, res) => {
            const email = req.params.email;
            const filter = { email: email };
            const cursor = orderCollection.find(filter);
            const tools = await cursor.toArray();
            res.send(tools);
        });

        /* //DELETE MyOrder
        app.delete('/order/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const deleteItem = await orderCollection.deleteOne(query);
            res.send(deleteItem);
        }); */

        //Put Admin
        app.put('/user/admin/:email', async (req, res) => {
            const email = req.params.email;
            const requister = req.decoded.email;
            const reqAccount = await userCollection.findOne({ email: requister });
            if (reqAccount.role === 'admin') {
                const filter = { email: email };
                const updateDoc = {
                    $set: { role: 'admin' },
                };
                const result = await userCollection.updateOne(filter, updateDoc);
                res.send(result);
            } else {
                return res.status(403).send({ message: "Forbidden Access" })
            }

        });





        //PUT USER 
        app.put('/user/:email', async (req, res) => {
            const email = req.params.email;
            const user = req.body;
            const filter = { email: email };
            const options = { upsert: true };
            const updateDoc = {
                $set: user,
            };
            const result = await userCollection.updateOne(filter, updateDoc, options);
            const token = jwt.sign({ email: email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' })
            res.send({ result, token });
        });

        //Get single User
        app.get('/user/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await userCollection.findOne(query);
            res.send(user);
        });
        // Get Users
        app.get('/user', verifyJWT, async (req, res) => {
            const query = {};
            const cursor = userCollection.find(query);
            const users = await cursor.toArray();
            res.send(users);
        })


    }
    finally {

    }

}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Tools managment is Running!');
});

app.listen(port, () => {
    console.log(`Tools managment listening on port ${port}`);
});
