"use client"

import {
  closestCenter,
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from "@dnd-kit/core"

import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"

import { motion } from "framer-motion"
import { useState } from "react"
import { Grip, X, Plus } from "lucide-react"

import { RoutineExercise, Exercise } from "@/lib/types"
import { SortableItem } from "./SortableItem"
import { ExerciseSelector } from "../exercises/ExerciseSelector"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"

interface Props {
  availableExercises: Exercise[]
  initial: RoutineExercise[]
  onChange: (list: RoutineExercise[]) => void
}

export function RoutineExerciseEditor({
  availableExercises,
  initial,
  onChange,
}: Props) {
  const [items, setItems] = useState(initial)
  const [selectorOpen, setSelectorOpen] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  /* ---------------------------------- DND --------------------------------- */

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event

    if (!over || active.id === over.id) return

    const oldIndex = items.findIndex(i => i.id === active.id)
    const newIndex = items.findIndex(i => i.id === over.id)

    const newList = arrayMove(items, oldIndex, newIndex)
      .map((ex, idx) => ({ ...ex, position: idx }))

    setItems(newList)
    onChange(newList)
  }

  /* ---------------------------- ADD / REMOVE ---------------------------- */

  function toggleExercise(ex: Exercise) {
    const exists = items.some(i => i.exerciseId === ex.id)

    if (exists) {
      const filtered = items.filter(i => i.exerciseId !== ex.id)
      setItems(filtered)
      onChange(filtered)
      return
    }

    const newItem: RoutineExercise = {
      id: crypto.randomUUID(),
      exerciseId: ex.id,
      position: items.length,

      // usa sugestões camelCase vindas do mapper
      suggestedSets: ex.suggestedReps ?? null,
      suggestedReps: ex.suggestedReps ?? null,
      advancedTechnique: "",
    }

    const updated = [...items, newItem]
    setItems(updated)
    onChange(updated)
  }

  /* -------------------------------- UPDATE -------------------------------- */

  function updateField(id: string, field: keyof RoutineExercise, value: any) {
    const updated = items.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    )
    setItems(updated)
    onChange(updated)
  }

  /* -------------------------------- RENDER -------------------------------- */

  return (
    <div className="flex flex-col gap-6">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Exercícios da rotina</h2>

        <Button
          variant="outline"
          onClick={() => setSelectorOpen(!selectorOpen)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Adicionar exercício
        </Button>
      </div>

      {/* SELECTOR */}
      {selectorOpen && (
        <div className="p-4 rounded-xl border bg-card shadow-md">
          <ExerciseSelector
            exercises={availableExercises}
            selected={items.map(i => i.exerciseId)}
            onToggle={(exerciseId) => {
              const ex = availableExercises.find(e => e.id === exerciseId)
              if (ex) toggleExercise(ex)
            }}
          />
        </div>
      )}

      <Separator />

      {/* LISTA */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={items.map(i => i.id)}
          strategy={verticalListSortingStrategy}
        >

          <div className="flex flex-col gap-4">
            {items.map((item) => {
              const ex = availableExercises.find(e => e.id === item.exerciseId)
              if (!ex) return null

              return (
                <SortableItem key={item.id} id={item.id}>
                  <motion.div
                    layout
                    className="rounded-xl border p-4 shadow-sm bg-card dark:bg-card/80"
                  >

                    {/* HEADER */}
                    <div className="flex items-center gap-3">
                      <Grip className="w-4 h-4 text-muted-foreground" />

                      <div className="flex-1">
                        <p className="font-semibold">{ex.name}</p>
                        <p className="text-xs text-muted-foreground capitalize">
                          {ex.category.replace("_", " ")}
                        </p>
                      </div>

                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => toggleExercise(ex)}
                      >
                        <X className="w-5 h-5 text-red-500" />
                      </Button>
                    </div>

                    {/* CAMPOS VARIÁVEIS */}
                    <div className="grid grid-cols-3 gap-4 mt-4">

                      {/* ✳ PARA TODAS AS CATEGORIAS: técnica avançada */}
                      <div className="flex flex-col gap-1 col-span-3">
                        <label className="text-sm text-muted-foreground">
                          Técnica avançada (opcional)
                        </label>
                        <Input
                          placeholder="Ex: Drop-set, Rest-pause..."
                          value={item.advancedTechnique ?? ""}
                          onChange={(e) =>
                            updateField(item.id, "advancedTechnique", e.target.value)
                          }
                        />
                      </div>

                      {/* ================== PESO + REPS ================== */}
                      {ex.category === "peso_reps" && (
                        <>
                          <div className="flex flex-col gap-1">
                            <label className="text-sm text-muted-foreground">
                              Repetições
                            </label>
                            <Input
                              type="number"
                              value={item.suggestedReps ?? ""}
                              onChange={(e) =>
                                updateField(item.id, "suggestedReps", Number(e.target.value))
                              }
                            />
                          </div>

                          <div className="flex flex-col gap-1">
                            <label className="text-sm text-muted-foreground">
                              Carga (kg)
                            </label>
                            <Input
                              type="number"
                              value={ex.suggestedWeight ?? ""}
                              disabled
                              className="opacity-50"
                            />
                          </div>
                        </>
                      )}

                      {/* ================== CORPO LIVRE ================== */}
                      {ex.category === "corpo_livre" && (
                        <div className="flex flex-col gap-1 col-span-3">
                          <label className="text-sm text-muted-foreground">
                            Repetições
                          </label>
                          <Input
                            type="number"
                            value={item.suggestedReps ?? ""}
                            onChange={(e) =>
                              updateField(item.id, "suggestedReps", Number(e.target.value))
                            }
                          />
                        </div>
                      )}

                      {/* ================== DURAÇÃO ================== */}
                      {ex.category === "duracao" && (
                        <div className="flex flex-col gap-1 col-span-3">
                          <label className="text-sm text-muted-foreground">
                            Tempo (segundos)
                          </label>
                          <Input
                            type="number"
                            value={ex.suggestedTime ?? ""}
                            disabled
                            className="opacity-50"
                          />
                        </div>
                      )}

                      {/* ========== DISTÂNCIA + DURAÇÃO ========== */}
                      {ex.category === "distancia_duracao" && (
                        <>
                          <div className="flex flex-col gap-1">
                            <label className="text-sm text-muted-foreground">
                              Distância (m)
                            </label>
                            <Input
                              type="number"
                              value={ex.suggestedDistance ?? ""}
                              disabled
                              className="opacity-50"
                            />
                          </div>

                          <div className="flex flex-col gap-1">
                            <label className="text-sm text-muted-foreground">
                              Tempo (segundos)
                            </label>
                            <Input
                              type="number"
                              value={ex.suggestedTime ?? ""}
                              disabled
                              className="opacity-50"
                            />
                          </div>
                        </>
                      )}

                    </div>

                  </motion.div>
                </SortableItem>
              )
            })}
          </div>

        </SortableContext>
      </DndContext>

    </div>
  )
}
