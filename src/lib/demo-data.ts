export const demoProducts = [
  {
    id: "demo-asan-tarjuma-quran",
    name: "Asan Tarjuma Quran",
    slug: "asan-tarjuma-quran",
    brand: "Quran",
    price: "2499",
    salePrice: "1999",
    images: ["/books/asan-tarjuma-quran-1.webp", "/books/asan-tarjuma-quran-2.webp"]
  },
  {
    id: "demo-bayan-ul-quran",
    name: "Bayan-Ul-Quran by Dr. Israr Ahmed",
    slug: "bayan-ul-quran-by-dr-israr-ahmed",
    brand: "Quran",
    price: "1899",
    salePrice: null,
    images: ["/books/bayan-ul-quran-by-dr-israr-ahmed-1.webp"]
  },
  {
    id: "demo-beautiful-quran-kareem",
    name: "Beautiful Quran Kareem | Luxury Islamic Gift Edition",
    slug: "beautiful-quran-kareem-luxury-islamic-gift-edition",
    brand: "Quran",
    price: "2999",
    salePrice: "2499",
    images: [
      "/books/beautiful-quran-kareem-luxury-islamic-gift-edition-1.webp",
      "/books/beautiful-quran-kareem-luxury-islamic-gift-edition-2.webp"
    ]
  },
  {
    id: "demo-seerat-un-nabi",
    name: "Seerat-un-Nabi by Dr. Israr Ahmad",
    slug: "seerat-un-nabi-by-dr-israr-ahmad-buy-online",
    brand: "Book",
    price: "1399",
    salePrice: null,
    images: [
      "/books/seerat-un-nabi-by-dr-israr-ahmad-buy-online-1.webp",
      "/books/seerat-un-nabi-by-dr-israr-ahmad-buy-online-2.webp"
    ]
  },
  {
    id: "demo-waqia-karbala",
    name: "Waqia Karbala - The Historic Story of Imam Hussain (RA)",
    slug: "waqia-karbala-the-historic-story-of-imam-hussain-ra-islamic-urdu-book",
    brand: "Book",
    price: "1199",
    salePrice: null,
    images: [
      "/books/waqia-karbala-the-historic-story-of-imam-hussain-ra-islamic-urdu-book-1.webp",
      "/books/waqia-karbala-the-historic-story-of-imam-hussain-ra-islamic-urdu-book-2.webp"
    ]
  }
] as const;

export const demoTestimonials = [
  {
    id: "demo-testimonial-1",
    customerName: "Ali Hassan",
    customerImage: "/testimonials/ali-hassan.jpg",
    rating: 5,
    reviewText: "The packaging and presentation felt thoughtful and professional from start to finish."
  },
  {
    id: "demo-testimonial-2",
    customerName: "Fatima Khan",
    customerImage: "/testimonials/fatima-khan.jpg",
    rating: 5,
    reviewText: "Beautiful product photos, smooth communication, and a very reliable buying experience."
  },
  {
    id: "demo-testimonial-3",
    customerName: "Usman Malik",
    customerImage: "/testimonials/usman-malik.jpg",
    rating: 5,
    reviewText: "Premium service from order to delivery. The attention to detail really stood out."
  },
  {
    id: "demo-testimonial-4",
    customerName: "Zara Ahmed",
    customerImage: "/testimonials/zara-ahmed.jpg",
    rating: 5,
    reviewText: "The site feels polished and the collection is presented in a very trustworthy way."
  },
  {
    id: "demo-testimonial-5",
    customerName: "Ahmed Raza",
    customerImage: "/testimonials/ahmed-raza.jpg",
    rating: 5,
    reviewText: "Excellent trust building with clear photos, COD support, and fast follow-up."
  },
  {
    id: "demo-testimonial-6",
    customerName: "Sana Malik",
    customerImage: "/testimonials/sana-malik.jpg",
    rating: 5,
    reviewText: "A very premium browsing experience, especially on mobile. Everything felt easy to use."
  },
  {
    id: "demo-testimonial-7",
    customerName: "Omar Sheikh",
    customerImage: "/testimonials/omar-sheikh.jpg",
    rating: 5,
    reviewText: "The overall feel is elegant, respectful, and very trustworthy."
  },
  {
    id: "demo-testimonial-8",
    customerName: "Ayesha Butt",
    customerImage: "/testimonials/ayesha-butt.jpg",
    rating: 5,
    reviewText: "Really liked the clean layout and how the products are presented with premium styling."
  }
] as const;

export const demoSocialProof = [
  { name: "Ali Hassan", city: "Lahore", product: "Asan Tarjuma Quran" },
  { name: "Fatima Khan", city: "Karachi", product: "Beautiful Quran Kareem" },
  { name: "Usman Malik", city: "Islamabad", product: "Seerat-un-Nabi" },
  { name: "Zara Ahmed", city: "Rawalpindi", product: "Bayan-Ul-Quran" },
  { name: "Ahmed Raza", city: "Peshawar", product: "Waqia Karbala" }
] as const;
