import { useState } from "react";
import { Graph, Room } from "./types";

export default function Navigate({
  rooms,
  graph,
}: {
  rooms: Record<string, Room>;
  graph: Graph;
}) {
  const [posn, setPosn] = useState({ x: 0, y: 0 });

  return (
    <div className="h-screen flex flex-col bg-gray-600">
      <div className="flex flex-row gap-2 justify-center p-4">
        <h1 className="text-white font-bold text-4xl pt-4 text-center">
          {rooms[`${posn.x},${posn.y}`].domain}
        </h1>
        <span className="flex-grow" />
        <button
          className="bg-black text-white flex flex-col justify-center w-64 h-32 rounded-xl"
          onClick={() => setPosn({ x: posn.x - 1, y: posn.y })}
        >
          <span className="text-7xl">←</span>
          <span className="text-sm">
            {rooms[`${posn.x - 1},${posn.y}`]?.domain}
          </span>
        </button>
        <button
          className="bg-black text-white flex flex-col justify-center w-64 h-32 rounded-xl"
          onClick={() => setPosn({ x: posn.x, y: posn.y - 1 })}
        >
          <span className="text-7xl">↑</span>
          <span className="text-sm">
            {rooms[`${posn.x},${posn.y - 1}`]?.domain}
          </span>
        </button>
        <button
          className="bg-black text-white flex flex-col justify-center w-64 h-32 rounded-xl"
          onClick={() => setPosn({ x: posn.x, y: posn.y + 1 })}
        >
          <span className="text-7xl">↓</span>
          <span className="text-sm">
            {rooms[`${posn.x},${posn.y + 1}`]?.domain}
          </span>
        </button>
        <button
          className="bg-black text-white flex flex-col justify-center w-64 h-32 rounded-xl"
          onClick={() => setPosn({ x: posn.x + 1, y: posn.y })}
        >
          <span className="text-7xl">→</span>
          <span className="text-sm">
            {rooms[`${posn.x + 1},${posn.y}`]?.domain}
          </span>
        </button>
      </div>
      <iframe
        src={"https://" + rooms[`${posn.x},${posn.y}`]?.domain}
        className="w-full flex-grow"
      />
    </div>
  );
}
