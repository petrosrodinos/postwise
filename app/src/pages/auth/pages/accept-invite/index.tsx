import { Card } from "@/components/ui/card";
import { Link, useSearchParams } from "react-router-dom";
import { useInvitationDetails } from "@/features/auth/hooks/use-auth";
import { AcceptInviteForm } from "./components/accept-invite-form";

export default function AcceptInvite() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const { data: details, isPending, isError } = useInvitationDetails(token);

  return (
    <Card className="p-6 max-w-md mx-auto">
      <div className="mb-2 flex flex-col space-y-2 text-left">
        <h1 className="text-lg font-semibold tracking-tight">Accept your invitation</h1>
        {details && (
          <p className="text-sm text-muted-foreground">
            You've been invited to join <span className="font-medium text-foreground">{details.organisation_name}</span>. Set a password
            to get started.
          </p>
        )}
      </div>

      {!token || isError ? (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">This invitation link is invalid or has expired.</p>
          <Link to="/auth/sign-in" className="text-sm underline underline-offset-4">
            Back to sign in
          </Link>
        </div>
      ) : isPending ? (
        <p className="text-sm text-muted-foreground">Loading invitation…</p>
      ) : (
        details && <AcceptInviteForm token={token} details={details} />
      )}
    </Card>
  );
}
