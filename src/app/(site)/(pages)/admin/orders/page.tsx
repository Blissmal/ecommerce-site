// app/admin/orders/page.tsx
import { prisma } from "../../../../../../lib/prisma";
import OrdersClient from "./OrderClient";

async function getOrders() {
  return await prisma.order.findMany({
    include: {
      user: { select: { name: true, email: true } },
      orderItems: {
        include: {
          product: { select: { title: true, price: true } },
          variant: true,
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
}

async function getOrderStats() {
  const [total, pending, processing, shipped, delivered, cancelled, failed, totalRevenue] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({ where: { status: 'PENDING' } }),
    prisma.order.count({ where: { status: 'PROCESSING' } }),
    prisma.order.count({ where: { status: 'SHIPPED' } }),
    prisma.order.count({ where: { status: 'DELIVERED' } }),
    prisma.order.count({ where: { status: 'CANCELLED' } }),
    prisma.order.count({ where: { status: 'FAILED' } }),
    prisma.order.aggregate({
      _sum: { total: true },
      where: { status: 'DELIVERED' }
    })
  ]);

  return {
    total,
    pending,
    processing,
    shipped,
    delivered,
    cancelled,
    failed,
    totalRevenue: totalRevenue._sum.total || 0
  };
}

export default async function OrdersPage() {
  const orders = await getOrders();
  const stats = await getOrderStats();

  return <OrdersClient orders={orders} stats={stats} />;
}