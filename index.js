const express = require("express");
const app = express();
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");

require("dotenv").config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const cors = require("cors");
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ipsrkdy.mongodb.net/?appName=Cluster0`;

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
    const userCollection = client.db("JobTaskScic").collection("users");

    // created middleware
    const verifyToken = (req,res,next)=>{
        console.log("inside verify Token",req.headers);
        if(!req.headers.authorization){
          return res.status(401).send({message:'unauthorized access'})
        }
        const token = req.headers.authorization.split(' ')[1];
        jwt.verify(token,process.env.ACCESS_TOKEN_SECRET,(err,decoded)=>{
          if(err){
            return res.status(401).send({message:'unauthorized access'})
          }
          req.decoded = decoded;
          next();
         })
        
      }
      app.post("/jwt",async(req,res)=>{
        const user = req.body;
        console.log("jwt...", user);
        const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
          expiresIn: "1h",
        });
        res.send({ token });
      })
    //   user related api
    app.post('/users',async(req,res)=>{
        const user = req.body;
       
        // insert email id users doesn't exist
        const query = {email:user.email};
        const existingUser = await userCollection.findOne(query);
        if(existingUser){
          console.log(existingUser);
          return res.send({message:'user already exists',insertedId:null})
        }
        const result = userCollection.insertOne(user);
        res.send(result);
      })
      app.post("/login",(req,res)=>{
        const {identifier,pin} = req.body;
        const user = users.find(u=>u.email===identifier || u.phone===identifier);
        if(!user || !bcrypt.compareSync(pin,user.pin)){
            return res.status(401).json({message:'Invalid credentials'});
        }
        // Generate JWT token
        const token = jwt.sign({id:user.id},'your_jwt_secret',{expiresIn:'1h'});
        res.json({token,user});
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

app.get("/",(req,res)=>{
    res.send("JobTask is running");
});
app.listen(port,()=>{
    console.log(`JobTask is running on port ${port}`);
})

