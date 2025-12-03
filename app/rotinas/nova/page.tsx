import { createSupabaseServerClient } from "@/lib/supabase/server"
import Link from "next/link"

export default async function RotinasPage() {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from("routines")
    .select("id, name, exercises(count)")
    .order("created_at", { ascending: false })

  if (error) {
    console.error(error)
    return <div>Erro ao carregar rotinas.</div>
  }

  return (
    <div className="p-6 flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Rotinas</h1>
        <Link
          href="/rotinas/nova"
          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
        >
          + Nova rotina
        </Link>
      </div>

      <div className="flex flex-col gap-4">
        {data.map(r => (
          <Link
            key={r.id}
            href={`/rotinas/${r.id}`}
            className="p-4 bg-card border rounded-xl hover:bg-accent transition"
          >
            <h2 className="font-medium text-lg">{r.name}</h2>
            <p className="text-sm text-muted-foreground">
              {r.exercises[0]?.count || 0} exercícios
            </p>
          </Link>
        ))}
      </div>
    </div>
  )
}
