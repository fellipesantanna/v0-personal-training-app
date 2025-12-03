"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { createSupabaseBrowserClient } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, UserPlus2 } from "lucide-react"
import { motion } from "framer-motion"

export default function RegisterPage() {
  const router = useRouter()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleRegister() {
    if (!email || !password) {
      alert("Preencha e-mail e senha.")
      return
    }

    if (password !== confirmPassword) {
      alert("As senhas não coincidem.")
      return
    }

    setLoading(true)

    const supabase = createSupabaseBrowserClient()

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })


    setLoading(false)

    if (error) {
      console.error("Erro no cadastro Supabase:", error)
      alert(error.message || "Erro ao criar conta. Tente novamente.")
      return
    }

    console.log("Usuário criado:", data)

    alert("Conta criada com sucesso! Agora faça login.")
    router.push("/auth/login")
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen flex items-center justify-center p-6"
    >
      <div className="w-full max-w-sm rounded-xl border bg-card dark:bg-card/70 shadow p-6 flex flex-col gap-5">
        <h1 className="text-2xl font-bold text-center">Criar conta</h1>
        <p className="text-muted-foreground text-center text-sm">
          Comece a registrar seus treinos
        </p>

        <div className="flex flex-col gap-3">
          <Input
            placeholder="Seu email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <Input
            type="password"
            placeholder="Senha (mínimo 6 caracteres)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <Input
            type="password"
            placeholder="Confirmar senha"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          <Button
            onClick={handleRegister}
            disabled={loading}
            className="w-full flex items-center gap-2 bg-purple-600 hover:bg-purple-700 py-5"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <UserPlus2 className="w-5 h-5" />
            )}
            Criar conta
          </Button>
        </div>

        <Button
          variant="ghost"
          onClick={() => router.push("/auth/login")}
          className="text-sm"
        >
          Já tenho uma conta →
        </Button>
      </div>
    </motion.div>
  )
}
