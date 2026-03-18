import Navbar from "@/components/Navbar";
import { Outlet } from "react-router";

function PublicLayout() {
  return (
    <div>

      <Navbar />

      <div>
        <Outlet />
      </div>

    </div>
  );
}

export default PublicLayout;