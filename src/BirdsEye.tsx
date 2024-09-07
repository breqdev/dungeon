import { useLayoutEffect, useMemo } from "react";
import { Graph, Room } from "./types";

function RoomView({ room, graph }: { room: Room; graph: Graph }) {
  return (
    <div className="w-32 border-black border-2 flex-shrink-0">
      <img
        className="w-full"
        style={{ imageRendering: "pixelated" }}
        src={`https://highway.eightyeightthirty.one/badge/${
          graph.images[room.domain][0]
        }`}
      />
      <p className="break-words font-mono">{room.domain}</p>
    </div>
  );
}

export default function BirdsEye({
  rooms,
  graph,
}: {
  rooms: Record<string, Room>;
  graph: Graph;
}) {
  const min_x = useMemo(
    () => Math.min(...Object.values(rooms).map((r: Room) => r.x)),
    [rooms]
  );
  const max_x = useMemo(
    () => Math.max(...Object.values(rooms).map((r: Room) => r.x)),
    [rooms]
  );
  const min_y = useMemo(
    () => Math.min(...Object.values(rooms).map((r: Room) => r.y)),
    [rooms]
  );
  const max_y = useMemo(
    () => Math.max(...Object.values(rooms).map((r: Room) => r.y)),
    [rooms]
  );

  useLayoutEffect(() => {
    // compute the position of room 0,0
    const x = -min_x * 128; // w-32
    const y = -min_y * 128;

    // compensate for the size of the viewport
    const w = window.innerWidth;
    const h = window.innerHeight;

    // scroll to that position
    window.scrollTo(x - w / 2 + 64, y - h / 2 + 64);
  }, [min_x, min_y]);

  return (
    <div className="flex flex-col">
      {Array.from({ length: max_y - min_y + 1 }, (_, y) => (
        <div key={y} className="flex flex-row h-32">
          {Array.from({ length: max_x - min_x + 1 }, (_, x) => {
            const room =
              rooms[`${x + min_x},${y + min_y}` as keyof typeof rooms];
            return room ? (
              <RoomView key={x} room={room} graph={graph} />
            ) : (
              <div key={x} className="w-32 flex-shrink-0" />
            );
          })}
        </div>
      ))}
    </div>
  );
}
