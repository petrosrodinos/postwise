import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ConfirmationDialog from "@/components/ui/confirmation-dialog";
import {
  useCreateSocialChannelConnection,
  useDeleteSocialChannelConnection,
  useSocialChannelConnections,
} from "@/features/social-channel-connections/hooks/use-social-channel-connections";
import { SocialChannels, type SocialChannel } from "@/features/social-channel-connections/interfaces/social-channel-connections.interfaces";
import { SocialChannelFormOptions, getSocialChannelLabel } from "@/config/constants/dropdowns/social-channels/social-channel-form.options";

const GLYPH: Record<SocialChannel, string> = {
  [SocialChannels.LINKEDIN]: "bg-[#0A66C2] text-white",
  [SocialChannels.TWITTER]: "bg-black text-white",
};

const connectChannelSchema = z.object({
  channel: z.enum([SocialChannels.LINKEDIN, SocialChannels.TWITTER]),
  external_account_id: z.string().min(1, "Account id is required"),
  external_account_name: z.string().optional(),
  access_token: z.string().min(1, "Access token is required"),
  refresh_token: z.string().optional(),
});

type ConnectChannelFormData = z.infer<typeof connectChannelSchema>;

interface ChannelConnectionsCardProps {
  title?: string;
  description?: string;
}

export function ChannelConnectionsCard({
  title = "Connected channels",
  description = "Social accounts posts can be scheduled and published to.",
}: ChannelConnectionsCardProps) {
  const [isConnectOpen, setIsConnectOpen] = useState(false);
  const [disconnectId, setDisconnectId] = useState<string | null>(null);

  const { data: connectionsPage, isPending } = useSocialChannelConnections({ limit: 50 });
  const { mutate: createConnection, isPending: isCreating } = useCreateSocialChannelConnection();
  const { mutate: deleteConnection, isPending: isDeleting } = useDeleteSocialChannelConnection();

  const connections = connectionsPage?.data ?? [];

  const form = useForm<ConnectChannelFormData>({
    resolver: zodResolver(connectChannelSchema),
    defaultValues: { channel: SocialChannels.LINKEDIN, external_account_id: "", external_account_name: "", access_token: "", refresh_token: "" },
  });

  function closeConnectDialog() {
    if (isCreating) return;
    form.reset();
    setIsConnectOpen(false);
  }

  function onSubmit(data: ConnectChannelFormData) {
    createConnection(
      {
        channel: data.channel,
        external_account_id: data.external_account_id,
        external_account_name: data.external_account_name || undefined,
        access_token: data.access_token,
        refresh_token: data.refresh_token || undefined,
      },
      {
        onSuccess: () => {
          form.reset();
          setIsConnectOpen(false);
        },
      },
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <div>
          <CardTitle className="text-base">{title}</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
        <Button variant="outline" onClick={() => setIsConnectOpen(true)}>
          Connect channel
        </Button>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {isPending ? (
          Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)
        ) : connections.length === 0 ? (
          <p className="text-sm text-muted-foreground">No channels connected yet.</p>
        ) : (
          connections.map((connection) => (
            <div key={connection.id} className="flex items-center justify-between gap-3 rounded-lg border border-border px-3.5 py-2.5">
              <div className="flex items-center gap-2.5">
                <span className={`inline-flex h-6 w-6 flex-none items-center justify-center rounded-md text-[10px] font-bold ${GLYPH[connection.channel]}`}>
                  {getSocialChannelLabel(connection.channel)[0]}
                </span>
                <div>
                  <p className="text-sm font-medium">{connection.external_account_name || connection.external_account_id}</p>
                  <p className="text-xs text-muted-foreground">{getSocialChannelLabel(connection.channel)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={connection.status === "CONNECTED" ? "success" : "secondary"}>{connection.status}</Badge>
                <Button variant="ghost" size="sm" onClick={() => setDisconnectId(connection.id)}>
                  Disconnect
                </Button>
              </div>
            </div>
          ))
        )}
      </CardContent>

      <Dialog open={isConnectOpen} onOpenChange={(open) => !open && closeConnectDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Connect a channel</DialogTitle>
            <DialogDescription>Paste an access token generated from the platform's developer settings — there's no sign-in flow yet.</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
              <FormField
                control={form.control}
                name="channel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Platform</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {SocialChannelFormOptions.map((option) => (
                          <SelectItem key={option.id} value={option.id}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
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
                control={form.control}
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
                control={form.control}
                name="access_token"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Access token</FormLabel>
                    <FormControl>
                      <Input placeholder="Access token" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="refresh_token"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Refresh token (optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Refresh token" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={closeConnectDialog} disabled={isCreating}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isCreating} loading={isCreating}>
                  Connect
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <ConfirmationDialog
        isOpen={!!disconnectId}
        onClose={() => setDisconnectId(null)}
        onConfirm={() => disconnectId && deleteConnection(disconnectId, { onSuccess: () => setDisconnectId(null) })}
        title="Disconnect channel?"
        description="Posts will no longer be able to publish to this account."
        confirmText="Disconnect"
        variant="destructive"
        isLoading={isDeleting}
      />
    </Card>
  );
}
