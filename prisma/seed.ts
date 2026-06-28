import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // ── Users ──
  const passwordHash = await bcrypt.hash("password123", 12);

  const superAdmin = await prisma.user.upsert({
    where: { email: "admin@luxesalon.com" },
    update: {},
    create: {
      email: "admin@luxesalon.com",
      passwordHash,
      firstName: "Admin",
      lastName: "User",
      role: "SUPER_ADMIN",
      emailVerified: true,
    },
  });

  const manager = await prisma.user.upsert({
    where: { email: "manager@luxesalon.com" },
    update: {},
    create: {
      email: "manager@luxesalon.com",
      passwordHash,
      firstName: "Sarah",
      lastName: "Johnson",
      role: "MANAGER",
      emailVerified: true,
    },
  });

  const receptionist = await prisma.user.upsert({
    where: { email: "reception@luxesalon.com" },
    update: {},
    create: {
      email: "reception@luxesalon.com",
      passwordHash,
      firstName: "Emily",
      lastName: "Davis",
      role: "RECEPTIONIST",
      emailVerified: true,
    },
  });

  // ── Stylists ──
  const stylistUsers = [
    { email: "sophia@luxesalon.com", firstName: "Sophia", lastName: "Laurent", bio: "Trained in Paris and Milan, Sophia brings European elegance to every cut.", specialties: ["Precision Cuts", "Editorial", "Bridal"], commissionRate: 0.45, rating: 4.9, isFeatured: true },
    { email: "marcus@luxesalon.com", firstName: "Marcus", lastName: "Chen", bio: "Color virtuoso known for dimensional, natural-looking hues.", specialties: ["Color", "Balayage", "Men's Cuts"], commissionRate: 0.4, rating: 4.8, isFeatured: true },
    { email: "isabella@luxesalon.com", firstName: "Isabella", lastName: "Rose", bio: "Creative color work featured in Vogue and Harper's Bazaar.", specialties: ["Creative Color", "Vivid", "Corrections"], commissionRate: 0.4, rating: 4.9, isFeatured: true },
    { email: "aria@luxesalon.com", firstName: "Aria", lastName: "Nakamura", bio: "Holistic skincare combining advanced technology with traditional techniques.", specialties: ["Facials", "Peels", "Anti-Aging"], commissionRate: 0.4, rating: 4.8 },
    { email: "james@luxesalon.com", firstName: "James", lastName: "Okafor", bio: "Specializes in curly and coily hair textures.", specialties: ["Natural Hair", "Locs", "Texture"], commissionRate: 0.35, rating: 4.7 },
    { email: "elena@luxesalon.com", firstName: "Elena", lastName: "Vasquez", bio: "Nail art is miniature masterpieces. Impeccable work always.", specialties: ["Nail Art", "Gel", "Extensions"], commissionRate: 0.35, rating: 4.8 },
  ];

  const stylists = [];
  for (const s of stylistUsers) {
    const user = await prisma.user.upsert({
      where: { email: s.email },
      update: {},
      create: {
        email: s.email,
        passwordHash,
        firstName: s.firstName,
        lastName: s.lastName,
        role: "STYLIST",
        emailVerified: true,
      },
    });
    const stylist = await prisma.stylist.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        bio: s.bio,
        specialties: s.specialties,
        commissionRate: s.commissionRate,
        rating: s.rating,
        isFeatured: s.isFeatured || false,
      },
    });
    stylists.push(stylist);

    // Create availability (Mon-Sat)
    for (let day = 1; day <= 6; day++) {
      await prisma.availability.upsert({
        where: { stylistId_dayOfWeek: { stylistId: stylist.id, dayOfWeek: day } },
        update: {},
        create: {
          stylistId: stylist.id,
          dayOfWeek: day,
          startTime: "09:00",
          endTime: "18:00",
          breakStart: "12:00",
          breakEnd: "13:00",
          isAvailable: true,
        },
      });
    }
  }

  // ── Categories ──
  const categories = [
    { name: "Hair", slug: "hair", description: "Expert hair services from cuts to color", icon: "scissors", sortOrder: 1 },
    { name: "Skincare", slug: "skincare", description: "Advanced facial treatments and skincare", icon: "sparkles", sortOrder: 2 },
    { name: "Nails", slug: "nails", description: "Manicures, pedicures, and nail art", icon: "hand", sortOrder: 3 },
    { name: "Wellness", slug: "wellness", description: "Massage and relaxation therapies", icon: "heart", sortOrder: 4 },
    { name: "Bridal", slug: "bridal", description: "Complete bridal beauty packages", icon: "crown", sortOrder: 5 },
  ];

  const createdCategories = [];
  for (const cat of categories) {
    const c = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
    createdCategories.push(c);
  }

  // ── Services ──
  const services = [
    { name: "Precision Cut & Style", slug: "precision-cut", description: "Expert cutting techniques tailored to your face shape and hair texture.", price: 85, duration: 60, categoryId: createdCategories[0].id, isPopular: true, depositAmount: 20 },
    { name: "Color & Highlights", slug: "color-highlights", description: "Full color, balayage, highlights, and creative color techniques.", price: 150, duration: 120, categoryId: createdCategories[0].id, isPopular: true, depositAmount: 50 },
    { name: "Blowout & Style", slug: "blowout-style", description: "Professional blowout and styling for any occasion.", price: 65, duration: 45, categoryId: createdCategories[0].id, depositAmount: 0 },
    { name: "Keratin Treatment", slug: "keratin-treatment", description: "Smoothing treatment for frizz-free, manageable hair.", price: 300, duration: 150, categoryId: createdCategories[0].id, depositAmount: 100 },
    { name: "Classic Facial", slug: "classic-facial", description: "Deep cleanse, exfoliation, and hydrating mask.", price: 95, duration: 60, categoryId: createdCategories[1].id, depositAmount: 0 },
    { name: "Luxury Facial", slug: "luxury-facial", description: "Advanced treatment with LED therapy and premium serums.", price: 150, duration: 90, categoryId: createdCategories[1].id, isPopular: true, depositAmount: 40 },
    { name: "Chemical Peel", slug: "chemical-peel", description: "AHA/BHA resurfacing treatment for renewed skin.", price: 175, duration: 60, categoryId: createdCategories[1].id, depositAmount: 50 },
    { name: "Classic Manicure", slug: "classic-manicure", description: "Shape, buff, cuticle care, and polish.", price: 40, duration: 30, categoryId: createdCategories[2].id, depositAmount: 0 },
    { name: "Gel Manicure", slug: "gel-manicure", description: "Long-lasting gel polish with meticulous application.", price: 65, duration: 45, categoryId: createdCategories[2].id, isPopular: true, depositAmount: 15 },
    { name: "Luxury Pedicure", slug: "luxury-pedicure", description: "Soak, scrub, mask, massage, and polish.", price: 75, duration: 60, categoryId: createdCategories[2].id, depositAmount: 0 },
    { name: "Deep Tissue Massage", slug: "deep-tissue-massage", description: "Therapeutic massage to release tension and restore balance.", price: 120, duration: 60, categoryId: createdCategories[3].id, isPopular: true, depositAmount: 30 },
    { name: "Hot Stone Massage", slug: "hot-stone-massage", description: "Heated stones melt away stress and muscle tension.", price: 140, duration: 75, categoryId: createdCategories[3].id, depositAmount: 40 },
    { name: "Bridal Hair & Makeup", slug: "bridal-hair-makeup", description: "Complete bridal look with trial session included.", price: 350, duration: 180, categoryId: createdCategories[4].id, depositAmount: 100 },
    { name: "Bridal Package Deluxe", slug: "bridal-package-deluxe", description: "Hair, makeup, nails, and facial for the complete bridal experience.", price: 650, duration: 300, categoryId: createdCategories[4].id, depositAmount: 200 },
  ];

  for (const svc of services) {
    await prisma.service.upsert({
      where: { slug: svc.slug },
      update: {},
      create: svc,
    });
  }

  // ── Assign services to stylists ──
  const allServices = await prisma.service.findMany();
  const hairServices = allServices.filter(s => ["precision-cut", "color-highlights", "blowout-style", "keratin-treatment"].includes(s.slug));
  const skinServices = allServices.filter(s => ["classic-facial", "luxury-facial", "chemical-peel"].includes(s.slug));
  const nailServices = allServices.filter(s => ["classic-manicure", "gel-manicure", "luxury-pedicure"].includes(s.slug));

  // Sophia - hair
  for (const svc of hairServices) {
    await prisma.stylist.update({
      where: { id: stylists[0].id },
      data: { services: { connect: { id: svc.id } } },
    });
  }
  // Marcus - hair
  for (const svc of hairServices) {
    await prisma.stylist.update({
      where: { id: stylists[1].id },
      data: { services: { connect: { id: svc.id } } },
    });
  }
  // Isabella - hair
  for (const svc of hairServices) {
    await prisma.stylist.update({
      where: { id: stylists[2].id },
      data: { services: { connect: { id: svc.id } } },
    });
  }
  // Aria - skincare
  for (const svc of skinServices) {
    await prisma.stylist.update({
      where: { id: stylists[3].id },
      data: { services: { connect: { id: svc.id } } },
    });
  }
  // Elena - nails
  for (const svc of nailServices) {
    await prisma.stylist.update({
      where: { id: stylists[5].id },
      data: { services: { connect: { id: svc.id } } },
    });
  }

  // ── Customers ──
  const customerData = [
    { email: "emma@example.com", firstName: "Emma", lastName: "Mitchell", phone: "+13105550101" },
    { email: "jessica@example.com", firstName: "Jessica", lastName: "Wang", phone: "+13105550102" },
    { email: "rachel@example.com", firstName: "Rachel", lastName: "Park", phone: "+13105550103" },
    { email: "danielle@example.com", firstName: "Danielle", lastName: "Thompson", phone: "+13105550104" },
    { email: "sarah@example.com", firstName: "Sarah", lastName: "Lee", phone: "+13105550105" },
    { email: "maya@example.com", firstName: "Maya", lastName: "Kumar", phone: "+13105550106" },
  ];

  const customers = [];
  for (const c of customerData) {
    const user = await prisma.user.upsert({
      where: { email: c.email },
      update: {},
      create: {
        email: c.email,
        passwordHash,
        firstName: c.firstName,
        lastName: c.lastName,
        phone: c.phone,
        role: "CUSTOMER",
        emailVerified: true,
      },
    });
    const customer = await prisma.customer.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        loyaltyPoints: Math.floor(Math.random() * 2000),
        totalVisits: Math.floor(Math.random() * 30) + 5,
        totalSpent: Math.floor(Math.random() * 5000) + 500,
      },
    });
    customers.push(customer);
  }

  // ── Membership Plans ──
  const plans = [
    { name: "Essential", slug: "essential", description: "Perfect for regular maintenance", price: 79, duration: 1, services: ["1 haircut per month", "10% off all services", "Priority booking"], discount: 10 },
    { name: "Luxe", slug: "luxe", description: "For the beauty enthusiast", price: 149, duration: 1, services: ["2 haircuts per month", "1 complimentary facial", "20% off all services", "VIP lounge access"], discount: 20 },
    { name: "Prestige", slug: "prestige", description: "The ultimate luxury experience", price: 299, duration: 1, services: ["Unlimited haircuts", "2 facials per month", "30% off all services", "Personal stylist"], discount: 30 },
  ];

  for (const plan of plans) {
    await prisma.membershipPlan.upsert({
      where: { slug: plan.slug },
      update: {},
      create: plan,
    });
  }

  // ── Sample Appointments ──
  const allServicesList = await prisma.service.findMany();
  const cutService = allServicesList.find(s => s.slug === "precision-cut");
  const facialService = allServicesList.find(s => s.slug === "luxury-facial");

  if (cutService && facialService && customers.length > 0 && stylists.length > 0) {
    const today = new Date();
    for (let i = 0; i < 5; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const startTime = new Date(date);
      startTime.setHours(9 + i, 0, 0, 0);
      const endTime = new Date(startTime);
      endTime.setMinutes(endTime.getMinutes() + 60);

      await prisma.appointment.create({
        data: {
          bookingRef: `LX-SEED${i}A1B2`,
          customerId: customers[i % customers.length].id,
          stylistId: stylists[i % stylists.length].id,
          date,
          startTime,
          endTime,
          status: i < 3 ? "CONFIRMED" : "PENDING",
          services: {
            create: [{
              serviceId: cutService.id,
              price: cutService.price,
              duration: cutService.duration,
            }],
          },
        },
      });
    }
  }

  // ── Coupons ──
  await prisma.coupon.upsert({
    where: { code: "WELCOME20" },
    update: {},
    create: {
      code: "WELCOME20",
      description: "20% off for new clients",
      discountType: "PERCENTAGE",
      discountValue: 20,
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      isActive: true,
    },
  });

  await prisma.coupon.upsert({
    where: { code: "SUMMER30" },
    update: {},
    create: {
      code: "SUMMER30",
      description: "$30 off color services",
      discountType: "FIXED",
      discountValue: 30,
      minPurchase: 100,
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      isActive: true,
    },
  });

  // ── Inventory ──
  const inventoryItems = [
    { name: "Oribe Gold Lust Shampoo", sku: "ORIBE-GL-SH-500", category: "Hair Care", quantity: 24, minQuantity: 10, unitPrice: 52 },
    { name: "Kerastase Nutritive Mask", sku: "KERAST-NUT-MK-200", category: "Hair Care", quantity: 18, minQuantity: 8, unitPrice: 68 },
    { name: "Dermalogica Daily Mudscrub", sku: "DERM-DMS-75", category: "Skincare", quantity: 12, minQuantity: 5, unitPrice: 45 },
    { name: "OPI Infinite Shine Polish Set", sku: "OPI-IS-SET-12", category: "Nail Care", quantity: 8, minQuantity: 3, unitPrice: 89 },
    { name: "Olaplex No.3 Hair Perfector", sku: "OLAPLEX-3-100", category: "Hair Treatment", quantity: 30, minQuantity: 10, unitPrice: 30 },
  ];

  for (const item of inventoryItems) {
    await prisma.inventoryItem.upsert({
      where: { sku: item.sku },
      update: {},
      create: item,
    });
  }

  console.log("✅ Seed complete!");
  console.log("");
  console.log("📋 Login credentials:");
  console.log("   Super Admin:  admin@luxesalon.com / password123");
  console.log("   Manager:      manager@luxesalon.com / password123");
  console.log("   Receptionist: reception@luxesalon.com / password123");
  console.log("   Stylist:      sophia@luxesalon.com / password123");
  console.log("   Customer:     emma@example.com / password123");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
