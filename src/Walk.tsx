import { useCallback, useEffect, useLayoutEffect, useRef } from "react";
import { Graph, Room } from "./types";

const FRAME_SIZE = 600;
const WINDOW_SIZE = 800;

export default function Walk({
  rooms,
}: {
  rooms: Record<string, Room>;
  graph: Graph;
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

  const dragging = useRef(false);

  return (
    <div className="grid place-items-center h-screen w-full bg-gray-600">
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
            className="absolute inset-0 z-10"
            onMouseDown={() => {
              dragging.current = true;
            }}
            onMouseUp={() => {
              dragging.current = false;
            }}
            onMouseOut={() => {
              dragging.current = false;
            }}
            onMouseMove={(e) => {
              if (dragging.current) {
                posn.current.x -= e.movementX / WINDOW_SIZE;
                posn.current.y -= e.movementY / WINDOW_SIZE;
                moveFrames();
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}
