const { PrismaClient } = require("@prisma/client");
const { sendOrderConfirmationEmail } = require("./src/lib/email/order-email-service.ts");

const prisma = new PrismaClient();

async function sendEmail() {
  console.log("Fetching order...");
  
  const order = await prisma.order.findFirst({
    where: {
      orderNumber: "ORD-1760879829704"
    },
    include: {
      OrderItem: true,
      User: true
    }
  });
  
  if (!order) {
    throw new Error("Order not found");
  }
  
  console.log("Order found:", order.orderNumber);
  console.log("Sending email to:", order.email);
  
  await sendOrderConfirmationEmail(order);
  
  console.log("✅ Order confirmation email sent!");
  
  await prisma.$disconnect();
}

sendEmail().catch((error) => {
  console.error("❌ Error:", error);
  process.exit(1);
});
