"use client"

import { useEffect, useState } from "react"
import { exercisesApi } from "@/lib/api/exercise"
import { Exercise } from "@/lib/types"
import { supabase } from "@/lib/supabase"

export default function ExercisesPage() {

  const [list, setList] = useState<Exercise[]>([])

  const [name, setName] = useState("")
  const [category, setCategory] = useState("weight-reps")

  // SUGESTÕES
  const [reps, setReps] = useState<number | null>(null)
  const [weight, setWeight] = useState<number | null>(null)
  const [time, setTime] = useState<number | null>(null)
  const [distance, setDistance] = useState<number | null>(null)

  async function load() {
    const { data: { user } } = await supabase.auth.getUser()
    const data = await exercisesApi.getAll()
    setList(data)
  }

  useEffect(() => {
    load()
  }, [])

  async function create() {
    const { data: { user } } = await supabase.auth.getUser()

    await exercisesApi.create({
      name,
      category,
      suggestedReps: reps,
      suggestedWeight: weight,
      suggestedTime: time,
      suggestedDistance: distance,
      userId: user!.id
    }),

    setName("")
    setReps(null)
    setWeight(null)
    setTime(null)
    setDistance(null)

    await load()
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Exercícios</h1>

      <div>
        <input
          placeholder="Nome do exercício"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="weight-reps">Peso + Reps</option>
          <option value="bodyweight-reps">Bodyweight</option>
          <option value="duration">Duração</option>
          <option value="distance-duration">Distância + Tempo</option>
        </select>

        {/* Campos dinâmicos */}
        {category === "weight-reps" && (
          <>
            <input type="number" placeholder="Reps sugeridas" onChange={(e) => setReps(Number(e.target.value))} />
            <input type="number" placeholder="Peso sugerido (kg)" onChange={(e) => setWeight(Number(e.target.value))} />
          </>
        )}

        {category === "bodyweight-reps" && (
          <input type="number" placeholder="Reps sugeridas" onChange={(e) => setReps(Number(e.target.value))} />
        )}

        {category === "duration" && (
          <input type="number" placeholder="Tempo sugerido (seg) " onChange={(e) => setTime(Number(e.target.value))} />
        )}

        {category === "distance-duration" && (
          <>
            <input type="number" placeholder="Distância sugerida (km)" onChange={(e) => setDistance(Number(e.target.value))} />
            <input type="number" placeholder="Tempo sugerido (min)" onChange={(e) => setTime(Number(e.target.value))} />
          </>
        )}

        <button onClick={create}>Adicionar</button>
      </div>

      <ul>
        {list.map((e) => (
          <li key={e.id}>
            {e.name} — {e.category}
            <button onClick={() => exercisesApi.delete(e.id).then(load)}>apagar</button>
          </li>
        ))}
      </ul>
    </div>
  )
}
