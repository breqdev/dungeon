export interface Room {
  domain: string;
  x: number;
  y: number;
}

export interface Graph {
  linksTo: Record<string, string[]>;
  linkedFrom: Record<string, string[]>;
  images: Record<string, string[]>;
}
