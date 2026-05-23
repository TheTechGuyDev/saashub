import { UserCog } from "lucide-react";
import { PageHeader } from "@/components/common";
import { ChangePasswordForm } from "@/components/settings/ChangePasswordForm";

export default function Account() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="My Account"
        description="Manage your personal security and account settings."
        icon={UserCog}
      />
      <ChangePasswordForm />
    </div>
  );
}