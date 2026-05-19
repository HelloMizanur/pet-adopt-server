const dns = require("node:dns");
dns.setServers(["1.1.1.1", "8.8.8.8"]);
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const express = require("express");
const app = express();
const dotenv = require("dotenv");
dotenv.config();
const cors = require("cors");
const PORT = process.env.PORT || 4000;
const uri = `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@cluster0.erout5p.mongodb.net/?appName=Cluster0`;
app.use(cors());
app.use(express.json());

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
async function run() {
  try {
    const database = client.db("petadeption");
    const petsCollections = database.collection("pets");
    app.get("/pets", async (req, res) => {
      const pets = await petsCollections.find().toArray();
      res.send(pets);
    });

    app.get("/pets/:id", async (req, res) => {
      const id = req.params.id;
      const pet = await petsCollections.findOne({ _id: new ObjectId(id) });
      res.send(pet);
    });
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
