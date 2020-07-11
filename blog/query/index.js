const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(bodyParser.json());
app.use(cors());

const posts = {};

app.get('/posts', (req, res) => {
    res.send(posts);
});

app.post('/events', (req, res) => {
    const { type, data } = req.body;

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

    console.log(posts);

    res.send({});
});

app.listen(4002, () => {
    console.log('Listening on 4002');
});