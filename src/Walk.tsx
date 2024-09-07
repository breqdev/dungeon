import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { Graph, Room } from "./types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faArrowPointer,
  faArrowsUpDownLeftRight,
} from "@fortawesome/free-solid-svg-icons";

const FRAME_SIZE = 600;
const WINDOW_SIZE = 800;

export default function Walk({
  rooms,
  goHome,
}: {
  rooms: Record<string, Room>;
  graph: Graph;
  goHome: () => void;
}) {
  const posn = useRef({ x: 0, y: 0 });

  const parent = useRef<HTMLDivElement>(null);
  const frames = useRef<Record<string, HTMLElement | null>>({});

  const createFrame = useCallback((src: string) => {
    const wrapper = document.createElement("div");
    wrapper.style.width = `${FRAME_SIZE}px`;
    wrapper.style.height = `${FRAME_SIZE}px`;
    wrapper.style.position = "absolute";
    wrapper.style.border = "8px #111827 solid";

    const newFrame = document.createElement("iframe");
    newFrame.src = "https://" + src;
    newFrame.sandbox.add("allow-scripts");
    newFrame.sandbox.add("allow-same-origin");
    newFrame.style.backgroundColor = "white";
    newFrame.style.width = "100%";
    newFrame.style.height = "100%";
    newFrame.style.border = "none";

    wrapper.appendChild(newFrame);
    return wrapper;
  }, []);

  const moveFrames = useCallback(() => {
    // tile frames within the window
    const min_x = Math.floor(posn.current.x) - 1;
    const min_y = Math.floor(posn.current.y) - 1;
    const max_x = Math.ceil(posn.current.x) + 1;
    const max_y = Math.ceil(posn.current.y) + 1;

    const in_use = new Set<string>();

    for (let x = min_x; x <= max_x; x++) {
      for (let y = min_y; y <= max_y; y++) {
        const room = rooms[`${x},${y}`];
        if (!room) {
          continue;
        }

        in_use.add(room.domain);

        if (!frames.current[room.domain]) {
          console.log(`Creating frame for ${room.domain}`);
          frames.current[room.domain] = createFrame(room.domain);
          parent.current?.appendChild(frames.current[room.domain]!);
        }

        frames.current[room.domain]!.style.top =
          (WINDOW_SIZE - FRAME_SIZE) / 2 +
          (y - posn.current.y) * FRAME_SIZE +
          "px";
        frames.current[room.domain]!.style.left =
          (WINDOW_SIZE - FRAME_SIZE) / 2 +
          (x - posn.current.x) * FRAME_SIZE +
          "px";
      }
    }

    // remove frames that are out of view
    for (const key in frames.current) {
      if (in_use.has(key)) {
        continue;
      }
      console.log(`Removing frame for ${key}`);
      parent.current?.removeChild(frames.current[key]!);
      delete frames.current[key];
    }
  }, [rooms, createFrame]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp") {
        posn.current.y -= 0.1;
      } else if (e.key === "ArrowDown") {
        posn.current.y += 0.1;
      } else if (e.key === "ArrowLeft") {
        posn.current.x -= 0.1;
      } else if (e.key === "ArrowRight") {
        posn.current.x += 0.1;
      }

      moveFrames();
    };

    document.addEventListener("keydown", handler);

    return () => {
      document.removeEventListener("keydown", handler);
    };
  });

  useLayoutEffect(() => {
    moveFrames();
  }, [createFrame, moveFrames]);

  const [dragging, setDragging] = useState(false);
  const [mode, setMode] = useState<"move" | "interact">("move");

  return (
    <div className="grid place-items-center h-screen w-full bg-gray-600">
      <div className="flex flex-row gap-2">
        <div className="flex flex-col w-16 gap-2">
          <button
            className="bg-black text-white h-16 w-16 rounded-xl text-2xl"
            onClick={goHome}
          >
            <FontAwesomeIcon icon={faArrowLeft} />
          </button>
          <button
            className={
              "h-16 w-16 rounded-xl text-2xl " +
              (mode === "move" ? "bg-white text-black" : "bg-black text-white")
            }
            onClick={() => setMode("move")}
          >
            <FontAwesomeIcon icon={faArrowsUpDownLeftRight} />
          </button>
          <button
            className={
              "h-16 w-16 rounded-xl text-2xl " +
              (mode === "interact"
                ? "bg-white text-black"
                : "bg-black text-white")
            }
            onClick={() => setMode("interact")}
          >
            <FontAwesomeIcon icon={faArrowPointer} />
          </button>
        </div>
        <div className="border-[16px] border-black rounded-2xl">
          <div
            className="relative overflow-hidden"
            style={{
              width: `${WINDOW_SIZE}px`,
              height: `${WINDOW_SIZE}px`,
            }}
            ref={parent}
          >
            <div
              className={
                "absolute inset-0 z-10 " +
                (mode === "move"
                  ? dragging
                    ? "cursor-grabbing"
                    : "cursor-grab"
                  : "pointer-events-none")
              }
              onMouseDown={() => {
                setDragging(true);
              }}
              onMouseUp={() => {
                setDragging(false);
              }}
              onMouseOut={() => {
                setDragging(false);
              }}
              onMouseMove={(e) => {
                if (dragging) {
                  posn.current.x -= e.movementX / WINDOW_SIZE;
                  posn.current.y -= e.movementY / WINDOW_SIZE;
                  moveFrames();
                }
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
