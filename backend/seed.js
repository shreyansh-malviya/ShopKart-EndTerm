// Seeds the catalogue with sample products.
// Usage: npm run seed            -> inserts products only if the collection is empty
//        npm run seed -- --reset -> deletes all products first, then inserts
import "dotenv/config";
import mongoose from "mongoose";
import connectDB from "./config/db.js";
import Product from "./models/product.model.js";

const img = (path) => `https://cdn.dummyjson.com/product-images/${path}/1.webp`;
const cover = (isbn) => `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`;

const products = [
  // Electronics
  {
    name: "iPhone 13 Pro",
    description: "6.1-inch Super Retina XDR display with ProMotion, A15 Bionic chip and a pro triple-camera system with macro photography.",
    price: 99999,
    category: "Electronics",
    image: img("smartphones/iphone-13-pro"),
    stock: 15,
  },
  {
    name: "Apple MacBook Pro 14 Inch Space Grey",
    description: "14-inch Liquid Retina XDR display, Apple silicon, up to 17 hours of battery life and a 1080p FaceTime HD camera.",
    price: 169900,
    category: "Electronics",
    image: img("laptops/apple-macbook-pro-14-inch-space-grey"),
    stock: 8,
  },
  {
    name: "Lenovo Yoga 920",
    description: "Convertible 13.9-inch laptop with a 360-degree hinge, pen support and an all-metal body.",
    price: 89990,
    category: "Electronics",
    image: img("laptops/lenovo-yoga-920"),
    stock: 12,
  },
  {
    name: "Apple AirPods Max Silver",
    description: "Over-ear wireless headphones with active noise cancellation, transparency mode and spatial audio.",
    price: 59900,
    category: "Electronics",
    image: img("mobile-accessories/apple-airpods-max-silver"),
    stock: 20,
  },
  {
    name: "Apple AirPods",
    description: "True wireless earbuds with quick pairing, automatic switching and up to 24 hours of listening with the case.",
    price: 12900,
    category: "Electronics",
    image: img("mobile-accessories/apple-airpods"),
    stock: 40,
  },
  {
    name: "Amazon Echo Plus",
    description: "Smart speaker with Alexa, a built-in smart home hub and room-filling 360-degree sound.",
    price: 8999,
    category: "Electronics",
    image: img("mobile-accessories/amazon-echo-plus"),
    stock: 25,
  },
  {
    name: "iPad Mini 2021 Starlight",
    description: "8.3-inch Liquid Retina display, A15 Bionic chip, USB-C and Apple Pencil (2nd generation) support.",
    price: 46900,
    category: "Electronics",
    image: img("tablets/ipad-mini-2021-starlight"),
    stock: 2,
  },
  {
    name: "Samsung Galaxy Tab S8 Plus Grey",
    description: "12.4-inch Super AMOLED display, S Pen included and a long-lasting 10090 mAh battery.",
    price: 74999,
    category: "Electronics",
    image: img("tablets/samsung-galaxy-tab-s8-plus-grey"),
    stock: 10,
  },
  {
    name: "Apple Airpower Wireless Charger",
    description: "Wireless charging mat designed to charge up to three devices at the same time.",
    price: 6999,
    category: "Electronics",
    image: img("mobile-accessories/apple-airpower-wireless-charger"),
    stock: 0,
  },

  // Fashion
  {
    name: "Man Plaid Shirt",
    description: "Classic regular-fit plaid shirt in soft brushed cotton, perfect for casual weekends.",
    price: 1499,
    category: "Fashion",
    image: img("mens-shirts/man-plaid-shirt"),
    stock: 35,
  },
  {
    name: "Nike Air Jordan 1 Red And Black",
    description: "Iconic high-top sneakers with premium leather upper and Air-Sole cushioning.",
    price: 16995,
    category: "Fashion",
    image: img("mens-shoes/nike-air-jordan-1-red-and-black"),
    stock: 6,
  },
  {
    name: "Puma Future Rider Trainers",
    description: "Retro-inspired running trainers with a lightweight EVA midsole and rubber outsole.",
    price: 6999,
    category: "Fashion",
    image: img("mens-shoes/puma-future-rider-trainers"),
    stock: 22,
  },
  {
    name: "Prada Women Bag",
    description: "Structured leather handbag with a detachable shoulder strap and signature hardware.",
    price: 54999,
    category: "Fashion",
    image: img("womens-bags/prada-women-bag"),
    stock: 4,
  },
  {
    name: "White Faux Leather Backpack",
    description: "Minimal everyday backpack in water-resistant faux leather with a padded laptop sleeve.",
    price: 2499,
    category: "Fashion",
    image: img("womens-bags/white-faux-leather-backpack"),
    stock: 30,
  },
  {
    name: "Black Sun Glasses",
    description: "Polarised UV400 sunglasses with a lightweight black frame.",
    price: 1299,
    category: "Fashion",
    image: img("sunglasses/black-sun-glasses"),
    stock: 50,
  },
  {
    name: "Brown Leather Belt Watch",
    description: "Analog quartz watch with a genuine brown leather strap and a minimal dial.",
    price: 3499,
    category: "Fashion",
    image: img("mens-watches/brown-leather-belt-watch"),
    stock: 18,
  },

  // Books
  {
    name: "Atomic Habits",
    description: "James Clear's practical guide to building good habits, breaking bad ones and getting 1% better every day.",
    price: 499,
    category: "Books",
    image: cover("9780735211292"),
    stock: 60,
  },
  {
    name: "Clean Code",
    description: "Robert C. Martin's handbook of agile software craftsmanship: writing code that is readable and maintainable.",
    price: 2899,
    category: "Books",
    image: cover("9780132350884"),
    stock: 14,
  },
  {
    name: "The Pragmatic Programmer",
    description: "The 20th anniversary edition of the classic guide to becoming a better, more pragmatic software developer.",
    price: 3199,
    category: "Books",
    image: cover("9780135957059"),
    stock: 9,
  },
  {
    name: "Sapiens",
    description: "Yuval Noah Harari's brief history of humankind, from the Stone Age to the twenty-first century.",
    price: 599,
    category: "Books",
    image: cover("9780062316097"),
    stock: 45,
  },
  {
    name: "Deep Work",
    description: "Cal Newport's rules for focused success in a distracted world.",
    price: 449,
    category: "Books",
    image: cover("9781455586691"),
    stock: 3,
  },
  {
    name: "The Psychology of Money",
    description: "Morgan Housel's timeless lessons on wealth, greed and happiness.",
    price: 399,
    category: "Books",
    image: cover("9780857197689"),
    stock: 70,
  },

  // Home
  {
    name: "Annibale Colombo Sofa",
    description: "Three-seater Italian sofa in premium upholstery with deep, comfortable cushions.",
    price: 189999,
    category: "Home",
    image: img("furniture/annibale-colombo-sofa"),
    stock: 3,
  },
  {
    name: "Bedside Table African Cherry",
    description: "Solid wood bedside table in an African cherry finish with a soft-close drawer.",
    price: 12499,
    category: "Home",
    image: img("furniture/bedside-table-african-cherry"),
    stock: 11,
  },
  {
    name: "House Showpiece Plant",
    description: "Lifelike artificial plant in a ceramic pot. Zero maintenance greenery for any shelf.",
    price: 899,
    category: "Home",
    image: img("home-decoration/house-showpiece-plant"),
    stock: 28,
  },
  {
    name: "Family Tree Photo Frame",
    description: "Wall-mounted family tree photo frame that holds six photos.",
    price: 1299,
    category: "Home",
    image: img("home-decoration/family-tree-photo-frame"),
    stock: 19,
  },
  {
    name: "Boxed Blender",
    description: "600 W countertop blender with a 1.5 L jar and three speed settings.",
    price: 3299,
    category: "Home",
    image: img("kitchen-accessories/boxed-blender"),
    stock: 9,
  },
];

const run = async () => {
  await connectDB();

  const reset = process.argv.includes("--reset");
  if (reset) {
    const { deletedCount } = await Product.deleteMany({});
    console.log(`Removed ${deletedCount} existing product(s)`);
  } else {
    const existing = await Product.countDocuments();
    if (existing > 0) {
      console.log(`Products collection already has ${existing} product(s). Use --reset to reseed.`);
      return;
    }
  }

  const inserted = await Product.insertMany(products);
  console.log(`Inserted ${inserted.length} products`);
};

run()
  .catch((error) => {
    console.error("Seeding failed:", error.message);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
