import { UI } from "@/lib/copy/uiStrings";
import { ContactsView } from "@/components/contacts/contacts-view";

export default function ContactsPage() {
  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{UI.contacts.title}</h1>
          <p className="text-muted-foreground mt-1">Gestiona tus clientes y prospectos</p>
        </div>
      </div>
      <ContactsView />
    </div>
  );
}

