import type { IMenu } from "../../models/Menu.ts";
import type { IProduct } from "../../models/Product.ts";
import { calculateTotalPrice } from "../price.ts";

describe('calculateTotalPrice', () => {
    it("retourne 0 quand il n'y a ni produits ni menus", () => {
        const total = calculateTotalPrice([], []);
        expect(total).toBe(0);
    });

    it('additionne uniquement les produits', () => {
        const products = [
            { price: 3 },
            { price: 4.5 },
        ] as IProduct[];
        const total = calculateTotalPrice(products, []);
        expect(total).toBeCloseTo(7.5);
    });

    it('additionne uniquement les menus', () => {
        const menus = [
            { price: 9 },
            { price: 1 },
        ] as IMenu[];
        const total = calculateTotalPrice([], menus);
        expect(total).toBe(10);
    });

    it('additionne produits et menus ensemble', () => {
        const products = [{ price: 2 }, { price: 3 }] as IProduct[];
        const menus = [{ price: 5 }] as IMenu[];
        const total = calculateTotalPrice(products, menus);
        expect(total).toBe(10);
    });

    test('gère correctement les prix décimaux', () => {
        const products = [{ price: 0.1 }, { price: 0.2 }] as IProduct[];
        const menus = [{ price: 0.3 }] as IMenu[];
        const total = calculateTotalPrice(products, menus);
        expect(total).toBeCloseTo(0.6);
    });
});
