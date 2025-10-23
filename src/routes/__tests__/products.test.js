"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const mongodb_memory_server_1 = require("mongodb-memory-server");
const mongoose_1 = __importDefault(require("mongoose"));
const Product_1 = require("../../models/Product");
const globals_1 = require("@jest/globals");
let mongoServer;
let app;
// --- Gestion dynamique du rôle pour les tests ---
const currentRole = 'admin';
const currentUserId = new mongoose_1.default.Types.ObjectId();
globals_1.jest.unstable_mockModule('../../middleware/auth', () => ({
    authMiddleware: (req, res, next) => {
        req.user = { id: currentUserId, _id: currentUserId, role: currentRole };
        next();
    },
}));
beforeAll(async () => {
    const mod = await import('../../index');
    app = mod.app;
    if (mongoose_1.default.connection.readyState !== 0) {
        await mongoose_1.default.disconnect();
    }
    mongoServer = await mongodb_memory_server_1.MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose_1.default.connect(uri, { dbName: 'test' });
});
afterAll(async () => {
    await mongoose_1.default.disconnect();
    await mongoServer.stop();
    globals_1.jest.clearAllMocks();
});
beforeEach(async () => {
    await Product_1.Product.deleteMany({});
});
describe('GET /products (getProducts)', () => {
    it('retourne la liste des produits', async () => {
        await Product_1.Product.create({ name: 'ProdTest', description: 'x', price: 1.5, isAvailable: true });
        const res = await (0, supertest_1.default)(app)
            .get('/api/products')
            .set('Authorization', 'Bearer testtoken');
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });
});
describe('GET /products/:id (getProductById)', () => {
    it('retourne un produit existant', async () => {
        const product = await Product_1.Product.create({ name: 'ProdTest', description: 'x', price: 1.5, isAvailable: true });
        const res = await (0, supertest_1.default)(app)
            .get(`/api/products/${product._id}`)
            .set('Authorization', 'Bearer testtoken');
        expect(res.status).toBe(200);
        expect(res.body._id).toBe(product._id.toString());
    });
    it('retourne 404 si le produit est absent', async () => {
        const fakeId = new mongoose_1.default.Types.ObjectId();
        const res = await (0, supertest_1.default)(app)
            .get(`/api/products/${fakeId}`)
            .set('Authorization', 'Bearer testtoken');
        expect(res.status).toBe(404);
    });
});
describe('POST /products (createProduct)', () => {
    it('crée un produit lorsque les données sont valides', async () => {
        const res = await (0, supertest_1.default)(app)
            .post('/api/products')
            .set('Authorization', 'Bearer testtoken')
            .send({ name: 'NewProd', description: 'desc', price: 3.2, isAvailable: true });
        expect([201, 200].includes(res.status)).toBe(true);
        expect(res.body.name || res.body).toBeDefined();
    });
    it('retourne 400 si les données sont invalides', async () => {
        const res = await (0, supertest_1.default)(app)
            .post('/api/products')
            .set('Authorization', 'Bearer testtoken')
            .send({ name: '' });
        expect([400, 422].includes(res.status)).toBe(true);
    });
});
describe('DELETE /products/:id (deleteProduct)', () => {
    it('supprime le produit si l’utilisateur a le rôle admin', async () => {
        const product = await Product_1.Product.create({ name: 'ProdToDelete', description: 'x', price: 2, isAvailable: true });
        const res = await (0, supertest_1.default)(app)
            .delete(`/api/products/${product._id}`)
            .set('Authorization', 'Bearer testtoken');
        expect([200, 204].includes(res.status)).toBe(true);
    });
    it('retourne 404 si le produit à supprimer est absent', async () => {
        const fakeId = new mongoose_1.default.Types.ObjectId();
        const res = await (0, supertest_1.default)(app)
            .delete(`/api/products/${fakeId}`)
            .set('Authorization', 'Bearer testtoken');
        expect([404, 400].includes(res.status)).toBe(true);
    });
});
