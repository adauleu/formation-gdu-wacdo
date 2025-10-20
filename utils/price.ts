import type { IMenu } from "../models/Menu.ts";
import type { IProduct } from "../models/Product.ts";

export function calculateTotalPrice(products: Array<IProduct>, menus: Array<IMenu>): number {
    const productsTotal = products.reduce((sum, p) => sum + p.price, 0);
    const menusTotal = menus.reduce((sum, m) => sum + m.price, 0);
    return productsTotal + menusTotal;
}