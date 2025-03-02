const request = require('supertest');
const app = require('../app');  // assuming you have the Express app exported in app.js
const { expect } = require('chai');

describe('POST /latest-blogs', () => {
    it('should return the latest blogs', async () => {
        const res = await request(app)
            .post('/api/blog/latest-blogs')
            .send({ page: 1 });

        expect(res.status).to.equal(200);
        expect(res.body.blogs).to.be.an('array');
        expect(res.body.blogs.length).to.be.at.most(5);
    });

    it('should return 500 if server error occurs', async () => {
        // Simulate server error
        const res = await request(app)
            .post('/api/blog/latest-blogs')
            .send({ page: -1 });  // Invalid page number

        expect(res.status).to.equal(500);
        expect(res.body.message).to.equal('Server error');
    });
});

describe('POST /create-blog', () => {
    let token;
    
    before(async () => {
        // Obtain a valid JWT token (you need to create a user in the database)
        token = 'your_jwt_token';  // Replace with actual JWT token
    });

    it('should return 400 for invalid user', async () => {
        // Test with invalid user or no token
        const res = await request(app)
            .post('/api/blog/create-blog')
            .send({
                title: 'New Blog Title',
                des: 'Blog description',
                content: 'Blog content',
                tags: ['tag1', 'tag2'],
                draft: false
            });

        expect(res.status).to.equal(401);
        expect(res.body.error).to.equal('No access token');
    });
});



describe('GET /get-all-blogs', () => {
    it('should return all blogs', async () => {
        const res = await request(app)
            .get('/api/blog/get-all-blogs');

        expect(res.status).to.equal(200);
        expect(res.body.success).to.equal(true);
        expect(res.body.data).to.be.an('array');
    });
});


describe('POST /search-blogs', () => {
    it('should search blogs by tag', async () => {
        const res = await request(app)
            .post('/api/blog/search-blogs')
            .send({ tag: 'tech', page: 1 });

        expect(res.status).to.equal(200);
        expect(res.body.blogs).to.be.an('array');
    });

    it('should return 500 if search query is invalid', async () => {
        const res = await request(app)
            .post('/api/blog/search-blogs')
            .send({ page: -1 });

        expect(res.status).to.equal(500);
        expect(res.body.message).to.equal('Server error');
    });
});


describe('POST /uploadBanner', () => {

    it('should return 400 if no file is uploaded', async () => {
        const res = await request(app)
            .post('/api/blog/uploadBanner');

        expect(res.status).to.equal(400);
        expect(res.body.message).to.equal('Please upload a file');
    });
});
