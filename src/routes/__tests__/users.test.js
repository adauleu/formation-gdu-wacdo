"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const mongodb_memory_server_1 = require("mongodb-memory-server");
const mongoose_1 = __importDefault(require("mongoose"));
const User_1 = require("../../models/User");
const globals_1 = require("@jest/globals");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
let mongoServer;
let app;
// --- Gestion dynamique du rôle pour les tests ---
let currentRole = 'admin';
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
    await mongoose_1.default.connect(uri, { dbName: 'test' });
});
afterAll(async () => {
    await mongoose_1.default.disconnect();
    await mongoServer.stop();
    globals_1.jest.clearAllMocks();
});
beforeEach(async () => {
    await User_1.User.deleteMany({});
});
describe('POST /users (registerUser)', () => {
    beforeEach(() => {
        currentRole = 'admin';
        currentUserId = new mongoose_1.default.Types.ObjectId();
    });
    it('inscrit un nouvel utilisateur avec les données valides', async () => {
        const res = await (0, supertest_1.default)(app)
            .post('/api/users')
            .send({ username: 'user1', password: 'Password123@', role: 'accueil' });
        expect(res.status).toBe(201);
        expect(res.body.username).toBeDefined();
    });
    it('retourne 400 si les données sont invalides', async () => {
        const res = await (0, supertest_1.default)(app)
            .post('/api/users')
            .send({ username: '' });
        expect(res.status).toBe(400);
    });
});
describe('POST /users/login (loginUser)', () => {
    beforeEach(() => {
        currentRole = 'admin';
        currentUserId = new mongoose_1.default.Types.ObjectId();
    });
    it('connecte un utilisateur avec des identifiants valides', async () => {
        const hashedPassword = await bcryptjs_1.default.hash('Password123@', 10);
        const user = await User_1.User.create({ username: 'loginuser', password: hashedPassword, role: 'accueil' });
        const res = await (0, supertest_1.default)(app)
            .post('/api/users/login')
            .send({ username: user.username, password: 'Password123@' });
        expect(res.status).toBe(200);
        // token ou user attendu
        expect(res.body.token).toBeDefined();
    });
    it('retourne 401 pour des identifiants invalides', async () => {
        const res = await (0, supertest_1.default)(app)
            .post('/api/users/login')
            .send({ email: 'doesnotexist@example.com', password: 'wrong' });
        expect([400, 401].includes(res.status)).toBe(true);
    });
});
describe('GET /users (getUsers)', () => {
    beforeEach(() => {
        currentRole = 'admin';
        currentUserId = new mongoose_1.default.Types.ObjectId();
    });
    it('retourne la liste des utilisateurs pour un admin', async () => {
        await User_1.User.create({ username: 'u1', password: 'p', role: 'accueil' });
        const res = await (0, supertest_1.default)(app)
            .get('/api/users')
            .set('Authorization', 'Bearer testtoken');
        expect(res.status).toBe(200);
        expect(res.body).toHaveLength(1);
    });
});
