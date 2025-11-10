import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import CameraCapture from "@/components/CameraCapture";
import RecommendPanel from "@/components/RecommendPanel";
import ProgressPanel from "@/components/ProgressPanel";
import BadgesPanel from "@/components/BadgesPanel";

export default function LessonShell(){
  const { module } = useParams();
  const navigate = useNavigate();
  const [emotion, setEmotion] = useState<string>("neutral");
  const [activities, setActivities] = useState<any[]>([]);
  const [showPanel, setShowPanel] = useState<boolean>(false);
  const modKey = (module ?? "").toString();

  useEffect(()=>{
    let mounted = true;
    (async ()=>{
      if (!modKey) { setActivities([]); return; }
      try {
        const res = await fetch(`/api/activities/${encodeURIComponent(modKey)}`);
        if (!res.ok) throw new Error("bad activities");
        const data = await res.json();
        if (mounted && data.activities) setActivities(data.activities);
      } catch {
        if (mounted) setActivities([]);
      }
    })();
    return ()=>{ mounted = false; };
  },[modKey]);

  const openActivity = (id:string)=> navigate(`/activity/${encodeURIComponent(id)}`);

  return (
    <div className="min-h-screen p-8 bg-sky-50">
      <div className="container flex gap-8">
        <div style={{flex:1}}>
          <h1 className="text-3xl font-bold text-sky-700 mb-4">
            <span role="img" aria-label="book">📚</span> {module}
          </h1>
          <p className="mb-4">Detected emotion: <b>{emotion}</b></p>

          <div className="mb-6">
            <CameraCapture onDetect={(e)=>{ setEmotion(e); setShowPanel(true); }} />
          </div>

          <h2 className="text-xl font-semibold mb-2">Activities</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activities.length===0 ? <div className="text-gray-600">No activities found.</div> :
              activities.map(a=>(
                <div key={a.id} className="bg-white p-4 rounded shadow flex justify-between items-center">
                  <div>
                    <div className="font-bold">{a.title}</div>
                    <div className="text-sm text-gray-600">{a.duration ?? ""}</div>
                  </div>
                  <div>
                    <button onClick={()=>openActivity(a.id)} className="px-3 py-1 rounded bg-sky-500 text-white">Open</button>
                  </div>
                </div>
              ))
            }
          </div>
        </div>

        <div style={{width:340}}>
          <button onClick={()=>setShowPanel(s=>!s)} className="mb-4 px-3 py-1 rounded bg-sky-500 text-white">Toggle Recommendations</button>
          <RecommendPanel emotion={emotion} open={showPanel} />
          <div className="mt-4">
            <BadgesPanel user="local-user" />
          </div>
          <div className="mt-4">
            <ProgressPanel user="local-user" />
          </div>
        </div>
      </div>
    </div>
  );
}
