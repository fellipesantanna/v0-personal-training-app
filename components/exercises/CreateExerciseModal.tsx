"use client"

import { useState } from "react"
import { Exercise } from "@/lib/types"
import { exercisesApi } from "@/lib/api/exercise"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X } from "lucide-react"
import { motion } from "framer-motion"

interface Props {
  onClose: () => void
  onCreated: (exercise: Exercise) => void
}

export function CreateExerciseModal({ onClose, onCreated }: Props) {
  const [loading, setLoading] = useState(false)

  const [name, setName] = useState("")
  const [photoUrl, setPhotoUrl] = useState("")
  const [category, setCategory] = useState<Exercise["category"]>("peso_reps")

  const [reps, setReps] = useState<number | "">("")
  const [weight, setWeight] = useState<number | "">("")
  const [time, setTime] = useState<number | "">("")
  const [distance, setDistance] = useState<number | "">("")

  async function save() {
    if (!name.trim()) {
      alert("Dê um nome ao exercício.")
      return
    }

    setLoading(true)

    const payload = {
      name,
      photo_url: photoUrl || null,
      category,
      suggested_reps: reps || null,
      suggested_weight: weight || null,
      suggested_time: time || null,
      suggested_distance: distance || null,
    }

    const created = await exercisesApi.create(payload)

    onCreated(created)
    setLoading(false)
    onClose()
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur flex justify-center items-center p-4 z-50"
    >
      <div className="bg-card w-full max-w-lg rounded-xl p-6 relative shadow-xl">

        {/* CLOSE BUTTON */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-muted-foreground hover:text-foreground"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-bold mb-4">Criar exercício</h2>

        <div className="flex flex-col gap-4">

          <Input
            placeholder="URL da foto (opcional)"
            value={photoUrl}
            onChange={(e) => setPhotoUrl(e.target.value)}
          />

          <Input
            placeholder="Nome do exercício"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          {/* CATEGORIES */}
          <div>
            <label className="text-sm text-muted-foreground">Categoria</label>

            <div className="grid grid-cols-1 gap-2 mt-2">
              {[
                { key: "peso_reps", label: "Peso + Repetições" },
                { key: "corpo_livre", label: "Corpo Livre" },
                { key: "duracao", label: "Duração" },
                { key: "distancia_duracao", label: "Distância + Duração" },
              ].map((cat) => (
                <button
                  key={cat.key}
                  onClick={() =>
                    setCategory(cat.key as Exercise["category"])
                  }
                  className={`border p-3 rounded-lg text-left ${
                    category === cat.key ? "border-purple-500 bg-purple-500/10" : ""
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* SUGGESTION INPUTS BASED ON CATEGORY */}

          {category === "peso_reps" && (
            <>
              <Input
                type="number"
                placeholder="Repetições sugeridas"
                value={reps}
                onChange={(e) => setReps(Number(e.target.value))}
              />
              <Input
                type="number"
                placeholder="Peso sugerido (kg)"
                value={weight}
                onChange={(e) => setWeight(Number(e.target.value))}
              />
            </>
          )}

          {category === "corpo_livre" && (
            <Input
              type="number"
              placeholder="Repetições sugeridas"
              value={reps}
              onChange={(e) => setReps(Number(e.target.value))}
            />
          )}

          {category === "duracao" && (
            <Input
              type="number"
              placeholder="Duração sugerida (segundos)"
              value={time}
              onChange={(e) => setTime(Number(e.target.value))}
            />
          )}

          {category === "distancia_duracao" && (
            <>
              <Input
                type="number"
                placeholder="Distância sugerida (m)"
                value={distance}
                onChange={(e) => setDistance(Number(e.target.value))}
              />
              <Input
                type="number"
                placeholder="Duração sugerida (segundos)"
                value={time}
                onChange={(e) => setTime(Number(e.target.value))}
              />
            </>
          )}

          <Button
            disabled={loading}
            className="w-full py-4 bg-purple-600 hover:bg-purple-700"
            onClick={save}
          >
            Salvar exercício
          </Button>
        </div>
      </div>
    </motion.div>
  )
}