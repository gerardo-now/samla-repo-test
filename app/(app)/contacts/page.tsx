import { UI } from "@/lib/copy/uiStrings";
import { ContactsView } from "@/components/contacts/contacts-view";

export default function ContactsPage() {
  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{UI.contacts.title}</h1>
          <p className="text-sm md:text-base text-muted-foreground mt-1">Gestiona tus clientes y prospectos</p>
        </div>
      </div>
      <ContactsView />
    </div>
  );
}

