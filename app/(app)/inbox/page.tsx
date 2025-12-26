import { UI } from "@/lib/copy/uiStrings";
import { InboxView } from "@/components/inbox/inbox-view";

export default function InboxPage() {
  return (
    <div className="h-full flex flex-col">
      <InboxView />
    </div>
  );
}

