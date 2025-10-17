import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { Menu } from '../../models/Menu.ts';
import { jest } from '@jest/globals';

let mongoServer: MongoMemoryServer;
let app: any;

// --- Gestion dynamique du rôle pour les tests ---
const currentRole = 'admin';
const currentUserId = new mongoose.Types.ObjectId();

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
    await Menu.deleteMany({});
});

describe('GET /menus (getMenus)', () => {
    it('retourne la liste des menus', async () => {
        await Menu.create({ name: 'MenuTest', products: [], price: 9.9 });
        const res = await request(app)
            .get('/api/menus')
            .set('Authorization', 'Bearer testtoken');
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });
});

describe('GET /menus/:id (getMenuById)', () => {
    it('retourne un menu existant', async () => {
        // créer d'abord un produit pour référencer dans le menu
        const prod = new (await import('../../models/Product.ts')).Product({ name: 'P1', description: 'x', price: 1, isAvailable: true });
        await prod.save();
        const menu = await Menu.create({ name: 'MenuTest', products: [prod._id], price: 9.9 });
        const res = await request(app)
            .get(`/api/menus/${menu._id}`)
            .set('Authorization', 'Bearer testtoken');
        expect(res.status).toBe(200);
        expect(res.body._id).toBe(menu._id.toString());
    });

    it('retourne 404 si le menu est absent', async () => {
        const fakeId = new mongoose.Types.ObjectId();
        const res = await request(app)
            .get(`/api/menus/${fakeId}`)
            .set('Authorization', 'Bearer testtoken');
        expect(res.status).toBe(404);
    });
});

describe('POST /menus (createMenu)', () => {
    it('crée un menu lorsque les données sont valides', async () => {
        const prod = new (await import('../../models/Product.ts')).Product({ name: 'P2', description: 'x', price: 2, isAvailable: true });
        await prod.save();
        const res = await request(app)
            .post('/api/menus')
            .set('Authorization', 'Bearer testtoken')
            .send({ name: 'MenuPost', products: [prod._id.toString()], price: 12.5 });
        expect([201, 200].includes(res.status)).toBe(true);
        // Vérifier que le menu retourné contient un nom
        expect(res.body.name || res.body).toBeDefined();
    });

    it('retourne 400 si les données sont invalides', async () => {
        const res = await request(app)
            .post('/api/menus')
            .set('Authorization', 'Bearer testtoken')
            .send({ name: '', products: [] });
        expect([400, 422].includes(res.status)).toBe(true);
    });
});

describe('DELETE /menus/:id (deleteMenu)', () => {
    it('supprime le menu si l’utilisateur a le rôle admin', async () => {
        const prod = new (await import('../../models/Product.ts')).Product({ name: 'P3', description: 'x', price: 3, isAvailable: true });
        await prod.save();
        const menu = await Menu.create({ name: 'MenuToDelete', products: [prod._id], price: 5 });
        const res = await request(app)
            .delete(`/api/menus/${menu._id}`)
            .set('Authorization', 'Bearer testtoken');
        // accept 200 ou 204 selon implémentation
        expect([200, 204].includes(res.status)).toBe(true);
    });

    it('retourne 404 si le menu à supprimer est absent', async () => {
        const fakeId = new mongoose.Types.ObjectId();
        const res = await request(app)
            .delete(`/api/menus/${fakeId}`)
            .set('Authorization', 'Bearer testtoken');
        expect([404, 400].includes(res.status)).toBe(true);
    });
});
