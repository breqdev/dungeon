import { useCallback, useEffect, useLayoutEffect, useRef } from "react";
import { Graph, Room } from "./types";

const FRAME_SIZE = 750;

export default function Walk({
  rooms,
}: {
  rooms: Record<string, Room>;
  graph: Graph;
}) {
  const posn = useRef({ x: 0, y: 0 });

  const parent = useRef<HTMLDivElement>(null);
  const frames = useRef<Record<string, HTMLIFrameElement | null>>({});

  const createFrame = useCallback((src: string) => {
    const newFrame = document.createElement("iframe");
    newFrame.src = "https://" + src;
    newFrame.style.width = `${FRAME_SIZE}px`;
    newFrame.style.height = `${FRAME_SIZE}px`;
    newFrame.style.position = "absolute";
    newFrame.style.border = "8px black";
    newFrame.style.backgroundColor = "white";
    return newFrame;
  }, []);

  const moveFrames = useCallback(() => {
    const x_frac = posn.current.x - Math.floor(posn.current.x);
    const y_frac = posn.current.y - Math.floor(posn.current.y);

    // figure out what 4 frames should be in view
    const tl =
      rooms[`${Math.floor(posn.current.x)},${Math.floor(posn.current.y)}`];
    const tr =
      rooms[`${Math.floor(posn.current.x) + 1},${Math.floor(posn.current.y)}`];
    const bl =
      rooms[`${Math.floor(posn.current.x)},${Math.floor(posn.current.y) + 1}`];
    const br =
      rooms[
        `${Math.floor(posn.current.x) + 1},${Math.floor(posn.current.y) + 1}`
      ];

    // create iframes if needed
    if (!frames.current[tl.domain]) {
      console.log(`Creating frame for ${tl.domain}`);
      frames.current[tl.domain] = createFrame(tl.domain);
      parent.current?.appendChild(frames.current[tl.domain]!);
    }
    if (!frames.current[tr.domain]) {
      console.log(`Creating frame for ${tr.domain}`);
      frames.current[tr.domain] = createFrame(tr.domain);
      parent.current?.appendChild(frames.current[tr.domain]!);
    }
    if (!frames.current[bl.domain]) {
      console.log(`Creating frame for ${bl.domain}`);
      frames.current[bl.domain] = createFrame(bl.domain);
      parent.current?.appendChild(frames.current[bl.domain]!);
    }
    if (!frames.current[br.domain]) {
      console.log(`Creating frame for ${br.domain}`);
      frames.current[br.domain] = createFrame(br.domain);
      parent.current?.appendChild(frames.current[br.domain]!);
    }

    // keep all 4 iframes in view
    frames.current[tl.domain]!.style.top = 0 - y_frac * FRAME_SIZE + "px";
    frames.current[tl.domain]!.style.left = 0 - x_frac * FRAME_SIZE + "px";
    frames.current[tr.domain]!.style.top = 0 - y_frac * FRAME_SIZE + "px";
    frames.current[tr.domain]!.style.left =
      FRAME_SIZE - x_frac * FRAME_SIZE + "px";
    frames.current[bl.domain]!.style.top =
      FRAME_SIZE - y_frac * FRAME_SIZE + "px";
    frames.current[bl.domain]!.style.left = 0 - x_frac * FRAME_SIZE + "px";
    frames.current[br.domain]!.style.top =
      FRAME_SIZE - y_frac * FRAME_SIZE + "px";
    frames.current[br.domain]!.style.left =
      FRAME_SIZE - x_frac * FRAME_SIZE + "px";

    // remove frames that are out of view
    for (const key in frames.current) {
      if (
        key === tl.domain ||
        key === tr.domain ||
        key === bl.domain ||
        key === br.domain
      ) {
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
      <div
        className="relative overflow-hidden"
        style={{
          width: `${FRAME_SIZE}px`,
          height: `${FRAME_SIZE}px`,
        }}
        ref={parent}
      >
        <div
          className="absolute inset-0 border-2 border-black z-10"
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
              posn.current.x -= e.movementX / FRAME_SIZE;
              posn.current.y -= e.movementY / FRAME_SIZE;
              moveFrames();
            }
          }}
        />
      </div>
    </div>
  );
}
