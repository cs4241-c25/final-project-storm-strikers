import { signIn } from "@/auth";

export default async function SignIn() {
  return (
    <form
      action={async () => {
        "use server";
        await signIn("github");
      }}
    >
      <button type="submit" className="text-xl">
        Sign In
      </button>
    </form>
  );
}
