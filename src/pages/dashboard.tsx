import { trpc } from "../utils/trpc";

function dashboard() {
  const hello = trpc.hello.useQuery({ text: "sourabh" });
  if (!hello.data) {
    return <div>Loading...</div>;
  }
  return (
    <div>
      <p>{hello.data.greeting}</p>
    </div>
  );
}

export default dashboard;
