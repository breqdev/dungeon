import rooms from "../rooms.json";
import graph from "../graph.json";
import BirdsEye from "./BirdsEye";
import { Graph } from "./types";
import Navigate from "./Navigate";
import { useState } from "react";
import Walk from "./Walk";

export default function App() {
  const [view, setView] = useState<"birdsEye" | "navigate" | "walk">();

  if (view === "birdsEye") {
    return <BirdsEye rooms={rooms} graph={graph as Graph} />;
  } else if (view === "navigate") {
    return <Navigate rooms={rooms} graph={graph as Graph} />;
  } else if (view === "walk") {
    return <Walk rooms={rooms} graph={graph as Graph} />;
  } else {
    return (
      <div className="h-screen flex flex-col justify-center items-center bg-gray-600 text-2xl">
        <h1 className="text-white">choose your adventure</h1>
        <div className="flex flex-row gap-2 p-2">
          <button
            className="bg-black text-white p-4 rounded-xl"
            onClick={() => setView("birdsEye")}
          >
            birdseye
          </button>
          <button
            className="bg-black text-white p-4 rounded-xl"
            onClick={() => setView("navigate")}
          >
            navigate
          </button>
          <button
            className="bg-black text-white p-4 rounded-xl"
            onClick={() => setView("walk")}
          >
            walk
          </button>
        </div>
      </div>
    );
  }
}
