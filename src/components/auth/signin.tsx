import { signIn } from "@/auth";

export default async function SignIn() {
  return (
    <form
      action={async () => {
        "use server";
        await signIn("github");
      }}
    >
      <button type="submit" className="text-sm md:text-lg">
        Sign In
      </button>
    </form>
  );
}
