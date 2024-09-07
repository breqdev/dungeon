import rooms from "../rooms.json";
import graph from "../graph.json";
import BirdsEye from "./BirdsEye";
import { Graph } from "./types";
import Navigate from "./Navigate";
import { ReactNode, useState } from "react";
import Walk from "./Walk";
import Crawl from "./Crawl";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowsUpDownLeftRight,
  faDesktop,
  faTableCells,
  faTerminal,
  IconDefinition,
} from "@fortawesome/free-solid-svg-icons";

type View = "birdsEye" | "navigate" | "walk" | "crawl";

function ViewButton({
  view,
  label,
  setView,
  icon,
  children,
}: {
  view: View;
  label: string;
  setView: (v: View) => void;
  icon: IconDefinition;
  children: ReactNode;
}) {
  return (
    <button
      className="bg-black text-white p-4 rounded-xl w-full max-w-lg flex flex-row text-left gap-6"
      onClick={() => setView(view)}
    >
      <FontAwesomeIcon icon={icon} className="text-5xl aspect-square" />
      <div className="flex flex-col">
        <h2 className="text-2xl">{label}</h2>
        <p>{children}</p>
      </div>
    </button>
  );
}

export default function App() {
  const [view, setView] = useState<View>();

  if (view === "birdsEye") {
    return (
      <BirdsEye
        rooms={rooms}
        graph={graph as Graph}
        goHome={() => setView(undefined)}
      />
    );
  } else if (view === "navigate") {
    return (
      <Navigate
        rooms={rooms}
        graph={graph as Graph}
        goHome={() => setView(undefined)}
      />
    );
  } else if (view === "walk") {
    return (
      <Walk
        rooms={rooms}
        graph={graph as Graph}
        goHome={() => setView(undefined)}
      />
    );
  } else if (view === "crawl") {
    return (
      <Crawl
        rooms={rooms}
        graph={graph as Graph}
        goHome={() => setView(undefined)}
      />
    );
  } else {
    return (
      <div className="h-screen flex flex-col justify-center items-center bg-gray-600 text-white text-center gap-2">
        <h2 className="py-2 text-3xl">choose your adventure</h2>
        <ViewButton
          view="birdsEye"
          setView={setView}
          label="Birds Eye"
          icon={faTableCells}
        >
          A top-down view of the full map.
        </ViewButton>
        <ViewButton
          view="navigate"
          setView={setView}
          label="Navigate"
          icon={faDesktop}
        >
          Navigate the map as a two-dimensional webring.
        </ViewButton>
        <ViewButton
          view="walk"
          setView={setView}
          label="Walk"
          icon={faArrowsUpDownLeftRight}
        >
          Sites embedded on a large draggable canvas.
        </ViewButton>
        <ViewButton
          view="crawl"
          setView={setView}
          label="Crawl"
          icon={faTerminal}
        >
          A "dungeon crawl" style text-based adventure.
        </ViewButton>

        <div className="pt-16 flex flex-col gap-2 max-w-xl">
          <p>
            88x31 dungeon is a project by{" "}
            <a href="https://breq.dev/">
              <img
                className="inline"
                style={{ imageRendering: "pixelated" }}
                src="https://breq.dev/badges/breq.png"
              />
            </a>{" "}
            based on data by{" "}
            <a href="https://eightyeightthirty.one/">
              <img
                className="inline"
                style={{ imageRendering: "pixelated" }}
                src="https://breq.dev/badges/eightyeightthirtyone.png"
              />
            </a>
            .
          </p>
          <p>
            note: these experiences load arbitrary websites as iframes, and may
            autoplay music, lag your computer, or otherwise annoy you.
          </p>
        </div>
      </div>
    );
  }
}
