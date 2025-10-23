"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const db_1 = require("./config/db");
const products_route_1 = __importDefault(require("./routes/products.route"));
const orders_route_1 = __importDefault(require("./routes/orders.route"));
const menus_route_1 = __importDefault(require("./routes/menus.route"));
const users_route_1 = __importDefault(require("./routes/users.route"));
const helmet_1 = __importDefault(require("helmet"));
const cors_1 = __importDefault(require("cors"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const dotenv_1 = __importDefault(require("dotenv"));
const swagger_1 = require("./swagger");
const node_module_1 = require("node:module");
const node_url_1 = require("node:url");
(0, node_module_1.register)("ts-node/esm", (0, node_url_1.pathToFileURL)("./"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
app.use((0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 100,
    validate: { xForwardedForHeader: false }
}));
// Middleware to parse JSON bodies
app.use(express_1.default.json());
app.use(express_1.default.static('uploads'));
(0, db_1.connectDB)();
// Define your routes
app.get('/', (req, res) => {
    res.json({ message: 'Hello from Express on Vercel!' });
});
app.use('/api/products', products_route_1.default);
app.use('/api/orders', orders_route_1.default);
app.use('/api/menus', menus_route_1.default);
app.use('/api/users', users_route_1.default);
(0, swagger_1.setupSwagger)(app);
if (!process.env.VERCEL && process.env.NODE_ENV !== 'test') {
    const PORT = process.env.PORT || 3000;
    // Démarrage local
    app.listen(PORT, () => {
        console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
    });
}
exports.default = app;
