import { asc } from "drizzle-orm";
import { db, pcs } from "../db/index.js";
import { calculatePausedMilliseconds } from "../utils/sessionCalculator.js";

export const getPCs = async (req, res, next) => {
  try {
    const pcRows = await db.query.pcs.findMany({
      orderBy: [asc(pcs.id)],
      with: {
        sessions: {
          where: (session, { eq }) => eq(session.sessionStatus, "active"),
          with: {
            customer: true,
            sessionProducts: {
              with: { product: true }
            },
            pauses: true
          }
        }
      }
    });

    const data = pcRows.map((pc) => {
      const activeSession = pc.sessions[0];
      return {
        id: pc.id,
        room: pc.room,
        position: pc.position,
        status: pc.status,
        activeSession: activeSession
          ? {
              id: activeSession.id,
              loginTime: activeSession.loginTime,
              paidAmount: activeSession.paidAmount,
              customer: activeSession.customer,
              isPaused: (activeSession.pauses || []).some((p) => p.pauseEnd === null),
              activePauseStart:
                (activeSession.pauses || []).find((p) => p.pauseEnd === null)?.pauseStart || null,
              pausedMsSoFar: calculatePausedMilliseconds(activeSession.pauses || []),
              sessionProducts: (activeSession.sessionProducts || []).map((sp) => ({
                id: sp.id,
                quantity: sp.quantity,
                unitPrice: sp.unitPrice,
                lineTotal: Number(sp.quantity) * Number(sp.unitPrice),
                product: sp.product
                  ? { id: sp.product.id, name: sp.product.name, price: sp.product.price }
                  : null
              }))
            }
          : null
      };
    });

    res.json(data);
  } catch (error) {
    next(error);
  }
};
