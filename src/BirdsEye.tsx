import { Graph, Room } from "./types";

function RoomView({ room, graph }: { room: Room; graph: Graph }) {
  return (
    <div className="w-32 border-black border-2 flex-shrink-0">
      <img
        className="w-full"
        src={`https://highway.eightyeightthirty.one/badge/${
          graph.images[room.domain][0]
        }`}
      />
      <p className="break-words font-mono">{room.domain}</p>
    </div>
  );
}

export default function BirdsEye({
  rooms,
  graph,
}: {
  rooms: Record<string, Room>;
  graph: Graph;
}) {
  console.log(rooms);

  const min_x = Math.min(...Object.values(rooms).map((r: Room) => r.x));
  const max_x = Math.max(...Object.values(rooms).map((r: Room) => r.x));
  const min_y = Math.min(...Object.values(rooms).map((r: Room) => r.y));
  const max_y = Math.max(...Object.values(rooms).map((r: Room) => r.y));

  return (
    <div className="flex flex-col">
      {Array.from({ length: max_y - min_y + 1 }, (_, y) => (
        <div key={y} className="flex flex-row h-32">
          {Array.from({ length: max_x - min_x + 1 }, (_, x) => {
            const room =
              rooms[`${x + min_x},${y + min_y}` as keyof typeof rooms];
            return room ? (
              <RoomView key={x} room={room} graph={graph} />
            ) : (
              <div key={x} className="w-32 flex-shrink-0" />
            );
          })}
        </div>
      ))}
    </div>
  );
}
