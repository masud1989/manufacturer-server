
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000


app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.v7rvc.mongodb.net/?retryWrites=true&w=majority`;
// console.log(uri);

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run(){
    try{
        await client.connect();
        // console.log('DB Connected');
        const productCollection = client.db('manufacturer_portal').collection('products');
        const userCollection = client.db('manufacturer_portal').collection('users');



        app.get('/product', async(req,res) => {
            const query = {};
            const cursor = productCollection.find(query);
            const products = await cursor.toArray();
            res.send(products);
        })

        //Show Users=================================================================
        app.get('/user', async(req,res) => {
            const query = {};
            const cursor = userCollection.find(query);
            const users = await cursor.toArray();
            res.send(users);
        })

        // Set user as Admin====================================================
        app.put('/user/admin/:email', async(req, res)=>{
            const email = req.params.email;
            const filter = {email: email};
            const updateDoc = {
                $set: {role: 'admin'},
            };
            const result = await userCollection.updateOne(filter, updateDoc);
            res.send(result);
        })

        //Checking Admin Role====================================
        app.get('/admin/:email', async(req, res)=>{
            const email = req.params.email;
            const user = await userCollection.findOne({email: email});
            const isAdmin = user.role === 'admin';
            res.send({admin: isAdmin});
        })

        // Save user to database====================================================
        app.put('/user/:email', async(req, res)=>{
            const email = req.params.email;
            const user = req.body;
            const filter = {email: email};
            const options = { upsert: true};
            const updateDoc = {
                $set: user,
            };
            const result = await userCollection.updateOne(filter, updateDoc, options);
            const token = jwt.sign({email: email}, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '1h'});
            res.send({result, token});
        })

        // Insert Product =====================================================
        app.post('/product', async(req, res)=>{
            const newProduct = req.body;
            // console.log('adding new product');
            const result = await productCollection.insertOne(newProduct);
            res.send(result);
        })

        // Delete Product =====================================================
        app.delete('/product/:id', async(req, res) => {
          const id = req.params.id;
          const query = {_id:ObjectId(id)};
          const result = await productCollection.deleteOne(query);
          res.send(result);
      } )

      //Details of Product=================================
      app.get('/product/:id', async(req, res) => {
        const id = req.params.id;
        const query = {_id:ObjectId(id)};
        const result = await productCollection.findOne(query);
        res.send(result);
    } )
//==================================================
      app.patch('/product/:id', async(req,res)=>{
        const id = req.params.id;
        const updateData = req.body;
        const filter = {_id: ObjectId(id)};
        const options = { upsert: true };
        const updatedDoc = {
            $set: {
                quantity: updateData.productQuantity
            }
        }
        const result = await productCollection.updateOne(filter, updatedDoc, options)
        res.send(result)
    });

    }

    finally{

    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('Hello, from Server!')
})

app.listen(port, () => {
  console.log(`Your app is listening on port ${port}`)
})
