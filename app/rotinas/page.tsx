import { createSupabaseServerClient } from "@/lib/supabase/server"
import Link from "next/link"

export default async function RotinasPage() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return <div>Carregando...</div>
  }

  // Carregar rotinas do usuário
  const { data: routines } = await supabase
    .from("routines")
    .select("*")
    .eq("userId", user.id)
    .order("created_at", { ascending: false })

  return (
    <div className="p-6 flex flex-col gap-6">

      <h1 className="text-2xl font-bold">Minhas Rotinas</h1>

      <Link
        href="/rotinas/nova"
        className="w-full text-center bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg shadow"
      >
        + Criar nova rotina
      </Link>

      <div className="flex flex-col gap-4">
        {(!routines || routines.length === 0) && (
          <p className="text-muted-foreground text-sm">
            Você ainda não criou nenhuma rotina.
          </p>
        )}

        {routines?.map((r) => (
          <Link
            key={r.id}
            href={`/rotinas/${r.id}`}
            className="p-4 rounded-xl shadow bg-card border hover:bg-accent transition"
          >
            <h2 className="text-lg font-medium">{r.name}</h2>
            <p className="text-muted-foreground text-xs mt-1">
              Clique para editar
            </p>
          </Link>
        ))}
      </div>

    </div>
  )
}
