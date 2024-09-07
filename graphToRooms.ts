import fs from "fs/promises";

interface Graph {
  linksTo: Record<string, string[]>;
  linkedFrom: Record<string, string[]>;
  images: Record<string, []>;
}

async function loadGraph(): Promise<Graph> {
  const data = await fs.readFile("graph.json", "utf-8");
  return JSON.parse(data);
}

interface Room {
  domain: string;
  x: number;
  y: number;
}

function neighbors(
  x: number,
  y: number,
  empty: boolean,
  rooms: Map<string, Room>
) {
  const neighbors: [number, number][] = [];
  for (const [dx, dy] of [
    [0, 1],
    // [1, 1],
    [1, 0],
    // [1, -1],
    [0, -1],
    // [-1, -1],
    [-1, 0],
    // [-1, 1],
  ]) {
    const key = `${x + dx},${y + dy}`;
    if (empty === (rooms.get(key) === undefined)) {
      neighbors.push([x + dx, y + dy]);
    }
  }
  return neighbors;
}

function createRooms(graph: Graph): Map<string, Room> {
  const rooms = new Map<string, Room>();

  const start = { domain: "breq.dev", x: 0, y: 0 };
  const placed = new Set<string>(["breq.dev"]);
  const queue: [number, number][] = [...neighbors(0, 0, true, rooms)];
  rooms.set("0,0", start);

  while (queue.length > 0) {
    const current = queue.shift();
    if (current === undefined) {
      break;
    }
    const [x, y] = current;
    // console.log(`Processing ${x},${y}`);

    // find candidates based on filled neighbors
    const candidatesCount = new Map<string, number>();
    for (const [nx, ny] of neighbors(x, y, false, rooms)) {
      const key = `${nx},${ny}`;
      const room = rooms.get(key);

      graph.linkedFrom[room!.domain]?.forEach((d) => {
        candidatesCount.set(d, (candidatesCount.get(d) ?? 0) + 1);
      });

      graph.linksTo[room!.domain]?.forEach((d) => {
        candidatesCount.set(d, (candidatesCount.get(d) ?? 0) + 1);
      });
    }

    // sort candidates by number of links
    const candidates = [...candidatesCount.entries()]
      .sort(([a], [b]) => graph.linksTo[b]?.length - graph.linksTo[a]?.length)
      .sort(([, a], [, b]) => b - a)
      .map(([d]) => d)
      .filter((d) => !placed.has(d));

    // console.log(`Candidates: ${candidates.join(", ")}`);

    // place candidate if available
    if (candidates.length === 0) {
      continue;
    }

    console.log(`Adding ${candidates[0]} at ${x},${y}`);
    rooms.set(`${x},${y}`, { domain: candidates[0], x, y });
    placed.add(candidates[0]);

    // add vacant neighbor cells to queue
    for (const [nx, ny] of neighbors(x, y, true, rooms)) {
      if (
        !placed.has(`${nx},${ny}`) &&
        !queue.find(([qx, qy]) => qx === nx && qy === ny)
      ) {
        queue.push([nx, ny]);
      }
    }
  }

  return rooms;
}

async function exportRooms(rooms: Map<string, Room>) {
  const data = JSON.stringify(Object.fromEntries(rooms));
  await fs.writeFile("rooms.json", data);
}

async function main() {
  console.log("Loading graph");
  const graph = await loadGraph();
  console.log("Graph loaded");
  const rooms = createRooms(graph);
  console.log(
    `Placed ${rooms.size} rooms out of ${
      new Set([
        ...Object.values(graph.linksTo),
        ...Object.values(graph.linkedFrom),
      ]).size
    }`
  );
  console.log("Exporting rooms");
  await exportRooms(rooms);
  console.log("Done!");
}

await main();
