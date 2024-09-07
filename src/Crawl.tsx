import { useLayoutEffect, useRef, useState } from "react";
import { Graph, Room } from "./types";

export default function Crawl({
  rooms,
}: {
  rooms: Record<string, Room>;
  graph: Graph;
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
          n: { x: 0, y: -1 },
          e: { x: 1, y: 0 },
          s: { x: 0, y: 1 },
          w: { x: -1, y: 0 },
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
      case "help":
        return [
          "available commands:",
          "  > go [dir] - move in a direction",
          "  > help - show this help",
        ];
      default:
        return ["unknown command: " + cmd];
    }
  }

  return (
    <div className="h-screen flex flex-col bg-gray-600">
      <div className="flex-grow grid place-items-center">
        <div className="w-full max-w-3xl border-8 border-black">
          <iframe
            src={"https://" + rooms[`${posn.x},${posn.y}`]?.domain}
            className="aspect-[4/3] w-full"
          />
        </div>
      </div>

      <div className="flex flex-row justify-center p-4">
        <div className="font-mono bg-black text-green-300 max-w-3xl w-full h-48 p-4 flex flex-col">
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
              className="outline-none bg-black flex-grow"
              value={term.current}
              onChange={(e) =>
                setTerm({ history: term.history, current: e.target.value })
              }
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
