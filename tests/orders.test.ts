import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { Order } from '../models/Order.ts';
import { jest } from '@jest/globals';
import { Product } from '../models/Product.ts';

let mongoServer: MongoMemoryServer;
let app: any;

// --- Gestion dynamique du rôle pour les tests ---
let currentRole = 'préparateur';
let currentUserId = new mongoose.Types.ObjectId();

jest.unstable_mockModule('../middleware/auth.ts', () => ({
    authMiddleware: (req: any, res: any, next: any) => {
        req.user = { id: currentUserId, _id: currentUserId, role: currentRole };
        next();
    },
}));

beforeAll(async () => {
    const mod = await import('../index.ts');
    app = mod.default;

    if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
    }

    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri, { dbName: "test" });
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
    jest.clearAllMocks();
});

beforeEach(async () => {
    await Order.deleteMany({});
});

// PATCH /orders/:id (préparateur)
describe('PATCH /orders/:id (préparateur)', () => {
    beforeEach(() => {
        currentRole = 'préparateur';
        currentUserId = new mongoose.Types.ObjectId();
    });

    it('permet au préparateur de passer une commande à "ready"', async () => {
        // Création d'une commande de test
        const order = await Order.create({
            products: [],
            menus: [],
            status: 'pending',
            author: new mongoose.Types.ObjectId()
        });

        const res = await request(app)
            .patch(`/api/orders/${order._id}`)
            .set('Authorization', 'Bearer testtoken')
            .send({ status: 'ready' });

        expect(res.status).toBe(200);
        expect(res.body.status).toBe('ready');
    });

    it('refuse au préparateur de passer à un autre statut que "ready"', async () => {
        const order = await Order.create({
            products: [],
            menus: [],
            status: 'pending',
            author: new mongoose.Types.ObjectId()
        });

        const res = await request(app)
            .patch(`/api/orders/${order._id}`)
            .set('Authorization', 'Bearer testtoken')
            .send({ status: 'delivered' });

        expect(res.status).toBe(403);
    });
});

// PATCH /orders/:id (accueil)
describe('PATCH /orders/:id (accueil)', () => {
    beforeEach(() => {
        currentRole = 'accueil';
        currentUserId = new mongoose.Types.ObjectId();
    });

    it('permet à l\'équipier d\'accueil de passer une commande à "delivered" si elle est "ready"', async () => {
        const order = await Order.create({
            products: [],
            menus: [],
            status: 'ready',
            author: new mongoose.Types.ObjectId()
        });

        const res = await request(app)
            .patch(`/api/orders/${order._id}`)
            .set('Authorization', 'Bearer testtoken')
            .send({ status: 'delivered' });

        expect(res.status).toBe(200);
        expect(res.body.status).toBe('delivered');
    });

    it('refuse à l\'équipier d\'accueil de passer une commande à "delivered" si elle est "pending"', async () => {
        const order = await Order.create({
            products: [],
            menus: [],
            status: 'pending',
            author: new mongoose.Types.ObjectId()
        });

        const res = await request(app)
            .patch(`/api/orders/${order._id}`)
            .set('Authorization', 'Bearer testtoken')
            .send({ status: 'delivered' });

        expect(res.status).toBe(400);
    });

    it('refuse à l\'équipier d\'accueil de passer une commande à "ready"', async () => {
        const order = await Order.create({
            products: [],
            menus: [],
            status: 'pending',
            author: new mongoose.Types.ObjectId()
        });

        const res = await request(app)
            .patch(`/api/orders/${order._id}`)
            .set('Authorization', 'Bearer testtoken')
            .send({ status: 'ready' });

        expect(res.status).toBe(403);
    });
});

describe('GET /orders (getOrdersToPrepare)', () => {
    beforeEach(() => {
        currentRole = 'préparateur';
        currentUserId = new mongoose.Types.ObjectId();
    });
    it('retourne la liste des commandes à préparer', async () => {
        await Order.create({ products: [], menus: [], status: 'pending', author: currentUserId });
        const res = await request(app)
            .get('/api/orders')
            .set('Authorization', 'Bearer testtoken');
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });
});

describe('GET /orders/:id (getOrderById)', () => {
    beforeEach(() => {
        currentRole = 'préparateur';
        currentUserId = new mongoose.Types.ObjectId();
    });
    it('retourne une commande existante', async () => {
        const order = await Order.create({ products: [], menus: [], status: 'pending', author: currentUserId });
        const res = await request(app)
            .get(`/api/orders/${order._id}`)
            .set('Authorization', 'Bearer testtoken');
        expect(res.status).toBe(200);
        expect(res.body._id).toBe(order._id.toString());
    });
    it('retourne 404 si la commande est absente', async () => {
        const fakeId = new mongoose.Types.ObjectId();
        const res = await request(app)
            .get(`/api/orders/${fakeId}`)
            .set('Authorization', 'Bearer testtoken');
        expect(res.status).toBe(404);
    });
});

describe('POST /orders (createOrder)', () => {
    beforeEach(() => {
        currentRole = 'accueil';
        currentUserId = new mongoose.Types.ObjectId();
    });
    it('crée une commande lorsque des produits sont fournis', async () => {
        const product = await Product.create({ name: 'Test Product', description: 'desc', price: 1.5, isAvailable: true });
        const res = await request(app)
            .post('/api/orders')
            .set('Authorization', 'Bearer testtoken')
            .send({ products: [product.id], menus: [], status: 'pending' });
        expect(res.status).toBe(201);
        expect(res.body.products).toBeDefined();
    });
    it('retourne 400 si la commande est vide', async () => {
        const res = await request(app)
            .post('/api/orders')
            .set('Authorization', 'Bearer testtoken')
            .send({ products: [], menus: [] });
        expect(res.status).toBe(400);
    });
});

describe('DELETE /orders/:id (deleteOrder)', () => {
    beforeEach(() => {
        currentRole = 'accueil';
        currentUserId = new mongoose.Types.ObjectId();
    });
    it('supprime la commande si l’utilisateur connecté en est l’auteur', async () => {
        const order = await Order.create({ products: [], menus: [], status: 'pending', author: currentUserId });
        const res = await request(app)
            .delete(`/api/orders/${order._id}`)
            .set('Authorization', 'Bearer testtoken');
        expect(res.status).toBe(200);
    });
    it('refuse la suppression si l’utilisateur connecté n’est pas l’auteur de la commande', async () => {
        const order = await Order.create({ products: [], menus: [], status: 'pending', author: new mongoose.Types.ObjectId() });
        const res = await request(app)
            .delete(`/api/orders/${order._id}`)
            .set('Authorization', 'Bearer testtoken');
        expect(res.status).toBe(403);
    });
});