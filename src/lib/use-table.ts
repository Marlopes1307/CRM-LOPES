import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Tables = Database["public"]["Tables"];
export type TableName = "clients" | "properties" | "appointments" | "deals";
export type Row<T extends TableName> = Tables[T]["Row"];
export type Insert<T extends TableName> = Tables[T]["Insert"];

const ORDER: Record<TableName, { col: string; asc: boolean }> = {
  clients: { col: "created_at", asc: false },
  properties: { col: "created_at", asc: false },
  appointments: { col: "starts_at", asc: true },
  deals: { col: "closed_at", asc: false },
};

export function useTable<T extends TableName>(table: T) {
  const qc = useQueryClient();
  const query = useQuery({
    queryKey: [table],
    queryFn: async () => {
      const o = ORDER[table];
      const { data, error } = await supabase.from(table as "clients").select("*").order(o.col, { ascending: o.asc });
      if (error) throw error;
      return (data ?? []) as unknown as Row<T>[];
    },
  });
  const done = () => qc.invalidateQueries({ queryKey: [table] });
  const onError = (e: Error) => toast.error(e.message);

  const save = useMutation({
    mutationFn: async (values: Insert<T> & { id?: string }) => {
      const { id, ...rest } = values as { id?: string } & Record<string, unknown>;
      const res = id
        ? await supabase.from(table as "clients").update(rest as never).eq("id", id)
        : await supabase.from(table as "clients").insert(rest as never);
      if (res.error) throw res.error;
    },
    onSuccess: () => {
      done();
      toast.success("Salvo");
    },
    onError,
  });
  const patch = useMutation({
    mutationFn: async ({ id, ...rest }: { id: string } & Partial<Row<T>>) => {
      const { error } = await supabase.from(table as "clients").update(rest as never).eq("id", id);
      if (error) throw error;
    },
    onSuccess: done,
    onError,
  });
  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from(table as "clients").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      done();
      toast.success("Excluído");
    },
    onError,
  });
  return { rows: query.data ?? [], loading: query.isLoading, save, patch, remove };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function emptyToNull(obj: Record<string, unknown>): Record<string, any> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) out[k] = v === "" ? null : v;
  return out;
}
export type UserProfile = {
  id: string;
  email: string | null;
  full_name: string | null;
  role: "corretor" | "gerente";
  created_at?: string;
};

export function useManagerAccess() {
  const qc = useQueryClient();

  const { data: profiles = [], isLoading } = useQuery({
    queryKey: ["profiles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles" as never)
        .select("*")
        .order("created_at", { ascending: true });
      if (error) return [] as UserProfile[];
      return (data ?? []) as unknown as UserProfile[];
    },
  });

  const { data: currentUserId } = useQuery({
    queryKey: ["current-user-id"],
    queryFn: async () => {
      const { data } = await supabase.auth.getUser();
      return data.user?.id ?? null;
    },
  });

  const updateProfile = useMutation({
    mutationFn: async ({
      id,
      role,
      full_name,
    }: {
      id: string;
      role?: "corretor" | "gerente";
      full_name?: string;
    }) => {
      const updates: Record<string, unknown> = {};
      if (role !== undefined) updates.role = role;
      if (full_name !== undefined) updates.full_name = full_name;

      const { error } = await supabase
        .from("profiles" as never)
        .update(updates as never)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["profiles"] });
      toast.success("Perfil atualizado!");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const me = profiles.find((p) => p.id === currentUserId);
  const isManager = me?.role === "gerente";

  const getBrokerName = (userId?: string | null) => {
    if (!userId) return null;
    const p = profiles.find((x) => x.id === userId);
    return p?.full_name || p?.email?.split("@") || null;
  };

  return { isManager, profiles, me, isLoading, updateProfile, getBrokerName };
}
