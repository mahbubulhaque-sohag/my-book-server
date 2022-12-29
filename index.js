const express = require('express')
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
require('dotenv').config();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

// database
const uri = `mongodb+srv://${process.env.MY_BOOK_USER}:${process.env.MY_BOOK_PASSWORD}@cluster0.lezxbrx.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        const postsCollection = client.db('myBook').collection('posts');
        const commentsCollection = client.db('myBook').collection('comments');
        const usersCollection = client.db('myBook').collection('users');

        app.post('/posts', async (req, res) => {
            const post = req.body;
            const result = await postsCollection.insertOne(post);
            console.log(post)
            res.send(result);
        })

        app.get('/posts', async (req, res) => {
            const query = {};
            const posts = await postsCollection.find(query).toArray();
            // cursor.sort({likes:-1}).limit(3).toArray();
            res.send(posts)
        })

        app.put('/post/:id', async (req, res) => {
            const id = req.params.id;
            const like = req.body;
            const filter = {_id:(ObjectId(id))}
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    like: like.likeCount, postId: like.postId, userUid: like.uid
                },
            };
            const result = await postsCollection.updateOne(filter, updateDoc, options);
            res.send(result);
        })

       app.get('/post/:id', async(req, res)=>{
            const id = req.params.id;
            const query = {_id : ObjectId(id)};
            const post = await postsCollection.findOne(query);
            res.send(post)
       })

       app.post('/comment', async(req, res)=>{
        const comment = req.body;
        const result = await commentsCollection.insertOne(comment);
        res.send(result)
       })

       app.get('/comment/:id', async(req, res)=>{
        const id = req.params.id;
        const query = {postId : id};
        const result = await commentsCollection.find(query).toArray();
        res.send(result)
       })

       app.post('/users', async(req, res)=>{
        const user = req.body;
        const result = await usersCollection.insertOne(user);
        res.send(result)
       })

       app.get('/users/:email', async(req, res)=>{
        const email = req.params.email;
        const query = {email : email};
        const user = await usersCollection.findOne(query);
        res.send(user)
       })
    }
    finally { }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Hello My-Book!')
})

app.listen(port, () => {
    console.log(`My-Book app listening on port ${port}`)
})