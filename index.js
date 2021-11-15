const express = require('express');
const { MongoClient } = require('mongodb');
require('dotenv').config();
const cors = require('cors');
const ObjectId = require('mongodb').ObjectId;


const app = express();
const port = process.env.PORT || 4000;

// meddleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.cyq7h.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function run() {
  try {
    await client.connect();
    const database = client.db('carShowRooms');
    const carCollection = database.collection('cars');
    const reviewCollection = database.collection('reviews')
    const usersCollection = database.collection('users')
    const ordersCollection = database.collection('orders')


    // GET API 
    app.get('/cars',async(req,res)=>{
        const cursor = carCollection.find({})
        const cars = await cursor.toArray();
        res.send(cars)
    })

    // GET SINGLE PRODUCT 
          
           app.get('/cars/:id',async (req,res)=>{
            const id = req.params.id;
            console.log('id oilo',id);
            const query= {_id:ObjectId(id)}
            const car = await carCollection.findOne(query);
            res.json(car)
         })
     

    // POST API
    app.post('/cars', async (req, res) => {
      const cars = req.body;
      const result = await carCollection.insertOne(cars);
      res.json(result);
    })

    // review get api 
    app.get('/reviews',async(req,res)=>{
      const cursor = reviewCollection.find({})
      const review = await cursor.toArray();
      res.send(review);
    })

    // review post api 
    app.post('/reviews',async(req,res)=>{
      const review = req.body;
      const result = await reviewCollection.insertOne(review)
      res.json(result)
    })

    // make Admin 
    app.get('/users/:email', async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      let isAdmin = false;
      if (user?.role === 'admin') {
          isAdmin = true;
      }
      res.json({ admin: isAdmin });
  })

  app.post('/users', async (req, res) => {
    const user = req.body;
    const result = await usersCollection.insertOne(user);
    console.log(result);
    res.json(result);
});

app.put('/users', async (req, res) => {
    const user = req.body;
    const filter = { email: user.email };
    const options = { upsert: true };
    const updateDoc = { $set: user };
    const result = await usersCollection.updateOne(filter, updateDoc, options);
    res.json(result);
});

app.put("/users/admin", async (req, res) => {
  const user = req.body;
  console.log("put", user);
  const filter = { email: user.email };
  const updateDoc = { $set: { role: "admin" } };
  const result = await usersCollection.updateOne(filter, updateDoc);
  res.json(result);
});

    
//* add order
app.post("/orders", async (req, res) => {
  const result = await ordersCollection.insertOne(req.body);
  console.log(result);
  res.send(result);
});
//* get all orders
app.get("/orders", async (req, res) => {
  const result = await ordersCollection.find({}).toArray();
  res.send(result);
});
//*filter email
app.get("/orders/:email", async (req, res) => {
  const email = req.params.email;
  const query = await ordersCollection.find({ email });
  const result = await query.toArray();
  res.send(result);
});
//*DELETE Order API
app.delete("/orders/:id", async (req, res) => {
  const id = req.params.id;
  const query = { _id: ObjectId(id) };
  const result = await ordersCollection.deleteOne(query);
  res.send(result);
});

//*UPDATE API
app.put("/orders/:id", async (req, res) => {
  const id = req.params.id;
  const updateDetails = req.body;
  const query = { _id: ObjectId(id) };
  const options = { upsert: true };
  const updateDoc = {
    $set: {
      status: updateDetails.status,
    },
  };
  const result = await ordersCollection.updateOne(
    query,
    updateDoc,
    options
  );
  res.send(result);
});

  } finally {
    // await client.close()
  }
}

run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
