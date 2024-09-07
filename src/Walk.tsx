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

export default function Walk({
  rooms,
  goHome,
}: {
  rooms: Record<string, Room>;
  graph: Graph;
  goHome: () => void;
}) {
  useLayoutEffect(() => {
    // prevent pull to refresh on mobile
    document.body.style.overscrollBehaviorY = "contain";

    return () => {
      document.body.style.overscrollBehaviorY = "auto";
    };
  }, []);

  const getWindowSize = useCallback(() => {
    if (window.innerWidth < 768) {
      // try to fill a mobile viewport
      return [
        window.innerWidth - 50,
        window.innerHeight - 200,
        window.innerWidth - 100,
        window.innerHeight - 400,
      ];
    } else {
      // for desktop, find a 4:3 aspect ratio if possible, otherwise do 1:1
      const height = window.innerHeight - 200;
      const width = (height * 4) / 3;
      if (width < window.innerWidth - 200) {
        return [width, height, width - 200, height - 200];
      } else {
        return [height, height, height - 200, height - 200];
      }
    }
  }, []);

  const [
    [WINDOW_WIDTH, WINDOW_HEIGHT, FRAME_WIDTH, FRAME_HEIGHT],
    setWindowSize,
  ] = useState(getWindowSize);

  const posn = useRef({ x: 0, y: 0 });

  const parent = useRef<HTMLDivElement>(null);
  const frames = useRef<Record<string, HTMLElement | null>>({});

  const createFrame = useCallback(
    (src: string) => {
      const wrapper = document.createElement("div");
      wrapper.style.width = `${FRAME_WIDTH}px`;
      wrapper.style.height = `${FRAME_HEIGHT}px`;
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
    },
    [FRAME_WIDTH, FRAME_HEIGHT]
  );

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
          (WINDOW_HEIGHT - FRAME_HEIGHT) / 2 +
          (y - posn.current.y) * FRAME_HEIGHT +
          "px";
        frames.current[room.domain]!.style.left =
          (WINDOW_WIDTH - FRAME_WIDTH) / 2 +
          (x - posn.current.x) * FRAME_WIDTH +
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
  }, [
    rooms,
    createFrame,
    WINDOW_WIDTH,
    WINDOW_HEIGHT,
    FRAME_WIDTH,
    FRAME_HEIGHT,
  ]);

  useEffect(() => {
    const handler = () => {
      const size = getWindowSize();
      setWindowSize(size);
      moveFrames();

      // resize all frames
      const [, , FRAME_WIDTH, FRAME_HEIGHT] = size;
      for (const key in frames.current) {
        frames.current[key]!.style.width = `${FRAME_WIDTH}px`;
        frames.current[key]!.style.height = `${FRAME_HEIGHT}px`;
      }
    };

    window.addEventListener("resize", handler);

    return () => {
      window.removeEventListener("resize", handler);
    };
  }, [getWindowSize, moveFrames]);

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
  const lastDrag = useRef<[number, number] | null>(null);
  const [mode, setMode] = useState<"move" | "interact">("move");

  return (
    <div className="grid place-items-center h-[calc(100dvh)] overflow-hidden w-full bg-gray-600">
      <div className="flex flex-col lg:flex-row-reverse gap-2">
        <div className="border-[16px] border-black rounded-2xl">
          <div
            className="relative overflow-hidden"
            style={{
              width: `${WINDOW_WIDTH}px`,
              height: `${WINDOW_HEIGHT}px`,
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
              onMouseDown={(e) => {
                setDragging(true);
                lastDrag.current = [e.clientX, e.clientY];
              }}
              onTouchStart={(e) => {
                // prevent "pull down to refresh" behavior
                e.preventDefault();

                setDragging(true);
                lastDrag.current = [e.touches[0].clientX, e.touches[0].clientY];
              }}
              onMouseUp={() => setDragging(false)}
              onTouchEnd={() => setDragging(false)}
              onMouseOut={() => setDragging(false)}
              onTouchCancel={() => setDragging(false)}
              onMouseMove={(e) => {
                if (dragging && lastDrag.current) {
                  posn.current.x -=
                    (e.clientX - lastDrag.current[0]) / WINDOW_WIDTH;
                  posn.current.y -=
                    (e.clientY - lastDrag.current[1]) / WINDOW_HEIGHT;
                  lastDrag.current = [e.clientX, e.clientY];
                  moveFrames();
                }
              }}
              onTouchMove={(e) => {
                // prevent "pull down to refresh" behavior
                e.preventDefault();

                if (dragging && lastDrag.current) {
                  posn.current.x -=
                    (e.touches[0].clientX - lastDrag.current[0]) / WINDOW_WIDTH;
                  posn.current.y -=
                    (e.touches[0].clientY - lastDrag.current[1]) /
                    WINDOW_HEIGHT;
                  lastDrag.current = [
                    e.touches[0].clientX,
                    e.touches[0].clientY,
                  ];
                  moveFrames();
                }
              }}
            />
          </div>
        </div>
        <div className="flex flex-row lg:flex-col gap-2">
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
      </div>
    </div>
  );
}
