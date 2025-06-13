import dynamic from "next/dynamic";
import { isAuthorized } from "@/lib/adminAuth";
import { redirect } from "next/navigation";

const AdminApp = dynamic(() => import("./app"));

const AdminPage = async () => {
  const isAuthenticated = await isAuthorized();

  if (!isAuthenticated) {
    redirect("/");
  }
  return (
    <div>
      <AdminApp />
    </div>
  );
};

export default AdminPage;
