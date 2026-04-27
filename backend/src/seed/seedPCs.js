import { count } from "drizzle-orm";
import { db, pcs } from "../db/index.js";

const seed = [
  { id: 1, room: "left", position: "bottom" },
  { id: 2, room: "left", position: "bottom" },
  { id: 3, room: "left", position: "bottom" },
  { id: 4, room: "left", position: "bottom" },
  { id: 5, room: "left", position: "bottom" },
  { id: 6, room: "right", position: "top" },
  { id: 7, room: "right", position: "top" },
  { id: 8, room: "right", position: "top" },
  { id: 9, room: "right", position: "top" },
  { id: 10, room: "right", position: "top" },
  { id: 11, room: "right", position: "bottom" },
  { id: 12, room: "right", position: "bottom" },
  { id: 13, room: "right", position: "bottom" },
  { id: 14, room: "right", position: "bottom" },
  { id: 15, room: "right", position: "bottom" }
];

export const seedPCsIfEmpty = async () => {
  const [row] = await db.select({ c: count() }).from(pcs);
  if (Number(row?.c ?? 0) === 0) {
    await db.insert(pcs).values(seed.map((pc) => ({ ...pc, status: "available" })));
  }
};
