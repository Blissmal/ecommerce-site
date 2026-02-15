import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding message templates...');

  const templates = [
    // ORDER TEMPLATES
    {
      title: 'Order Shipped',
      content: 'Good news! Your order has been shipped and is on its way to you. You can track your shipment using the tracking number provided in your order details. Expected delivery: 2-3 business days.',
      category: 'ORDER',
    },
    {
      title: 'Payment Confirmed',
      content: 'Thank you! We have received your payment successfully. Your order is now being processed and will be shipped shortly. You will receive a notification once it\'s on its way.',
      category: 'ORDER',
    },
    {
      title: 'Order Delayed',
      content: 'We apologize for the inconvenience. Your order has been delayed due to high demand. We are working hard to fulfill your order and expect to ship it within 24-48 hours. Thank you for your patience!',
      category: 'ORDER',
    },
    {
      title: 'Order Delivered',
      content: 'Your order has been delivered! We hope you love your purchase. If you have any questions or concerns about your order, please don\'t hesitate to reach out. We\'d also love to hear your feedback!',
      category: 'ORDER',
    },
    {
      title: 'Refund Initiated',
      content: 'Your refund has been initiated and will be processed within 5-7 business days. The amount will be credited back to your original payment method. If you have any questions, feel free to ask!',
      category: 'ORDER',
    },

    // SUPPORT TEMPLATES
    {
      title: 'General Thanks',
      content: 'Thank you for reaching out! I\'m here to help. Could you please provide more details about your inquiry so I can assist you better?',
      category: 'SUPPORT',
    },
    {
      title: 'Looking Into It',
      content: 'Thank you for bringing this to our attention. I\'m looking into this matter right now and will get back to you with an update shortly. Your patience is appreciated!',
      category: 'SUPPORT',
    },
    {
      title: 'Issue Resolved',
      content: 'Great news! The issue has been resolved. Please let me know if everything is working properly now or if you need any further assistance. We\'re always here to help!',
      category: 'SUPPORT',
    },
    {
      title: 'Need More Info',
      content: 'To better assist you, I need a bit more information. Could you please provide:\n1) Your order number (if applicable)\n2) Details about the issue\n3) Any error messages you\'ve seen\n\nThank you!',
      category: 'SUPPORT',
    },

    // PRODUCT TEMPLATES
    {
      title: 'Product In Stock',
      content: 'Yes, this product is currently in stock and available for immediate delivery! You can place your order now and we\'ll ship it within 24 hours. Is there anything else you\'d like to know?',
      category: 'PRODUCT',
    },
    {
      title: 'Product Out of Stock',
      content: 'Unfortunately, this product is currently out of stock. However, we expect to have it back in stock within 1-2 weeks. Would you like me to notify you when it becomes available?',
      category: 'PRODUCT',
    },
    {
      title: 'Product Specifications',
      content: 'I\'d be happy to provide detailed specifications for this product. Could you let me know which specific features you\'re interested in? This will help me give you the most relevant information.',
      category: 'PRODUCT',
    },

    // GENERAL TEMPLATES
    {
      title: 'Business Hours',
      content: 'Our customer support team is available Monday through Friday, 9 AM to 6 PM EAT. If you\'ve contacted us outside these hours, we\'ll respond to your message as soon as we\'re back online. Thank you for your patience!',
      category: 'GENERAL',
    },
    {
      title: 'Closing Conversation',
      content: 'Thank you for contacting us! I\'m glad I could help. If you have any other questions in the future, please don\'t hesitate to reach out. Have a great day!',
      category: 'GENERAL',
    },
    {
      title: 'Escalation',
      content: 'I understand this is important to you. I\'m going to escalate this to our senior support team who will be better equipped to handle your request. They will reach out to you within 24 hours. Thank you for your patience!',
      category: 'GENERAL',
    },
  ];

  console.log(`📝 Creating ${templates.length} templates...`);

  let created = 0;
  for (const template of templates) {
    try {
      await prisma.messageTemplate.create({ 
        data: template 
      });
      created++;
      console.log(`✅ Created: ${template.title}`);
    } catch (error) {
      console.log(`⚠️  Skipped: ${template.title} (may already exist)`);
    }
  }

  console.log(`\n✨ Successfully created ${created} message templates!`);

  // Display summary
  const summary = await prisma.messageTemplate.groupBy({
    by: ['category'],
    _count: {
      category: true,
    },
    where: {
      isActive: true,
    },
  });

  console.log('\n📊 Summary by category:');
  summary.forEach((item) => {
    console.log(`   ${item.category || 'UNCATEGORIZED'}: ${item._count.category} templates`);
  });
}

main()
  .catch((e) => {
    console.error('❌ Error seeding templates:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });