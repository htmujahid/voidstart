import { Link } from "@tanstack/react-router";

import { buttonVariants } from "@/components/ui/button";

import { AuthCard } from "./auth-card";

export function AuthNotice({
  title,
  description,
  redirectTo,
}: {
  title: string;
  description: string;
  redirectTo?: string;
}) {
  return (
    <AuthCard title={title} description={description}>
      <Link
        to="/auth/sign-in"
        search={{ redirect: redirectTo }}
        className={buttonVariants({ variant: "outline", className: "w-full" })}
      >
        Back to sign in
      </Link>
    </AuthCard>
  );
}
