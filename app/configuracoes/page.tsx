"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, LogOut, Download, User, Activity, Ruler } from "lucide-react"
import { exportSessionsToCSV } from "@/lib/export/csv"
import { sessionsApi } from "@/lib/api/session"
import { motion } from "framer-motion"
import { Separator } from "@/components/ui/separator"

export default function ConfiguracoesPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Campos editáveis
  const [name, setName] = useState("")
  const [goals, setGoals] = useState("")        // Objetivo
  const [weight, setWeight] = useState("")      // Peso
  const [height, setHeight] = useState("")      // Altura

  // =============================
  // CARREGAR USUÁRIO
  // =============================
  useEffect(() => {
    async function loadUser() {
      const { data } = await supabase.auth.getUser()
      const u = data.user
      setUser(u)

      setName(u?.user_metadata?.name ?? "")
      setGoals(u?.user_metadata?.goals ?? "")
      setWeight(u?.user_metadata?.weight ?? "")
      setHeight(u?.user_metadata?.height ?? "")

      setLoading(false)
    }
    loadUser()
  }, [])


  // =============================
  // SALVAR DADOS
  // =============================
  async function handleSave() {
    if (!user) return
    setSaving(true)

    await supabase.auth.updateUser({
      data: {
        name,
        goals,
        weight,
        height,
      }
    })

    setSaving(false)
    alert("Dados atualizados!")
  }


  // =============================
  // LOGOUT
  // =============================
  async function handleLogout() {
    await supabase.auth.signOut()
    window.location.href = "/"
  }


  // =============================
  // EXPORTAR CSV
  // =============================
  async function handleExportCSV() {
    const raw = await sessionsApi.getAll()
    const detailed = []
    for (const s of raw) detailed.push(await sessionsApi.getAll())

    exportSessionsToCSV(detailed)
  }


  // =============================
  // UI
  // =============================
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin w-8 h-8 text-purple-500" />
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="max-w-xl mx-auto p-6 flex flex-col gap-8"
    >
      <h1 className="text-3xl font-bold mb-2">Configurações</h1>

      {/* ======================= */}
      {/* DADOS DO USUÁRIO       */}
      {/* ======================= */}

      <div className="rounded-xl border bg-card p-4 shadow-sm flex flex-col gap-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <User className="w-5 h-5 text-purple-500" />
          Perfil
        </h2>

        {/* Nome */}
        <label className="text-sm text-muted-foreground">Nome</label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Seu nome"
        />

        {/* Objetivo */}
        <label className="text-sm text-muted-foreground">Objetivo</label>
        <Input
          value={goals}
          onChange={(e) => setGoals(e.target.value)}
          placeholder="Ex: Hipertrofia, Emagrecimento, Resistência..."
        />

        <div className="grid grid-cols-2 gap-4 mt-2">

          {/* Peso */}
          <div>
            <label className="text-sm text-muted-foreground flex items-center gap-1">
              <Activity className="w-4 h-4 text-purple-500" />
              Peso (kg)
            </label>
            <Input
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="Ex: 75"
            />
          </div>

          {/* Altura */}
          <div>
            <label className="text-sm text-muted-foreground flex items-center gap-1">
              <Ruler className="w-4 h-4 text-purple-500" />
              Altura (cm)
            </label>
            <Input
              type="number"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              placeholder="Ex: 178"
            />
          </div>

        </div>

        <Button
          className="mt-4 bg-purple-600 hover:bg-purple-700"
          disabled={saving}
          onClick={handleSave}
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Salvar alterações"}
        </Button>
      </div>

      <Separator />

      {/* ======================= */}
      {/* EXPORTAR CSV           */}
      {/* ======================= */}
      <div className="rounded-xl border bg-card p-4 shadow-sm flex flex-col gap-3">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Download className="w-5 h-5 text-purple-500" />
          Exportar dados
        </h2>

        <p className="text-sm text-muted-foreground">
          Baixe todos os seus treinos completos em formato CSV.
        </p>

        <Button variant="outline" onClick={handleExportCSV}>
          Exportar CSV
        </Button>
      </div>

      <Separator />

      {/* ======================= */}
      {/* LOGOUT                 */}
      {/* ======================= */}
      <div className="rounded-xl border bg-card p-4 shadow-sm flex flex-col gap-3">
        <h2 className="text-lg font-semibold flex items-center gap-2 text-red-500">
          <LogOut className="w-5 h-5" />
          Logout
        </h2>

        <Button variant="destructive" onClick={handleLogout}>
          Sair da conta
        </Button>
      </div>
    </motion.div>
  )
}