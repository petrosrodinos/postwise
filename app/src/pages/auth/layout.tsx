import Navbar from "@/components/layout/navbar";
import { BrandMark } from "@/components/layout/brand-mark";
import { environments } from "@/config/environments";
import { Outlet } from "react-router-dom";

export default function AuthLayout() {
  return (
    <div className="h-full flex flex-col">
      <Navbar />
      <main className="flex-1 flex justify-center p-4 pt-8 sm:pt-12 overflow-y-auto">
        <div className="w-full max-w-md space-y-6">
          <div className="flex items-center justify-center gap-2.5">
            <BrandMark size={28} />
            <h2 className="text-xl font-medium">{environments.APP_NAME}</h2>
          </div>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
