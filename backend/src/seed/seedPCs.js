import db from "../models/index.js";

const { PC } = db;

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
  const count = await PC.count();
  if (count === 0) {
    await PC.bulkCreate(seed.map((pc) => ({ ...pc, status: "available" })));
  }
};
