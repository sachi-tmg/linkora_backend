const request = require('supertest');
const app = require('../app'); // Import your Express app
const Role = require('../model/role');
const { expect } = require('chai');
const { v4: uuidv4 } = require('uuid'); // For generating unique IDs

describe('User Controller', () => {
    let roleId;

    beforeEach(async () => {
        // Clear the database before each test
        await Role.deleteMany({});

        // Create a role dynamically
        const role = await Role.create({
            roleId: 2, // Assign the correct roleId type, which is Number here
            roleName: 'regularUser',
        });
        roleId = role._id; // Save the roleId for use in tests
    });

    describe('POST /api/user/registerUser', () => {
        it('should register a new user with a dynamically determined roleId', async function () {
            this.timeout(10000); // Set the timeout for this specific test
            const uniqueEmail = `john_${uuidv4()}@example.com`;
        
            const res = await request(app)
                .post('/api/user/registerUser')
                .send({
                    fullName: 'John Doe',
                    email: uniqueEmail,
                    password: 'password123',
                    roleId: roleId.toString(),
                });
        
            expect(res.status).to.equal(201);
            expect(res.body).to.have.property('success', true);
            expect(res.body).to.have.property('message', 'User registered successfully!');
        });
        

        it('should return 400 if email already exists', async function () {
            this.timeout(10000); // Set a higher timeout for the test
        
            const uniqueEmail = `john_${uuidv4()}@example.com`;
        
            // First, register a user
            await request(app)
                .post('/api/user/registerUser')
                .send({
                    fullName: 'John Doe',
                    email: uniqueEmail,
                    password: 'password123',
                    roleId: roleId.toString(),
                });
        
            // Then, try to register again with the same email
            const res = await request(app)
                .post('/api/user/registerUser')
                .send({
                    fullName: 'Jane Doe',
                    email: uniqueEmail,
                    password: 'password123',
                    roleId: roleId.toString(),
                });
        
            expect(res.status).to.equal(400);
            expect(res.body).to.have.property('message', 'Email already exists!');
        });
        
        
    });

    describe('POST /api/user/login', () => {
        it('should login a user with valid credentials', async function () {
            this.timeout(10000); // Set a higher timeout for the test
        
            // First, register the user
            const uniqueEmail = `john_${uuidv4()}@example.com`;
            await request(app)
                .post('/api/user/registerUser')
                .send({
                    fullName: 'John Doe',
                    email: uniqueEmail,
                    password: 'password123',
                    roleId: roleId.toString(),
                });
        
            // Now, login with the same credentials
            const res = await request(app)
                .post('/api/user/login')
                .send({
                    email: uniqueEmail,
                    password: 'password123',
                });
        
            expect(res.status).to.equal(200);  // Expect a successful login
            expect(res.body).to.have.property('message', 'Login successful'); // Adjust based on actual response
        });
        
        
        it('should return 400 for invalid credentials', async () => {
            const res = await request(app)
                .post('/api/user/login')
                .send({
                    email: 'nonexistent@example.com',
                    password: 'wrongpassword',
                });

            expect(res.status).to.equal(400);
            expect(res.body).to.have.property('message', 'Invalid credentials');
        });
    });
});
