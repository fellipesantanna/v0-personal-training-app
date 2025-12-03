import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="p-6 flex flex-col gap-8">

      {/* Saudação */}
      <div>
        <h2 className="text-2xl font-semibold">
          Olá, <span className="text-purple-600">{user?.email}</span>
        </h2>
        <p className="text-muted-foreground mt-1">
          Aqui está o resumo da sua semana 👇
        </p>
      </div>

      {/* Grid de Cards */}
      <div className="grid grid-cols-2 gap-4">

        <div className="p-4 bg-card rounded-xl border shadow-sm">
          <h3 className="text-sm text-muted-foreground">Treinos na semana</h3>
          <p className="text-3xl font-bold mt-1">3</p>
        </div>

        <div className="p-4 bg-card rounded-xl border shadow-sm">
          <h3 className="text-sm text-muted-foreground">Exercícios feitos</h3>
          <p className="text-3xl font-bold mt-1">18</p>
        </div>

        <div className="p-4 bg-card rounded-xl border shadow-sm col-span-1">
          <h3 className="text-sm text-muted-foreground">Minutos ativos</h3>
          <p className="text-3xl font-bold mt-1">142</p>
        </div>

        <div className="p-4 bg-card rounded-xl border shadow-sm col-span-1">
          <h3 className="text-sm text-muted-foreground">Último treino</h3>
          <p className="text-md font-medium mt-1">Ontem</p>
        </div>

      </div>

      {/* Botão CTA para ir treinar */}
      <a
        href="/rotinas"
        className="w-full text-center bg-purple-600 hover:bg-purple-700 transition text-white 
                   py-4 rounded-xl font-medium shadow"
      >
        Ir para Treinos →
      </a>

    </div>
  );
}
