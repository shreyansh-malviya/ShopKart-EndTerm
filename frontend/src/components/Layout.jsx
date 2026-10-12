import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

// Shell for every logged-in page: navbar on top, page content below
const Layout = () => (
  <div className="flex min-h-screen flex-col">
    <Navbar />
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-12">
      <Outlet />
    </main>
    <footer className="border-t-2 border-ink">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-5 font-mono text-xs text-ink-soft sm:px-6">
        <span>ShopKart - Engineering Labs 01-06</span>
        <span>Payments in Razorpay Test Mode. No real money is charged.</span>
      </div>
    </footer>
  </div>
);

export default Layout;
