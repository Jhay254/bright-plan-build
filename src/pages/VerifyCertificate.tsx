import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, CheckCircle, XCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const VerifyCertificate = () => {
  const { certCode } = useParams<{ certCode: string }>();

  const { data, isLoading, error } = useQuery({
    queryKey: ["verify-cert", certCode],
    queryFn: async () => {
      const { data: cert, error: certErr } = await supabase
        .from("cpd_certificates")
        .select("*")
        .eq("cert_code", certCode)
        .single();
      if (certErr || !cert) throw new Error("Certificate not found");

      // Fetch volunteer alias
      const { data: profile } = await supabase
        .from("profiles")
        .select("alias")
        .eq("user_id", cert.user_id)
        .single();

      return { cert, alias: profile?.alias ?? "Volunteer" };
    },
    enabled: !!certCode,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-md mx-auto space-y-6">
          <Skeleton className="h-12 w-12 rounded-full mx-auto" />
          <Skeleton className="h-8 w-64 mx-auto" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <>
        <Helmet>
          <title>Certificate Not Found — Echo</title>
        </Helmet>
        <div className="min-h-screen bg-background flex items-center justify-center p-6">
          <div className="text-center max-w-sm">
            <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h1 className="font-heading text-xl font-bold text-foreground mb-2">Certificate Not Found</h1>
            <p className="text-sm text-muted-foreground mb-4">
              The certificate code <code className="bg-muted px-1.5 py-0.5 rounded text-xs">{certCode}</code> does not exist in our records.
            </p>
            <Link to="/" className="text-primary underline text-sm">Back to home</Link>
          </div>
        </div>
      </>
    );
  }

  const { cert, alias } = data;

  return (
    <>
      <Helmet>
        <title>Certificate Verified — Echo</title>
        <meta name="description" content={`Verified CPD certificate for ${alias} with ${cert.total_hours} hours.`} />
      </Helmet>
      <div className="min-h-screen bg-background">
        <div className="max-w-md mx-auto px-6 py-12">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8">
            <ArrowLeft className="h-4 w-4" /> Back to home
          </Link>

          <div className="bg-card rounded-echo-lg border border-border p-8 text-center">
            <CheckCircle className="h-16 w-16 text-forest mx-auto mb-4" />
            <h1 className="font-heading text-2xl font-bold text-foreground mb-1">Certificate Verified</h1>
            <p className="text-sm text-muted-foreground mb-6">This certificate is authentic and issued by Project Echo.</p>

            <div className="bg-mist/50 rounded-echo-md p-4 text-left space-y-3">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Volunteer</p>
                <p className="font-medium text-foreground">{alias}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">CPD Hours</p>
                <p className="font-heading text-2xl font-bold text-forest">{Number(cert.total_hours).toFixed(1)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Issued</p>
                <p className="text-sm text-foreground">{new Date(cert.issued_at).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Certificate ID</p>
                <code className="text-xs bg-background px-2 py-1 rounded border border-border">{cert.cert_code}</code>
              </div>
            </div>
          </div>

          <p className="text-center text-xs text-muted-foreground mt-6">
            Certificates are generated for volunteers who have logged at least 10 hours of continuing professional development.
          </p>
        </div>
      </div>
    </>
  );
};

export default VerifyCertificate;
