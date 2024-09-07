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

  const tl = useRef<HTMLIFrameElement>(null);
  const tr = useRef<HTMLIFrameElement>(null);
  const bl = useRef<HTMLIFrameElement>(null);
  const br = useRef<HTMLIFrameElement>(null);

  const moveFrames = useCallback(() => {
    const x_frac = posn.current.x - Math.floor(posn.current.x);
    const y_frac = posn.current.y - Math.floor(posn.current.y);

    // keep all 4 iframes in view
    tl.current!.style.top = 0 - y_frac * FRAME_SIZE + "px";
    tl.current!.style.left = 0 - x_frac * FRAME_SIZE + "px";
    tr.current!.style.top = 0 - y_frac * FRAME_SIZE + "px";
    tr.current!.style.left = FRAME_SIZE - x_frac * FRAME_SIZE + "px";
    bl.current!.style.top = FRAME_SIZE - y_frac * FRAME_SIZE + "px";
    bl.current!.style.left = 0 - x_frac * FRAME_SIZE + "px";
    br.current!.style.top = FRAME_SIZE - y_frac * FRAME_SIZE + "px";
    br.current!.style.left = FRAME_SIZE - x_frac * FRAME_SIZE + "px";

    // load the pages
    function updateFrame(frame: HTMLIFrameElement, src: string) {
      if (!frame.src || new URL(frame.src).origin !== new URL(src).origin) {
        frame.src = src;
      }
    }

    updateFrame(
      tl.current!,
      "https://" +
        rooms[`${Math.floor(posn.current.x)},${Math.floor(posn.current.y)}`]
          ?.domain
    );
    updateFrame(
      tr.current!,
      "https://" +
        rooms[`${Math.floor(posn.current.x) + 1},${Math.floor(posn.current.y)}`]
          ?.domain
    );
    updateFrame(
      bl.current!,
      "https://" +
        rooms[`${Math.floor(posn.current.x)},${Math.floor(posn.current.y) + 1}`]
          ?.domain
    );
    updateFrame(
      br.current!,
      "https://" +
        rooms[
          `${Math.floor(posn.current.x) + 1},${Math.floor(posn.current.y) + 1}`
        ]?.domain
    );
  }, [rooms]);

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
  }, [moveFrames]);

  const dragging = useRef(false);

  return (
    <div className="grid place-items-center h-screen w-full bg-gray-600">
      <div
        className="relative overflow-hidden"
        style={{
          width: `${FRAME_SIZE}px`,
          height: `${FRAME_SIZE}px`,
        }}
      >
        <iframe
          ref={tl}
          style={{
            width: `${FRAME_SIZE}px`,
            height: `${FRAME_SIZE}px`,
            position: "absolute",
            border: "8px black",
            backgroundColor: "white",
          }}
        />
        <iframe
          ref={tr}
          style={{
            width: `${FRAME_SIZE}px`,
            height: `${FRAME_SIZE}px`,
            position: "absolute",
            border: "8px black",
            backgroundColor: "white",
          }}
        />
        <iframe
          ref={bl}
          style={{
            width: `${FRAME_SIZE}px`,
            height: `${FRAME_SIZE}px`,
            position: "absolute",
            border: "8px black",
            backgroundColor: "white",
          }}
        />
        <iframe
          ref={br}
          style={{
            width: `${FRAME_SIZE}px`,
            height: `${FRAME_SIZE}px`,
            position: "absolute",
            border: "8px black",
            backgroundColor: "white",
          }}
        />

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
