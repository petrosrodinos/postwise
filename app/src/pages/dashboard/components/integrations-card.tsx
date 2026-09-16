import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Database, Linkedin, Twitter, type LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import ConfirmationDialog from "@/components/ui/confirmation-dialog";
import { cn } from "@/lib/utils";
import { useCreateIntegration, useDeleteIntegration, useIntegrations } from "@/features/integrations/hooks/use-integrations";
import { IntegrationProviders, type CreateIntegrationDto, type Integration, type IntegrationProvider } from "@/features/integrations/interfaces/integrations.interfaces";
import { getIntegrationProviderLabel } from "@/config/constants/dropdowns/integrations/integration-provider-form.options";

interface IntegrationMeta {
  label: string;
  description: string;
  icon: LucideIcon;
  accentClassName: string;
}

// Presentational metadata for each provider tile — mirrors the icon +
// label + description pattern from components/ui/platform-picker.tsx, so
// connecting an integration reads like the rest of the app's pickers.
const INTEGRATION_META: Record<IntegrationProvider, IntegrationMeta> = {
  [IntegrationProviders.SANITY]: {
    label: getIntegrationProviderLabel(IntegrationProviders.SANITY),
    description: "Publish blog posts straight to a Sanity dataset.",
    icon: Database,
    accentClassName: "border-[#F03E2F] bg-[#F03E2F]/[0.07] text-[#F03E2F]",
  },
  [IntegrationProviders.LINKEDIN]: {
    label: getIntegrationProviderLabel(IntegrationProviders.LINKEDIN),
    description: "Publish posts directly to a LinkedIn account.",
    icon: Linkedin,
    accentClassName: "border-[#0A66C2] bg-[#0A66C2]/[0.07] text-[#0A66C2]",
  },
  [IntegrationProviders.TWITTER]: {
    label: getIntegrationProviderLabel(IntegrationProviders.TWITTER),
    description: "Publish posts directly to an X account.",
    icon: Twitter,
    accentClassName: "border-foreground bg-foreground/[0.06] text-foreground",
  },
};

const ALL_PROVIDERS: IntegrationProvider[] = [IntegrationProviders.SANITY, IntegrationProviders.LINKEDIN, IntegrationProviders.TWITTER];

const sanityFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  external_project_id: z.string().min(1, "Project ID is required"),
  external_dataset: z.string().min(1, "Dataset is required"),
  document_type: z.string().optional(),
  api_token: z.string().min(1, "API token is required"),
});

const socialFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  external_account_id: z.string().min(1, "Account id is required"),
  external_account_name: z.string().optional(),
  access_token: z.string().min(1, "Access token is required"),
  refresh_token: z.string().optional(),
});

interface IntegrationsCardProps {
  title?: string;
  description?: string;
}

export function IntegrationsCard({
  title = "Connected integrations",
  description = "External destinations posts can be published to.",
}: IntegrationsCardProps) {
  const [disconnectId, setDisconnectId] = useState<string | null>(null);

  const { data: integrationsPage, isPending } = useIntegrations({ limit: 50 });
  const { mutate: deleteIntegration, isPending: isDeleting } = useDeleteIntegration();

  const integrations = integrationsPage?.data ?? [];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </CardHeader>
      <CardContent>
        {isPending ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-3 rounded-2xl border-2 border-border p-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-9 w-9 flex-none rounded-full" />
                  <div className="flex flex-1 flex-col gap-1.5">
                    <Skeleton className="h-3.5 w-24" />
                    <Skeleton className="h-3 w-36" />
                  </div>
                </div>
                <Skeleton className="h-8 w-full rounded-md" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {ALL_PROVIDERS.map((provider) => (
              <IntegrationTile
                key={provider}
                provider={provider}
                connections={integrations.filter((integration) => integration.provider === provider)}
                onDisconnect={setDisconnectId}
              />
            ))}
          </div>
        )}
      </CardContent>

      <ConfirmationDialog
        isOpen={!!disconnectId}
        onClose={() => setDisconnectId(null)}
        onConfirm={() => disconnectId && deleteIntegration(disconnectId, { onSuccess: () => setDisconnectId(null) })}
        title="Disconnect integration?"
        description="Posts will no longer publish to this destination."
        confirmText="Disconnect"
        variant="destructive"
        isLoading={isDeleting}
      />
    </Card>
  );
}

interface IntegrationTileProps {
  provider: IntegrationProvider;
  connections: Integration[];
  onDisconnect: (id: string) => void;
}

// One provider, presented the way the rest of the app presents a choice:
// icon + title + description in a tile. "Connect" opens a modal scoped to
// just that provider's fields.
function IntegrationTile({ provider, connections, onDisconnect }: IntegrationTileProps) {
  const [isConnectOpen, setIsConnectOpen] = useState(false);
  const meta = INTEGRATION_META[provider];
  const Icon = meta.icon;
  const isConnected = connections.length > 0;

  return (
    <div className={cn("flex flex-col gap-3 rounded-2xl border-2 p-4 transition-colors", isConnected ? meta.accentClassName : "border-border bg-card")}>
      <div className="flex items-start gap-3">
        <span
          className={cn(
            "inline-flex h-9 w-9 flex-none items-center justify-center rounded-full",
            isConnected ? "bg-background/70" : "bg-muted text-foreground",
          )}
        >
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-foreground">{meta.label}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{meta.description}</p>
        </div>
      </div>

      {connections.length > 0 && (
        <div className="flex flex-col gap-2 border-t border-border/60 pt-3">
          {connections.map((connection) => (
            <div key={connection.id} className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">{connection.name}</p>
                {connection.external_account_name && <p className="truncate text-xs text-muted-foreground">{connection.external_account_name}</p>}
              </div>
              <div className="flex flex-none items-center gap-2">
                <Badge variant={connection.status === "CONNECTED" ? "success" : "secondary"}>{connection.status}</Badge>
                <Button variant="ghost" size="sm" onClick={() => onDisconnect(connection.id)}>
                  Disconnect
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Button variant="outline" size="sm" className="self-start" onClick={() => setIsConnectOpen(true)}>
        {isConnected ? "Connect another" : "Connect"}
      </Button>

      <Dialog open={isConnectOpen} onOpenChange={setIsConnectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Connect {meta.label}</DialogTitle>
            <DialogDescription>
              {provider === IntegrationProviders.SANITY
                ? "Blog posts will be published directly to this Sanity dataset when marked as published."
                : "Paste an access token generated from the platform's developer settings — there's no sign-in flow yet."}
            </DialogDescription>
          </DialogHeader>
          <IntegrationConnectForm provider={provider} onDone={() => setIsConnectOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface IntegrationConnectFormProps {
  provider: IntegrationProvider;
  onDone: () => void;
}

function IntegrationConnectForm({ provider, onDone }: IntegrationConnectFormProps) {
  const isSanity = provider === IntegrationProviders.SANITY;
  const { mutate: createIntegration, isPending: isCreating } = useCreateIntegration();

  const sanityForm = useForm<z.infer<typeof sanityFormSchema>>({
    resolver: zodResolver(sanityFormSchema),
    defaultValues: { name: "", external_project_id: "", external_dataset: "production", document_type: "post", api_token: "" },
  });

  const socialForm = useForm<z.infer<typeof socialFormSchema>>({
    resolver: zodResolver(socialFormSchema),
    defaultValues: { name: "", external_account_id: "", external_account_name: "", access_token: "", refresh_token: "" },
  });

  function submit(dto: Omit<CreateIntegrationDto, "provider" | "organisation_id">) {
    createIntegration({ ...dto, provider }, { onSuccess: onDone });
  }

  if (isSanity) {
    return (
      <Form {...sanityForm}>
        <form
          onSubmit={sanityForm.handleSubmit((data) =>
            submit({ name: data.name, external_project_id: data.external_project_id, external_dataset: data.external_dataset, document_type: data.document_type || undefined, api_token: data.api_token }),
          )}
          className="grid gap-4"
        >
          <FormField
            control={sanityForm.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Company Blog" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={sanityForm.control}
            name="external_project_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Project ID</FormLabel>
                <FormControl>
                  <Input placeholder="abc123xy" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={sanityForm.control}
            name="external_dataset"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Dataset</FormLabel>
                <FormControl>
                  <Input placeholder="production" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={sanityForm.control}
            name="document_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Document type (optional)</FormLabel>
                <FormControl>
                  <Input placeholder="post" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={sanityForm.control}
            name="api_token"
            render={({ field }) => (
              <FormItem>
                <FormLabel>API token</FormLabel>
                <FormControl>
                  <PasswordInput placeholder="Sanity API token" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onDone} disabled={isCreating}>
              Cancel
            </Button>
            <Button type="submit" disabled={isCreating} loading={isCreating}>
              Connect
            </Button>
          </DialogFooter>
        </form>
      </Form>
    );
  }

  return (
    <Form {...socialForm}>
      <form
        onSubmit={socialForm.handleSubmit((data) =>
          submit({
            name: data.name,
            external_account_id: data.external_account_id,
            external_account_name: data.external_account_name || undefined,
            access_token: data.access_token,
            refresh_token: data.refresh_token || undefined,
          }),
        )}
        className="grid gap-4"
      >
        <FormField
          control={socialForm.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="@handle or account name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={socialForm.control}
          name="external_account_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Account id</FormLabel>
              <FormControl>
                <Input placeholder="The platform's account/user id" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={socialForm.control}
          name="external_account_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Display name (optional)</FormLabel>
              <FormControl>
                <Input placeholder="@handle or account name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={socialForm.control}
          name="access_token"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Access token</FormLabel>
              <FormControl>
                <PasswordInput placeholder="Access token" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={socialForm.control}
          name="refresh_token"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Refresh token (optional)</FormLabel>
              <FormControl>
                <PasswordInput placeholder="Refresh token" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onDone} disabled={isCreating}>
            Cancel
          </Button>
          <Button type="submit" disabled={isCreating} loading={isCreating}>
            Connect
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
