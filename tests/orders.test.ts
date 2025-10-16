import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { Order } from '../models/Order.ts';
import { jest } from '@jest/globals';

const preparateurId = new mongoose.Types.ObjectId();
jest.unstable_mockModule('../middleware/auth.ts', () => ({
    authMiddleware: (req: any, res: any, next: any) => {
        req.user = { id: preparateurId, _id: preparateurId, role: 'préparateur' };
        next();
    },
}));

let mongoServer: MongoMemoryServer;
let app: any;

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

describe('PATCH /orders/:id (préparateur)', () => {
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