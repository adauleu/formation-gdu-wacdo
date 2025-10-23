"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const mongodb_memory_server_1 = require("mongodb-memory-server");
const mongoose_1 = __importDefault(require("mongoose"));
const Order_1 = require("../../models/Order");
const globals_1 = require("@jest/globals");
const Product_1 = require("../../models/Product");
const Menu_1 = require("../../models/Menu");
let mongoServer;
let app;
// --- Gestion dynamique du rôle pour les tests ---
let currentRole = 'préparateur';
let currentUserId = new mongoose_1.default.Types.ObjectId();
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
    await mongoose_1.default.connect(uri, { dbName: "test" });
});
afterAll(async () => {
    await mongoose_1.default.disconnect();
    await mongoServer.stop();
    globals_1.jest.clearAllMocks();
});
beforeEach(async () => {
    await Order_1.Order.deleteMany({});
});
// PATCH /orders/:id (préparateur)
describe('PATCH /orders/:id/status (préparateur)', () => {
    beforeEach(() => {
        currentRole = 'préparateur';
        currentUserId = new mongoose_1.default.Types.ObjectId();
    });
    it('permet au préparateur de passer une commande à "ready"', async () => {
        // Création d'une commande de test
        const order = await Order_1.Order.create({
            items: [],
            status: 'pending',
            createdBy: new mongoose_1.default.Types.ObjectId(),
            totalPrice: 0
        });
        const res = await (0, supertest_1.default)(app)
            .patch(`/api/orders/${order._id}/status`)
            .set('Authorization', 'Bearer testtoken')
            .send({ status: 'ready' });
        expect(res.status).toBe(200);
        expect(res.body.status).toBe('ready');
    });
    it('refuse au préparateur de passer à un autre statut que "ready"', async () => {
        const order = await Order_1.Order.create({
            items: [],
            status: 'pending',
            createdBy: new mongoose_1.default.Types.ObjectId(),
            totalPrice: 0
        });
        const res = await (0, supertest_1.default)(app)
            .patch(`/api/orders/${order._id}/status`)
            .set('Authorization', 'Bearer testtoken')
            .send({ status: 'delivered' });
        expect(res.status).toBe(403);
    });
});
// PATCH /orders/:id (accueil)
describe('PATCH /orders/:id/status (accueil)', () => {
    beforeEach(() => {
        currentRole = 'accueil';
        currentUserId = new mongoose_1.default.Types.ObjectId();
    });
    it('permet à l\'équipier d\'accueil de passer une commande à "delivered" si elle est "ready"', async () => {
        const order = await Order_1.Order.create({
            items: [],
            status: 'ready',
            createdBy: new mongoose_1.default.Types.ObjectId(),
            totalPrice: 0
        });
        const res = await (0, supertest_1.default)(app)
            .patch(`/api/orders/${order._id}/status`)
            .set('Authorization', 'Bearer testtoken')
            .send({ status: 'delivered' });
        expect(res.status).toBe(200);
        expect(res.body.status).toBe('delivered');
    });
    it('refuse à l\'équipier d\'accueil de passer une commande à "delivered" si elle est "pending"', async () => {
        const order = await Order_1.Order.create({
            items: [],
            status: 'pending',
            createdBy: new mongoose_1.default.Types.ObjectId(),
            totalPrice: 0
        });
        const res = await (0, supertest_1.default)(app)
            .patch(`/api/orders/${order._id}/status`)
            .set('Authorization', 'Bearer testtoken')
            .send({ status: 'delivered' });
        expect(res.status).toBe(400);
    });
    it('refuse à l\'équipier d\'accueil de passer une commande à "ready"', async () => {
        const order = await Order_1.Order.create({
            items: [],
            status: 'pending',
            createdBy: new mongoose_1.default.Types.ObjectId(),
            totalPrice: 0
        });
        const res = await (0, supertest_1.default)(app)
            .patch(`/api/orders/${order._id}/status`)
            .set('Authorization', 'Bearer testtoken')
            .send({ status: 'ready' });
        expect(res.status).toBe(403);
    });
});
describe('GET /orders (getOrdersToPrepare)', () => {
    beforeEach(() => {
        currentRole = 'préparateur';
        currentUserId = new mongoose_1.default.Types.ObjectId();
    });
    it('retourne la liste des commandes à préparer', async () => {
        await Order_1.Order.create({ items: [], status: 'pending', createdBy: currentUserId, totalPrice: 0 });
        const res = await (0, supertest_1.default)(app)
            .get('/api/orders')
            .set('Authorization', 'Bearer testtoken');
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });
});
describe('GET /orders/:id (getOrderById)', () => {
    beforeEach(() => {
        currentRole = 'préparateur';
        currentUserId = new mongoose_1.default.Types.ObjectId();
    });
    it('retourne une commande existante', async () => {
        // Créer un produit et un menu avec des prix, puis une commande qui les référence
        const product = await Product_1.Product.create({ name: 'P1', description: 'desc', price: 1.5, isAvailable: true });
        const menu = await Menu_1.Menu.create({ name: 'M1', products: [product._id], price: 2.5 });
        const order = await Order_1.Order.create({ items: [{ productId: product._id, quantity: 1 }], status: 'pending', createdBy: currentUserId, totalPrice: 9 });
        const res = await (0, supertest_1.default)(app)
            .get(`/api/orders/${order._id}`)
            .set('Authorization', 'Bearer testtoken');
        expect(res.status).toBe(200);
        expect(res.body._id).toBe(order._id.toString());
        expect(res.body.totalPrice).toBe(9);
    });
    it('retourne 404 si la commande est absente', async () => {
        const fakeId = new mongoose_1.default.Types.ObjectId();
        const res = await (0, supertest_1.default)(app)
            .get(`/api/orders/${fakeId}`)
            .set('Authorization', 'Bearer testtoken');
        expect(res.status).toBe(404);
    });
});
describe('POST /orders (createOrder)', () => {
    beforeEach(() => {
        currentRole = 'accueil';
        currentUserId = new mongoose_1.default.Types.ObjectId();
    });
    it('crée une commande lorsque des produits sont fournis', async () => {
        const product = await Product_1.Product.create({ name: 'Test Product', description: 'desc', price: 1.5, isAvailable: true });
        const res = await (0, supertest_1.default)(app)
            .post('/api/orders')
            .set('Authorization', 'Bearer testtoken')
            .send({ items: [{ productId: product.id, quantity: 1 }], status: 'pending', createdBy: currentUserId, totalPrice: 1.5 });
        expect(res.status).toBe(201);
        expect(res.body.items).toBeDefined();
    });
    it('retourne 400 lorsque un produit n\'est pas disponible', async () => {
        const product = await Product_1.Product.create({ name: 'Test Product', description: 'desc', price: 1.5, isAvailable: false });
        const res = await (0, supertest_1.default)(app)
            .post('/api/orders')
            .set('Authorization', 'Bearer testtoken')
            .send({ items: [{ productId: product.id, quantity: 1 }], status: 'pending', createdBy: currentUserId, totalPrice: 1.5 });
        expect(res.status).toBe(400);
    });
    it('retourne 400 si la commande est vide', async () => {
        const res = await (0, supertest_1.default)(app)
            .post('/api/orders')
            .set('Authorization', 'Bearer testtoken')
            .send({ items: [], });
        expect(res.status).toBe(400);
    });
    it('retourne 500 si la commande contient un id d\'un produit qui n\'existe pas', async () => {
        const res = await (0, supertest_1.default)(app)
            .post('/api/orders')
            .set('Authorization', 'Bearer testtoken')
            .send({ items: [{ productId: 'JexistePas', quantity: 1 }], });
        expect(res.status).toBe(500);
    });
});
describe('DELETE /orders/:id (deleteOrder)', () => {
    beforeEach(() => {
        currentRole = 'accueil';
        currentUserId = new mongoose_1.default.Types.ObjectId();
    });
    it('supprime la commande si l’utilisateur connecté en est l’auteur', async () => {
        const order = await Order_1.Order.create({ items: [], status: 'pending', createdBy: currentUserId, totalPrice: 0 });
        const res = await (0, supertest_1.default)(app)
            .delete(`/api/orders/${order._id}`)
            .set('Authorization', 'Bearer testtoken');
        expect(res.status).toBe(200);
    });
    it('refuse la suppression si l’utilisateur connecté n’est pas l’auteur de la commande', async () => {
        const order = await Order_1.Order.create({ items: [], status: 'pending', createdBy: new mongoose_1.default.Types.ObjectId(), totalPrice: 0 });
        const res = await (0, supertest_1.default)(app)
            .delete(`/api/orders/${order._id}`)
            .set('Authorization', 'Bearer testtoken');
        expect(res.status).toBe(403);
    });
});
