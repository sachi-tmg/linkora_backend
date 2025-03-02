// test/role.test.js
const chai = require('chai');
// test/role.test.js
const request = require('supertest'); // Use supertest instead of chai-http
const app = require('../app'); // Ensure this path is correct
const Role = require('../model/role');
const { expect } = require('chai'); // Use chai for assertions

describe('Role Controller', () => {
    beforeEach(async () => {
        // Clear the Role collection before each test
        await Role.deleteMany({});
    });

    describe('POST /api/role', () => {
        it('should create a new role', async () => {
            const res = await request(app)
                .post('/api/role')
                .send({ roleId: '1', roleName: 'admin' });

            expect(res.status).to.equal(201);
            expect(res.body).to.have.property('message', 'Role created successfully');
            expect(res.body.role).to.have.property('roleName', 'admin');
        });

        it('should return 400 if role already exists', async () => {
            await Role.create({ roleId: '1', roleName: 'admin' });

            const res = await request(app)
                .post('/api/role')
                .send({ roleId: '2', roleName: 'admin' });

            expect(res.status).to.equal(400);
            expect(res.body).to.have.property('message', 'Role already exists');
        });
    });

    describe('GET /api/role', () => {
        it('should retrieve all roles', async () => {
            await Role.create([{ roleId: '1', roleName: 'admin' }, { roleId: '2', roleName: 'user' }]);

            const res = await request(app).get('/api/role');

            expect(res.status).to.equal(200);
            expect(res.body).to.be.an('array').with.lengthOf(2);
        });
    });

    describe('GET /api/role/:roleId', () => {
        it('should retrieve a role by roleId', async () => {
            const role = await Role.create({ roleId: '1', roleName: 'admin' });

            const res = await request(app).get(`/api/role/${role.roleId}`);

            expect(res.status).to.equal(200);
            expect(res.body).to.have.property('roleName', 'admin');
        });

        it('should return 404 if role not found', async () => {
            const res = await request(app).get('/api/role/999');

            expect(res.status).to.equal(404);
            expect(res.body).to.have.property('message', 'Role not found');
        });
    });
});