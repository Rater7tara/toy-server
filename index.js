const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());


// MongoDB functions
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@nowshinkhan.c8ljhxf.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri)

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const toyCollection = client.db('toyDB').collection('allToys');

    app.get('/allToys', async (req, res) => {

      const { category } = req.query;

      let query = toyCollection.find();

      if (category) {
          query = query.filter({ category });
      }

      try {
          const toyProduct = await query.toArray();
          res.send(toyProduct);
      } catch (err) {
          console.error('Failed to fetch products:', err);
          res.status(500).send('Internal Server Error');
      }
  })

  app.get('/allToys', async (req, res) =>{
    console.log(req.query.email)
    const sort = req.query.sort;
    let query = {};
    const options = {
      sort: {
        "price": sort === 'asc' ? 1 : -1
      }

    };
    if(req.query?.email){
      query = {email: req.query.email}
    }
    const result = await toyCollection.find(query, options).toArray();
    res.send(result)
  })

    app.get('/allToys/:id', async(req, res) => {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await toyCollection.findOne(query);
      res.send(result);
  })



    app.post('/allToys', async(req, res) =>{
      const newToy = req.body;
      console.log(newToy);
      const result = await toyCollection.insertOne(newToy)
      res.send(result);
    })

    app.delete('/allToys/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await toyCollection.deleteOne(query);
      res.send(result);
  })

  app.put('/allToys/:id', async(req, res) =>{
    const id = req.params.id;
    const filter = {_id: new ObjectId(id)}
    const options = { upsert: true };
    const updateToy =req.body;
    const toy = {
      $set:{
        name: updateToy.name,
        seller: updateToy.seller,
        email: updateToy.email,
        quantity: updateToy.quantity,
        price: updateToy.price,
        subCategory: updateToy.subCategory,
        details: updateToy.details,
        photo: updateToy.photo,
        rating: updateToy.rating
      }
    }

    const result = await toyCollection.updateOne(filter, toy, options)
    res.send(result);
  })



    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('Toy server is running')
})

app.listen(port, () => {
    console.log(`Toy Server is running on port: ${port}`)
})