
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');
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
        app.get('/product', async(req,res) => {
            const query = {};
            const cursor = productCollection.find(query);
            const products = await cursor.toArray();
            res.send(products);
        })
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