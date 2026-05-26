import { Outlet } from "react-router-dom";
import Footer from "./Footer";
import Navbar from "./Navbar";

function AppLayout() {
  return (
    <div className="min-h-screen bg-ipl-dark text-white flex flex-col">
      <Navbar />
      <main className="flex-1 p-6 md:p-8">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default AppLayout;
