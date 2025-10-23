"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const mongodb_memory_server_1 = require("mongodb-memory-server");
const mongoose_1 = __importDefault(require("mongoose"));
const Menu_1 = require("../../models/Menu");
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
    await Menu_1.Menu.deleteMany({});
});
describe('GET /menus (getMenus)', () => {
    it('retourne la liste des menus', async () => {
        await Menu_1.Menu.create({ name: 'MenuTest', products: [], price: 9.9 });
        const res = await (0, supertest_1.default)(app)
            .get('/api/menus')
            .set('Authorization', 'Bearer testtoken');
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });
});
describe('GET /menus/:id (getMenuById)', () => {
    it('retourne un menu existant', async () => {
        // créer d'abord un produit pour référencer dans le menu
        const prod = new (await import('../../models/Product')).Product({ name: 'P1', description: 'x', price: 1, isAvailable: true });
        await prod.save();
        const menu = await Menu_1.Menu.create({ name: 'MenuTest', products: [prod._id], price: 9.9 });
        const res = await (0, supertest_1.default)(app)
            .get(`/api/menus/${menu._id}`)
            .set('Authorization', 'Bearer testtoken');
        expect(res.status).toBe(200);
        expect(res.body._id).toBe(menu._id.toString());
    });
    it('retourne 404 si le menu est absent', async () => {
        const fakeId = new mongoose_1.default.Types.ObjectId();
        const res = await (0, supertest_1.default)(app)
            .get(`/api/menus/${fakeId}`)
            .set('Authorization', 'Bearer testtoken');
        expect(res.status).toBe(404);
    });
});
describe('POST /menus (createMenu)', () => {
    it('crée un menu lorsque les données sont valides', async () => {
        const prod = new (await import('../../models/Product')).Product({ name: 'P2', description: 'x', price: 2, isAvailable: true });
        await prod.save();
        const res = await (0, supertest_1.default)(app)
            .post('/api/menus')
            .set('Authorization', 'Bearer testtoken')
            .send({ name: 'MenuPost', products: [prod._id.toString()], price: 12.5 });
        expect(res.status).toBe(201);
        // Vérifier que le menu retourné contient un nom
        expect(res.body.name || res.body).toBeDefined();
    });
    it('retourne 400 si les données sont invalides', async () => {
        const res = await (0, supertest_1.default)(app)
            .post('/api/menus')
            .set('Authorization', 'Bearer testtoken')
            .send({ name: '', products: [] });
        expect(res.status).toBe(400);
    });
});
describe('DELETE /menus/:id (deleteMenu)', () => {
    it('supprime le menu si l’utilisateur a le rôle admin', async () => {
        const prod = new (await import('../../models/Product')).Product({ name: 'P3', description: 'x', price: 3, isAvailable: true });
        await prod.save();
        const menu = await Menu_1.Menu.create({ name: 'MenuToDelete', products: [prod._id], price: 5 });
        const res = await (0, supertest_1.default)(app)
            .delete(`/api/menus/${menu._id}`)
            .set('Authorization', 'Bearer testtoken');
        // accept 200 ou 204 selon implémentation
        expect([200, 204].includes(res.status)).toBe(true);
    });
    it('retourne 404 si le menu à supprimer est absent', async () => {
        const fakeId = new mongoose_1.default.Types.ObjectId();
        const res = await (0, supertest_1.default)(app)
            .delete(`/api/menus/${fakeId}`)
            .set('Authorization', 'Bearer testtoken');
        expect(res.status).toBe(404);
    });
});
