import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { User } from '../../models/User.ts';
import { jest } from '@jest/globals';
import bcrypt from 'bcryptjs';

let mongoServer: MongoMemoryServer;
let app: any;

// --- Gestion dynamique du rôle pour les tests ---
let currentRole = 'admin';
let currentUserId = new mongoose.Types.ObjectId();

jest.unstable_mockModule('../../middleware/auth.ts', () => ({
    authMiddleware: (req: any, res: any, next: any) => {
        req.user = { id: currentUserId, _id: currentUserId, role: currentRole };
        next();
    },
}));

beforeAll(async () => {
    const mod = await import('../../index.ts');
    app = mod.default;

    if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
    }

    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri, { dbName: 'test' });
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
    jest.clearAllMocks();
});

beforeEach(async () => {
    await User.deleteMany({});
});

describe('POST /users (registerUser)', () => {
    beforeEach(() => {
        currentRole = 'admin';
        currentUserId = new mongoose.Types.ObjectId();
    });

    it('inscrit un nouvel utilisateur avec les données valides', async () => {
        const res = await request(app)
            .post('/api/users')
            .send({ username: 'user1', password: 'Password123@', role: 'accueil' });
        expect(res.status).toBe(201);
        expect(res.body.username).toBeDefined();
    });

    it('retourne 400 si les données sont invalides', async () => {
        const res = await request(app)
            .post('/api/users')
            .send({ username: '' });
        expect(res.status).toBe(400);
    });
});

describe('POST /users/login (loginUser)', () => {
    beforeEach(() => {
        currentRole = 'admin';
        currentUserId = new mongoose.Types.ObjectId();
    });

    it('connecte un utilisateur avec des identifiants valides', async () => {
        const hashedPassword = await bcrypt.hash('Password123@', 10);
        const user = await User.create({ username: 'loginuser', password: hashedPassword, role: 'accueil' });
        const res = await request(app)
            .post('/api/users/login')
            .send({ username: user.username, password: 'Password123@' });
        expect(res.status).toBe(200);

        // token ou user attendu
        expect(res.body.token).toBeDefined();
    });

    it('retourne 401 pour des identifiants invalides', async () => {
        const res = await request(app)
            .post('/api/users/login')
            .send({ email: 'doesnotexist@example.com', password: 'wrong' });
        expect([400, 401].includes(res.status)).toBe(true);
    });
});

describe('GET /users (getUsers)', () => {
    beforeEach(() => {
        currentRole = 'admin';
        currentUserId = new mongoose.Types.ObjectId();
    });

    it('retourne la liste des utilisateurs pour un admin', async () => {
        await User.create({ username: 'u1', password: 'p', role: 'accueil' });
        const res = await request(app)
            .get('/api/users')
            .set('Authorization', 'Bearer testtoken');
        expect(res.status).toBe(200);
        expect(res.body).toHaveLength(1);
    });
});
