import { NextPage } from "next";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";

const UserHome: NextPage = () => {
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
  return <div>User Home Page</div>;
};

export default UserHome;
