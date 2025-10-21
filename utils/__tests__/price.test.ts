import type { IMenu } from "../../models/Menu.ts";
import type { IOrder, IOrderItem } from "../../models/Order.ts";
import type { IProduct } from "../../models/Product.ts";
import { calculateTotalPrice } from "../price.ts";

describe('calculateTotalPrice', () => {
    it("retourne 0 quand il n'y a pas d'items", () => {
        const total = calculateTotalPrice([]);
        expect(total).toBe(0);
    });

    it('additionne des produits avec une quantité 1', () => {
        const items = [
            { price: 3, quantity: 1 },
            { price: 4.5, quantity: 1 },
        ] as IOrderItem[];
        const total = calculateTotalPrice(items);
        expect(total).toBe(7.5);
    });

    it('additionne des produits avec une quantité multiple', () => {
        const items = [
            { price: 3, quantity: 4 },
            { price: 4.5, quantity: 6 },
        ] as IOrderItem[];
        const total = calculateTotalPrice(items);
        expect(total).toBe(39);
    });

    test('gère correctement les prix décimaux', () => {
        const items = [{ price: 0.1, quantity: 1 }, { price: 0.2, quantity: 2 }] as IOrderItem[];
        const total = calculateTotalPrice(items);
        expect(total).toBe(0.5);
    });
});
