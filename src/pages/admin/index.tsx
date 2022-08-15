import { NextPage } from "next";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";

const AdminHome: NextPage = () => {
  const router = useRouter();
  const { status, data } = useSession({
    required: true,
    onUnauthenticated() {
      // The user is not authenticated, handle it here.
      router.push("/login");
    },
  });

  if (status === "loading") {
    return <p>Loading...</p>;
  }

  return <div>{data.user?.name}(Admin) Home Page</div>;
};

export default AdminHome;
