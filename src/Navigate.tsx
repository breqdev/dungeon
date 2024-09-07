import { useEffect, useState } from "react";
import { Graph, Room } from "./types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExternalLink, faHome } from "@fortawesome/free-solid-svg-icons";

export default function Navigate({
  rooms,
  graph,
  goHome,
}: {
  rooms: Record<string, Room>;
  graph: Graph;
  goHome: () => void;
}) {
  const [posn, setPosn] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowUp":
          if (rooms[`${posn.x},${posn.y - 1}`]) {
            setPosn({ x: posn.x, y: posn.y - 1 });
          }
          break;
        case "ArrowDown":
          if (rooms[`${posn.x},${posn.y + 1}`]) {
            setPosn({ x: posn.x, y: posn.y + 1 });
          }
          break;
        case "ArrowLeft":
          if (rooms[`${posn.x - 1},${posn.y}`]) {
            setPosn({ x: posn.x - 1, y: posn.y });
          }
          break;
        case "ArrowRight":
          if (rooms[`${posn.x + 1},${posn.y}`]) {
            setPosn({ x: posn.x + 1, y: posn.y });
          }
          break;
      }
    };

    document.addEventListener("keydown", handler);

    return () => {
      document.removeEventListener("keydown", handler);
    };
  }, [posn]);

  return (
    <div className="h-screen flex flex-col bg-gray-600">
      <div className="flex flex-row gap-2 justify-center p-4">
        <a
          href={`https://${rooms[`${posn.x},${posn.y}`]?.domain}`}
          className="aspect-[88/31]"
        >
          {...[
            <img
              key={`${posn.x},${posn.y}`}
              className="h-full bg-white"
              style={{ imageRendering: "pixelated" }}
              src={`https://highway.eightyeightthirty.one/badge/${
                graph.images[rooms[`${posn.x},${posn.y}`].domain][0]
              }`}
            />,
          ]}
        </a>

        <span className="flex-grow" />
        <div className="flex flex-col px-2 gap-2 justify-between">
          <button
            className="bg-black text-white h-14 w-14 rounded-xl text-2xl"
            onClick={goHome}
          >
            <FontAwesomeIcon icon={faHome} />
          </button>
          <a
            className="bg-black text-white h-14 w-14 rounded-xl text-2xl grid place-items-center"
            href={`https://${rooms[`${posn.x},${posn.y}`]?.domain}`}
            rel="noreferrer"
            target="_blank"
          >
            <FontAwesomeIcon icon={faExternalLink} />
          </a>
        </div>

        <button
          className="bg-black text-white flex flex-col justify-center w-64 h-32 rounded-xl"
          onClick={() => setPosn({ x: posn.x - 1, y: posn.y })}
          disabled={!rooms[`${posn.x - 1},${posn.y}`]}
        >
          <span className="text-7xl">←</span>
          <span className="text-sm">
            {rooms[`${posn.x - 1},${posn.y}`]?.domain}
          </span>
        </button>
        <button
          className="bg-black text-white flex flex-col justify-center w-64 h-32 rounded-xl"
          onClick={() => setPosn({ x: posn.x, y: posn.y - 1 })}
          disabled={!rooms[`${posn.x},${posn.y - 1}`]}
        >
          <span className="text-7xl">↑</span>
          <span className="text-sm">
            {rooms[`${posn.x},${posn.y - 1}`]?.domain}
          </span>
        </button>
        <button
          className="bg-black text-white flex flex-col justify-center w-64 h-32 rounded-xl"
          onClick={() => setPosn({ x: posn.x, y: posn.y + 1 })}
          disabled={!rooms[`${posn.x},${posn.y + 1}`]}
        >
          <span className="text-7xl">↓</span>
          <span className="text-sm">
            {rooms[`${posn.x},${posn.y + 1}`]?.domain}
          </span>
        </button>
        <button
          className="bg-black text-white flex flex-col justify-center w-64 h-32 rounded-xl"
          onClick={() => setPosn({ x: posn.x + 1, y: posn.y })}
          disabled={!rooms[`${posn.x + 1},${posn.y}`]}
        >
          <span className="text-7xl">→</span>
          <span className="text-sm">
            {rooms[`${posn.x + 1},${posn.y}`]?.domain}
          </span>
        </button>
      </div>
      <iframe
        sandbox="allow-scripts allow-same-origin"
        src={"https://" + rooms[`${posn.x},${posn.y}`]?.domain}
        className="w-full flex-grow"
      />
    </div>
  );
}
