import { PrismaClient, Prisma, ProductStatus, AdminRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

type SeedProduct = {
  name: string;
  brand: string;
  price: number;
  salePrice?: number | null;
  slug: string;
  imageUrl: string;
  imageUrlAlt?: string | null;
  description: string;
};

const products: SeedProduct[] = [
  {
    name: "Asan Tarjuma Quran",
    brand: "Quran",
    price: 2499,
    salePrice: 1999,
    slug: "asan-tarjuma-quran",
    imageUrl: "/books/asan-tarjuma-quran-1.webp",
    imageUrlAlt: "/books/asan-tarjuma-quran-2.webp",
    description:
      "<p>An easy-to-read Urdu translation of the Holy Quran by Dr. Israr Ahmed, designed for daily recitation, reflection, and understanding.</p>"
  },
  {
    name: "Bayan-Ul-Quran by Dr. Israr Ahmed",
    brand: "Quran",
    price: 1899,
    slug: "bayan-ul-quran-by-dr-israr-ahmed",
    imageUrl: "/books/bayan-ul-quran-by-dr-israr-ahmed-1.webp",
    description:
      "<p>A respected Quranic commentary from Dr. Israr Ahmed, presented in a clear format for readers who want deeper insight into the meanings of the Quran.</p>"
  },
  {
    name: "Beautiful Quran Kareem | Luxury Islamic Gift Edition",
    brand: "Quran",
    price: 2999,
    salePrice: 2499,
    slug: "beautiful-quran-kareem-luxury-islamic-gift-edition",
    imageUrl: "/books/beautiful-quran-kareem-luxury-islamic-gift-edition-1.webp",
    imageUrlAlt: "/books/beautiful-quran-kareem-luxury-islamic-gift-edition-2.webp",
    description:
      "<p>A premium Quran Kareem gift edition with elegant presentation, suitable for gifting and personal recitation.</p>"
  },
  {
    name: "Seerat-un-Nabi by Dr. Israr Ahmad",
    brand: "Book",
    price: 1399,
    slug: "seerat-un-nabi-by-dr-israr-ahmad-buy-online",
    imageUrl: "/books/seerat-un-nabi-by-dr-israr-ahmad-buy-online-1.webp",
    imageUrlAlt: "/books/seerat-un-nabi-by-dr-israr-ahmad-buy-online-2.webp",
    description:
      "<p>An insightful Urdu book on the Seerah of the Prophet with thoughtful commentary and accessible language.</p>"
  },
  {
    name: "Waqia Karbala - The Historic Story of Imam Hussain (RA)",
    brand: "Book",
    price: 1199,
    slug: "waqia-karbala-the-historic-story-of-imam-hussain-ra-islamic-urdu-book",
    imageUrl: "/books/waqia-karbala-the-historic-story-of-imam-hussain-ra-islamic-urdu-book-1.webp",
    imageUrlAlt: "/books/waqia-karbala-the-historic-story-of-imam-hussain-ra-islamic-urdu-book-2.webp",
    description:
      "<p>A concise Islamic Urdu book covering the historic events of Karbala and the sacrifice of Imam Hussain (RA).</p>"
  }
];

async function main() {
  await prisma.sequence.upsert({
    where: { id: 1 },
    create: { id: 1, lastNumber: 999 },
    update: {}
  });

  const passwordHash = await bcrypt.hash("islamicplay@234", 12);
  await prisma.adminUser.upsert({
    where: { email: "islamicplay234" },
    create: { email: "islamicplay234", passwordHash, role: AdminRole.SUPERADMIN },
    update: { passwordHash, role: AdminRole.SUPERADMIN }
  });

  const businessInfo = {
    contactPhone: "+92 300 1234567",
    contactEmail: "hello@islamicplay.store",
    shopAddress: "Clifton, Karachi, Pakistan",
    whatsappNumber: "+923001234567"
  };

  const seoSettings = {
    siteTitle: "IslamicPlay",
    titleTemplate: "%s | IslamicPlay",
    metaDescription: "Elegant IslamicPlay shopping with a refined, premium experience.",
    canonicalUrl: "https://islamicplay.store",
    metaKeywords: "quran, islamic books, urdu books, islamicplay, pakistan",
    ogTitle: "IslamicPlay",
    ogDescription: "Elegant IslamicPlay shopping with a refined, premium experience.",
    ogImage: "",
    headerScripts: "",
    footerScripts: "",
    robotsTxt: "User-agent: *\nAllow: /"
  };

  const emailSettings = {
    host: "",
    port: "587",
    user: "",
    password: "",
    fromName: "IslamicPlay",
    fromEmail: "no-reply@islamicplay.store"
  };

  const bannerSettings = {
    desktopImages: ["/ui-image/banner.png"],
    mobileImages: ["/ui-image/banner.png"]
  };

  await prisma.siteSettings.upsert({
    where: { key: "businessInfo" },
    create: { key: "businessInfo", value: JSON.stringify(businessInfo) },
    update: { value: JSON.stringify(businessInfo) }
  });
  await prisma.siteSettings.upsert({
    where: { key: "seoSettings" },
    create: { key: "seoSettings", value: JSON.stringify(seoSettings) },
    update: { value: JSON.stringify(seoSettings) }
  });
  await prisma.siteSettings.upsert({
    where: { key: "emailSettings" },
    create: { key: "emailSettings", value: JSON.stringify(emailSettings) },
    update: { value: JSON.stringify(emailSettings) }
  });
  await prisma.siteSettings.upsert({
    where: { key: "bannerSettings" },
    create: { key: "bannerSettings", value: JSON.stringify(bannerSettings) },
    update: { value: JSON.stringify(bannerSettings) }
  });

  for (const product of products) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      create: {
        name: product.name,
        brand: product.brand,
        description: product.description,
        price: new Prisma.Decimal(product.price),
        salePrice: product.salePrice ? new Prisma.Decimal(product.salePrice) : null,
        saleEndsAt: product.salePrice ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) : null,
        images: product.imageUrlAlt ? [product.imageUrl, product.imageUrlAlt] : [product.imageUrl],
        videoUrl: null,
        stock: 12,
        status: ProductStatus.PUBLISHED,
        slug: product.slug
      },
      update: {
        name: product.name,
        brand: product.brand,
        description: product.description,
        price: new Prisma.Decimal(product.price),
        salePrice: product.salePrice ? new Prisma.Decimal(product.salePrice) : null,
        saleEndsAt: product.salePrice ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) : null,
        images: product.imageUrlAlt ? [product.imageUrl, product.imageUrlAlt] : [product.imageUrl],
        videoUrl: null,
        stock: 12,
        status: ProductStatus.PUBLISHED
      }
    });
  }

  await prisma.testimonial.deleteMany({});
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
