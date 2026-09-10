import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

export default function PublicLayout() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Outlet />
    </div>
  );
}
