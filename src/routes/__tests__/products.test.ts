import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { Product } from '../../models/Product';
import { vi } from 'vitest';
import app from '../../index';

let mongoServer: MongoMemoryServer;

// --- Gestion dynamique du rôle pour les tests ---
const currentRole = 'admin';
const currentUserId = new mongoose.Types.ObjectId();

vi.mock('../../middleware/auth', () => ({
    authMiddleware: (req: any, res: any, next: any) => {
        req.user = { id: currentUserId, _id: currentUserId, role: currentRole };
        next();
    },
}));

beforeAll(async () => {
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
    vi.clearAllMocks();
});

beforeEach(async () => {
    await Product.deleteMany({});
});

describe('GET /products (getProducts)', () => {
    it('retourne la liste des produits', async () => {
        await Product.create({ name: 'ProdTest', description: 'x', price: 1.5, isAvailable: true });
        const res = await request(app)
            .get('/api/products')
            .set('Authorization', 'Bearer testtoken');
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });
});

describe('GET /products/:id (getProductById)', () => {
    it('retourne un produit existant', async () => {
        const product = await Product.create({ name: 'ProdTest', description: 'x', price: 1.5, isAvailable: true });
        const res = await request(app)
            .get(`/api/products/${product._id}`)
            .set('Authorization', 'Bearer testtoken');
        expect(res.status).toBe(200);
        expect(res.body._id).toBe(product._id.toString());
    });

    it('retourne 404 si le produit est absent', async () => {
        const fakeId = new mongoose.Types.ObjectId();
        const res = await request(app)
            .get(`/api/products/${fakeId}`)
            .set('Authorization', 'Bearer testtoken');
        expect(res.status).toBe(404);
    });
});

describe('POST /products (createProduct)', () => {
    it('crée un produit lorsque les données sont valides', async () => {
        const res = await request(app)
            .post('/api/products')
            .set('Authorization', 'Bearer testtoken')
            .send({ name: 'NewProd', description: 'desc', price: 3.2, isAvailable: true });
        expect([201, 200].includes(res.status)).toBe(true);
        expect(res.body.name).toBe('NewProd');
    });

    it('retourne 400 si les données sont invalides', async () => {
        const res = await request(app)
            .post('/api/products')
            .set('Authorization', 'Bearer testtoken')
            .send({ name: '' });
        expect(res.status).toBe(400);
    });
});

describe('DELETE /products/:id (deleteProduct)', () => {
    it('supprime le produit si l’utilisateur a le rôle admin', async () => {
        const product = await Product.create({ name: 'ProdToDelete', description: 'x', price: 2, isAvailable: true });
        const res = await request(app)
            .delete(`/api/products/${product._id}`)
            .set('Authorization', 'Bearer testtoken');
        expect(res.status).toBe(200);
    });

    it('retourne 404 si le produit à supprimer est absent', async () => {
        const fakeId = new mongoose.Types.ObjectId();
        const res = await request(app)
            .delete(`/api/products/${fakeId}`)
            .set('Authorization', 'Bearer testtoken');
        expect(res.status).toBe(404);
    });
});
