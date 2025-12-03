module.exports=[35112,(a,b,c)=>{"use strict";b.exports=a.r(42602).vendored["react-ssr"].ReactDOM},70145,a=>{"use strict";var b=a.i(78560);function c(a){return{id:a.id,routineId:a.routine_id,routineName:a.routine_name??"",startedAt:a.started_at?new Date(a.started_at):new Date,finishedAt:a.finished_at?new Date(a.finished_at):new Date,exercises:(a.session_exercises??[]).map(a=>({id:a.id,exerciseId:a.exercise_id,exerciseName:a.exercise_name??"Exercício",category:a.category??"weight-reps",position:a.position??0,sets:(a.sets??[]).map(a=>({id:a.id,setIndex:a.set_index,reps:a.reps??null,weightKg:a.weight_kg??null,durationSec:a.duration_sec??null,distanceM:a.distance_m??null}))}))}}a.s(["sessionsApi",0,{async getAll(){let{data:a,error:d}=await b.supabase.from("sessions").select(`
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
      `).order("started_at",{ascending:!1});if(d)throw d;return a.map(c)},async getById(a){let{data:d,error:e}=await b.supabase.from("sessions").select(`
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
      `).eq("id",a).single();if(e)throw e;return c(d)},async create(a){let{data:c}=await b.supabase.auth.getUser(),d=c?.user?.id;if(!d)throw Error("Usuário não autenticado");let{data:e,error:f}=await b.supabase.from("sessions").insert({user_id:d,routine_id:a.routineId,started_at:a.startedAt,finished_at:a.finishedAt}).select("*").single();if(f)throw f;for(let c of a.exercises){let{data:a,error:d}=await b.supabase.from("session_exercises").insert({session_id:e.id,exercise_id:c.exerciseId}).select("*").single();if(d)throw d;if(c.sets.length>0){let d=c.sets.map((b,c)=>({session_exercise_id:a.id,set_index:c,reps:b.reps??null,weight_kg:b.weightKg??null,duration_sec:b.durationSec??null,distance_m:b.distanceM??null})),{error:e}=await b.supabase.from("sets").insert(d);if(e)throw e}}return this.getById(e.id)}}],70145)},97651,a=>{"use strict";let b=(0,a.i(70106).default)("Gauge",[["path",{d:"m12 14 4-4",key:"9kzdfg"}],["path",{d:"M3.34 19a10 10 0 1 1 17.32 0",key:"19p75a"}]]);a.s(["Gauge",()=>b],97651)},14753,a=>{"use strict";let b=(0,a.i(70106).default)("Timer",[["line",{x1:"10",x2:"14",y1:"2",y2:"2",key:"14vaq8"}],["line",{x1:"12",x2:"15",y1:"14",y2:"11",key:"17fdiu"}],["circle",{cx:"12",cy:"14",r:"8",key:"1e1u0o"}]]);a.s(["Timer",()=>b],14753)}];

//# sourceMappingURL=_4f23ff47._.js.map