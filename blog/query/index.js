const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(bodyParser.json());
app.use(cors());

const posts = {};

const handleEvent = (type, data) => {
    // Extract the post id and title, and set comments to empty list
    // If a new post is created
    if(type === 'PostCreated') {
        const { id, title } = data;
        posts[id] = { id, title, comments: [] };
    }

    // Extract the commentId, content, and postId - then add the comment to the post object
    // If a new comment is created
    if(type === 'CommentCreated') {
        const { id, content, postId, status } = data;
        
        const post = posts[postId];
        post.comments.push({ id, content, status });
    }

    if(type === 'CommentUpdated') {
        const { id, content, postId, status } = data;

        const post = posts[postId];
        const comment = post.comments.find( comment => {
            return comment.id === id;
        });

        comment.status = status;
        comment.content = content;
    }
};

app.get('/posts', (req, res) => {
    res.send(posts);
});

app.post('/events', (req, res) => {
    const { type, data } = req.body;

    handleEvent(type, data);

    res.send({});
});

app.listen(4002, async () => {
    console.log('Listening on 4002');

    // send request to event bus to get list of all events emitted
    const res = await axios.get('http://localhost:4005/events');

    // same as a 'for in' loop in python
    for (let event of res.data) {
        console.log('Processing event: ', event.type);
        handleEvent(event.type, event.data);
    }
});