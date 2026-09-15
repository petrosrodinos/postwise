import { useState } from "react";
import { format } from "date-fns";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import ConfirmationDialog from "@/components/ui/confirmation-dialog";
import { generateInitials } from "@/features/auth/utils/auth.utils";
import { useAuthStore } from "@/stores/auth";
import {
  useOrganisationMembers,
  useRemoveOrganisationMember,
  useUpdateOrganisationMemberRole,
} from "@/features/organisations/hooks/use-organisations";
import { OrganisationRoles, type OrganisationMember, type OrganisationRole } from "@/features/organisations/interfaces/organisations.interfaces";
import { OrganisationRoleFormOptions } from "@/config/constants/dropdowns/organisations/organisation-role-form.options";
import { AddMemberDialog } from "./add-member-dialog";

interface MembersTabProps {
  organisationId: string;
}

export function MembersTab({ organisationId }: MembersTabProps) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<OrganisationMember | null>(null);

  const myEmail = useAuthStore((state) => state.email);
  const { data: members, isPending } = useOrganisationMembers(organisationId);
  const { mutate: updateRole } = useUpdateOrganisationMemberRole();
  const { mutate: removeMember, isPending: isRemoving } = useRemoveOrganisationMember();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="max-w-lg text-sm text-muted-foreground">
          Everyone with access to this organisation. Add a member directly with an email, name and password — no invite step.
        </p>
        <Button onClick={() => setIsAddOpen(true)}>Add member</Button>
      </div>

      {isPending ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Member</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 3 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <div className="flex items-center gap-2.5">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="flex flex-col gap-1.5">
                      <Skeleton className="h-3.5 w-28" />
                      <Skeleton className="h-3 w-36" />
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Skeleton className="h-9 w-32 rounded-md" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-3.5 w-20" />
                </TableCell>
                <TableCell className="text-right">
                  <Skeleton className="ml-auto h-3.5 w-14" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Member</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(members ?? []).map((member) => {
              const isOwner = member.role === OrganisationRoles.OWNER;
              const isMe = member.user.email === myEmail;
              return (
                <TableRow key={member.id}>
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">{generateInitials(member.user.name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">
                          {member.user.name}
                          {isMe && <span className="ml-1.5 text-xs text-muted-foreground">(you)</span>}
                        </p>
                        <p className="text-xs text-muted-foreground">{member.user.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={member.role}
                      disabled={isOwner}
                      onValueChange={(role) => updateRole({ organisationId, memberId: member.id, dto: { role: role as OrganisationRole } })}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {OrganisationRoleFormOptions.map((option) => (
                          <SelectItem key={option.id} value={option.id} disabled={option.id === OrganisationRoles.OWNER}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{format(new Date(member.created_at), "MMM d, yyyy")}</TableCell>
                  <TableCell className="text-right">
                    {!isOwner && (
                      <Button variant="ghost" size="sm" onClick={() => setRemoveTarget(member)}>
                        Remove
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}

      <AddMemberDialog organisationId={organisationId} isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} />

      <ConfirmationDialog
        isOpen={!!removeTarget}
        onClose={() => setRemoveTarget(null)}
        onConfirm={() =>
          removeTarget &&
          removeMember({ organisationId, memberId: removeTarget.id }, { onSuccess: () => setRemoveTarget(null) })
        }
        title={`Remove ${removeTarget?.user.name ?? "this member"}?`}
        description="They will immediately lose access to this organisation."
        confirmText="Remove"
        variant="destructive"
        isLoading={isRemoving}
      />
    </div>
  );
}
