(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,39144,e=>{"use strict";var s=e.i(17927);function i(e){return{id:e.id,routineId:e.routine_id,routineName:e.routine_name??"",startedAt:e.started_at?new Date(e.started_at):new Date,finishedAt:e.finished_at?new Date(e.finished_at):new Date,exercises:(e.session_exercises??[]).map(e=>({id:e.id,exerciseId:e.exercise_id,exerciseName:e.exercise_name??"Exercício",category:e.category??"weight-reps",position:e.position??0,sets:(e.sets??[]).map(e=>({id:e.id,setIndex:e.set_index,reps:e.reps??null,weightKg:e.weight_kg??null,durationSec:e.duration_sec??null,distanceM:e.distance_m??null}))}))}}e.s(["sessionsApi",0,{async getAll(){let{data:e,error:t}=await s.supabase.from("sessions").select(`
        id,
        routine_id,
        started_at,
        finished_at,
        session_exercises (
          id,
          exercise_id,
          sets (
            id,
            set_index,
            reps,
            weight_kg,
            duration_sec,
            distance_m
          )
        )
      `).order("started_at",{ascending:!1});if(t)throw t;return e.map(i)},async getById(e){let{data:t,error:r}=await s.supabase.from("sessions").select(`
        id,
        routine_id,
        started_at,
        finished_at,
        session_exercises (
          id,
          exercise_id,
          sets (
            id,
            set_index,
            reps,
            weight_kg,
            duration_sec,
            distance_m
          )
        )
      `).eq("id",e).single();if(r)throw r;return i(t)},async create(e){let{data:i}=await s.supabase.auth.getUser(),t=i?.user?.id;if(!t)throw Error("Usuário não autenticado");let{data:r,error:a}=await s.supabase.from("sessions").insert({user_id:t,routine_id:e.routineId,started_at:e.startedAt,finished_at:e.finishedAt}).select("*").single();if(a)throw a;for(let i of e.exercises){let{data:e,error:t}=await s.supabase.from("session_exercises").insert({session_id:r.id,exercise_id:i.exerciseId}).select("*").single();if(t)throw t;if(i.sets.length>0){let t=i.sets.map((s,i)=>({session_exercise_id:e.id,set_index:i,reps:s.reps??null,weight_kg:s.weightKg??null,duration_sec:s.durationSec??null,distance_m:s.distanceM??null})),{error:r}=await s.supabase.from("sets").insert(t);if(r)throw r}}return this.getById(r.id)}}],39144)},94827,e=>{"use strict";let s=(0,e.i(75254).default)("Gauge",[["path",{d:"m12 14 4-4",key:"9kzdfg"}],["path",{d:"M3.34 19a10 10 0 1 1 17.32 0",key:"19p75a"}]]);e.s(["Gauge",()=>s],94827)},17835,e=>{"use strict";let s=(0,e.i(75254).default)("Timer",[["line",{x1:"10",x2:"14",y1:"2",y2:"2",key:"14vaq8"}],["line",{x1:"12",x2:"15",y1:"14",y2:"11",key:"17fdiu"}],["circle",{cx:"12",cy:"14",r:"8",key:"1e1u0o"}]]);e.s(["Timer",()=>s],17835)}]);