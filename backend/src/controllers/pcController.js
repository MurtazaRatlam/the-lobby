import db from "../models/index.js";
import { calculatePausedMilliseconds } from "../utils/sessionCalculator.js";

const { PC, Session, Customer, SessionProduct, Product, SessionPause } = db;

export const getPCs = async (req, res, next) => {
  try {
    const pcs = await PC.findAll({
      include: [
        {
          model: Session,
          where: { sessionStatus: "active" },
          required: false,
          include: [
            { model: Customer },
            {
              model: SessionProduct,
              as: "sessionProducts",
              include: [{ model: Product }]
            },
            { model: SessionPause, as: "pauses" }
          ]
        }
      ],
      order: [["id", "ASC"]]
    });

    const data = pcs.map((pc) => ({
      id: pc.id,
      room: pc.room,
      position: pc.position,
      status: pc.status,
      activeSession: pc.Sessions[0]
        ? {
            id: pc.Sessions[0].id,
            loginTime: pc.Sessions[0].loginTime,
            paidAmount: pc.Sessions[0].paidAmount,
            customer: pc.Sessions[0].Customer,
            isPaused: (pc.Sessions[0].pauses || []).some((p) => p.pauseEnd === null),
            activePauseStart:
              (pc.Sessions[0].pauses || []).find((p) => p.pauseEnd === null)?.pauseStart || null,
            pausedMsSoFar: calculatePausedMilliseconds(pc.Sessions[0].pauses || []),
            sessionProducts: (pc.Sessions[0].sessionProducts || []).map((sp) => ({
              id: sp.id,
              quantity: sp.quantity,
              unitPrice: sp.unitPrice,
              lineTotal: Number(sp.quantity) * Number(sp.unitPrice),
              product: sp.Product
                ? { id: sp.Product.id, name: sp.Product.name, price: sp.Product.price }
                : null
            }))
          }
        : null
    }));

    res.json(data);
  } catch (error) {
    next(error);
  }
};
