import type { IOrderItem } from '../models/Order';

export function calculateTotalPrice(items: Array<IOrderItem>): number {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}