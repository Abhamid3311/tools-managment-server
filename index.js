const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

//Middleware
app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_user}:${process.env.DB_pass}@cluster0.39p4u.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


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

        //Post User
        app.post('/user', async (req, res) => {
            const newUser = req.body
            const addUser = await userCollection.insertOne(newUser);
            res.send(addUser);
        });

        //Get User
        app.get('/user/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const user = await userCollection.findOne(query);
            res.send(user);
        });


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
