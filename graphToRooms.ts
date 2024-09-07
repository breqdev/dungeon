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

function createRooms(graph: Graph): Map<string, Room> {
  const rooms = new Map<string, Room>();

  const start = { domain: "breq.dev", x: 0, y: 0 };
  const placed = new Set<string>(["breq.dev"]);
  const queue = [start];
  rooms.set("0,0", start);

  while (queue.length > 0) {
    const current = queue.shift();
    if (current === undefined) {
      break;
    }

    // figure out what we can put in neighbor cells
    const candidates = [
      ...new Set(
        graph.linksTo[current.domain]
          ?.concat(graph.linkedFrom[current.domain])
          .filter((d) => !placed.has(d))
          .sort(
            (a, b) => graph.linksTo[b]?.length - graph.linksTo[a]?.length
          ) ?? []
      ),
    ];

    // look for vacant neighbor cells
    function neighbors(room: Room, rooms: Map<string, Room>) {
      const { x, y } = room;
      const neighbors: [number, number][] = [];
      for (const [dx, dy] of [
        [0, 1],
        [1, 0],
        [0, -1],
        [-1, 0],
      ]) {
        const key = `${x + dx},${y + dy}`;
        if (rooms.get(key) === undefined) {
          neighbors.push([x + dx, y + dy]);
        }
      }
      return neighbors;
    }

    for (const [x, y] of neighbors(current, rooms)) {
      const key = `${x},${y}`;
      if (rooms.get(key) === undefined) {
        while (true) {
          const domain = candidates.shift();
          if (domain === undefined) {
            break;
          }
          if (placed.has(domain)) {
            continue;
          }

          const neighbor = { domain, x, y };
          console.log(`Adding ${neighbor.domain} at ${x},${y}`);
          rooms.set(key, neighbor);
          queue.push(neighbor);
          placed.add(neighbor.domain);
          break;
        }
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
  console.log("Exporting rooms");
  await exportRooms(rooms);
  console.log("Done!");
}

await main();
