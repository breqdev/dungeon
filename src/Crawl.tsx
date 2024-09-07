import { useLayoutEffect, useRef, useState } from "react";
import { Graph, Room } from "./types";

export default function Crawl({
  rooms,
  goHome,
}: {
  rooms: Record<string, Room>;
  graph: Graph;
  goHome: () => void;
}) {
  const [posn, setPosn] = useState({ x: 0, y: 0 });

  const [term, setTerm] = useState<{ history: string[]; current: string }>({
    history: ["welcome. you are located at: breq.dev"],
    current: "",
  });

  const history = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    history.current?.scrollTo({
      top: history.current.scrollHeight,
      behavior: "smooth",
    });
  }, [term.history]);

  function handleCommand(command: string): string[] {
    const [cmd, ...args] = command.split(" ");

    switch (cmd) {
      case "go": {
        const directions = {
          north: { x: 0, y: -1 },
          east: { x: 1, y: 0 },
          south: { x: 0, y: 1 },
          west: { x: -1, y: 0 },
          northeast: { x: 1, y: -1 },
          southeast: { x: 1, y: 1 },
          southwest: { x: -1, y: 1 },
          northwest: { x: -1, y: -1 },
          n: { x: 0, y: -1 },
          e: { x: 1, y: 0 },
          s: { x: 0, y: 1 },
          w: { x: -1, y: 0 },
          ne: { x: 1, y: -1 },
          se: { x: 1, y: 1 },
          sw: { x: -1, y: 1 },
          nw: { x: -1, y: -1 },
          up: { x: 0, y: -1 },
          right: { x: 1, y: 0 },
          down: { x: 0, y: 1 },
          left: { x: -1, y: 0 },
        };

        if (args.length === 0) {
          return ["go where?"];
        }

        if (args[0] in directions) {
          const { x, y } = directions[args[0] as keyof typeof directions];
          setPosn({ x: posn.x + x, y: posn.y + y });
          return [
            "navigated to " + rooms[`${posn.x + x},${posn.y + y}`]?.domain,
          ];
        } else {
          return ["unknown direction: " + args[0]];
        }
      }
      case "look": {
        return [
          "you are located at: " + rooms[`${posn.x},${posn.y}`]?.domain,
          "you can go: ",
          ...Object.entries({
            north: { x: 0, y: -1 },
            east: { x: 1, y: 0 },
            south: { x: 0, y: 1 },
            west: { x: -1, y: 0 },
          })
            .map(([dir, { x, y }]) => {
              const room = rooms[`${posn.x + x},${posn.y + y}`];
              return room ? `  ${dir} to ${room.domain}` : null;
            })
            .filter((x) => x !== null),
        ];
      }
      case "fly": {
        if (args.length === 0) {
          return ["fly where?"];
        }

        const domain = args[0];
        if (rooms[`${posn.x},${posn.y}`]?.domain === domain) {
          return ["you are already here."];
        }

        if (!Object.values(rooms).some((r) => r.domain === domain)) {
          return ["unknown domain: " + domain];
        }

        const room = Object.values(rooms).find((r) => r.domain === domain);
        if (room) {
          setPosn({ x: room.x, y: room.y });
          return ["teleported to " + domain];
        }

        return ["unknown domain: " + domain];
      }
      case "exit":
        setTimeout(() => goHome(), 500);
        return ["goodbye."];
      case "help":
        return [
          "available commands:",
          "  > go [dir] - move in a direction",
          "  > look - look around",
          "  > fly [domain] - teleport to a domain",
          "  > help - show this help",
          "  > exit - return home",
        ];
      default:
        return ["unknown command: " + cmd];
    }
  }

  const input = useRef<HTMLInputElement>(null);

  useLayoutEffect(() => {
    input.current?.focus();
  }, []);

  return (
    <div className="h-screen flex flex-col bg-gray-600">
      <div className="flex-grow grid place-items-center">
        <div className="w-full max-w-3xl border-[16px] border-gray-900 rounded-2xl">
          <iframe
            sandbox="allow-scripts allow-same-origin"
            src={"https://" + rooms[`${posn.x},${posn.y}`]?.domain}
            className="aspect-[4/3] w-full bg-white"
          />
        </div>
      </div>

      <div className="flex flex-row justify-center p-4">
        <div className="font-mono bg-gray-900 text-green-300 max-w-3xl w-full h-64 p-4 flex flex-col">
          <div className="overflow-y-auto flex flex-col" ref={history}>
            {term.history.map((t, i) => (
              <span className="whitespace-pre" key={i}>
                {t}
              </span>
            ))}
          </div>
          <div className="flex flex-row items-center">
            <span className="whitespace-pre">{"> "}</span>
            <input
              type="text"
              className="outline-none bg-transparent flex-grow"
              value={term.current}
              onChange={(e) =>
                setTerm({ history: term.history, current: e.target.value })
              }
              ref={input}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setTerm({
                    history: [
                      ...term.history,
                      "> " + term.current,
                      ...handleCommand(term.current),
                    ],
                    current: "",
                  });
                }
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
