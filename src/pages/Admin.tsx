import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import KECALogo from "@/components/KECALogo";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, Users } from "lucide-react";

interface Lead {
  id: string;
  mobile: string;
  email: string;
  whatsapp_consent: boolean;
  created_at: string;
}

const Admin = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeads = async () => {
      const { data, error } = await supabase
        .from("leads")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) setLeads(data);
      setLoading(false);
    };
    fetchLeads();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <header className="container flex items-center justify-between py-6">
        <KECALogo size="sm" />
        <div className="flex items-center gap-2 text-muted-foreground">
          <Users className="h-5 w-5" />
          <span className="text-sm font-medium">{leads.length} leads</span>
        </div>
      </header>

      <main className="container pb-12">
        <h1 className="mb-6 text-2xl font-bold text-foreground">Submitted Leads</h1>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : leads.length === 0 ? (
          <p className="py-20 text-center text-muted-foreground">No leads yet.</p>
        ) : (
          <div className="rounded-xl border bg-card shadow-sm">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mobile</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>WhatsApp</TableHead>
                  <TableHead>Submitted</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leads.map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell className="font-medium">{lead.mobile}</TableCell>
                    <TableCell>{lead.email}</TableCell>
                    <TableCell>
                      <Badge variant={lead.whatsapp_consent ? "default" : "secondary"}>
                        {lead.whatsapp_consent ? "Yes" : "No"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(lead.created_at).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </main>
    </div>
  );
};

export default Admin;
