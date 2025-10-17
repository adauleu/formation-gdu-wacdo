export function calculateTotalPrice(products: Array<{ price: number }>, menus: Array<{ price: number }>): number {
    const productsTotal = products.reduce((sum, p) => sum + (p.price || 0), 0);
    const menusTotal = menus.reduce((sum, m) => sum + (m.price || 0), 0);
    return productsTotal + menusTotal;
}