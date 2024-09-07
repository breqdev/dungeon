import { useLayoutEffect, useMemo, useRef } from "react";
import { Graph, Room } from "./types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";

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
  goHome,
}: {
  rooms: Record<string, Room>;
  graph: Graph;
  goHome: () => void;
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

  // making this a controlled input lags too much
  // bc we're trashing the main thread loading so many images lmao
  const flyTo = useRef<HTMLInputElement>(null);

  return (
    <div className="flex flex-col relative">
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

      <div className="fixed bottom-0 left-0 right-0 flex flex-row p-6 justify-center">
        <div className="bg-gray-800/75 text-white p-3 rounded-2xl flex flex-row gap-2 w-full max-w-lg items-center">
          <button
            className="flex flex-row gap-2 items-center border-gray-400 border-2 rounded-xl px-2 py-px"
            onClick={goHome}
          >
            <FontAwesomeIcon icon={faArrowLeft} />
            <span>return home</span>
          </button>
          <div className="w-0.5 bg-gray-400 h-full" />
          <span>fly to</span>
          <input
            type="text"
            ref={flyTo}
            className="bg-transparent px-1 py-px outline-none border-b-2 border-gray-400 focus-visible:border-white flex-grow"
          />
          <button
            className="border-gray-400 border-2 rounded-xl px-2 py-px"
            onClick={() => {
              const target = flyTo.current?.value;
              const room = Object.values(rooms).find(
                (r) => r.domain === target
              );
              if (room) {
                window.scrollTo(
                  (room.x - min_x) * 128 - window.innerWidth / 2 + 64,
                  (room.y - min_y) * 128 - window.innerHeight / 2 + 64
                );
              }
            }}
          >
            go
          </button>
        </div>
      </div>
    </div>
  );
}
