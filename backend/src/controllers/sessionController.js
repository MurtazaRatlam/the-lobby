import { and, count, eq, gte, isNull, sql, sum } from "drizzle-orm";
import {
  customers,
  db,
  pcs,
  products,
  sessionPauses,
  sessionProducts,
  sessions
} from "../db/index.js";
import {
  calculatePausedMilliseconds,
  calculatePcPayableWithPaused
} from "../utils/sessionCalculator.js";

export const startSession = async (req, res, next) => {
  try {
    const { pcId, customerId, customerName, customerPhone } = req.body;

    await db.transaction(async (tx) => {
      const [pc] = await tx.select().from(pcs).where(eq(pcs.id, pcId));
      if (!pc) throw new Error("PC not found");
      if (pc.status !== "available") throw new Error("PC is already in use");

      let finalCustomerId = customerId;
      if (!finalCustomerId) {
        const [customer] = await tx
          .insert(customers)
          .values({ name: customerName, phone: customerPhone })
          .returning();
        finalCustomerId = customer.id;
      }

      const [session] = await tx
        .insert(sessions)
        .values({
          customerId: finalCustomerId,
          pcId,
          loginTime: new Date(),
          paidAmount: 0,
          sessionStatus: "active"
        })
        .returning();

      await tx
        .update(pcs)
        .set({ status: "in_use", updatedAt: new Date() })
        .where(eq(pcs.id, pcId));

      res.status(201).json(session);
    });
  } catch (error) {
    next(error);
  }
};

export const logoutSession = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const { customLogoutTime, paidAmount } = req.body;

    await db.transaction(async (tx) => {
      const [session] = await tx.select().from(sessions).where(eq(sessions.id, Number(sessionId)));
      if (!session || session.sessionStatus !== "active") {
        throw new Error("Active session not found");
      }

      const logoutTime = customLogoutTime ? new Date(customLogoutTime) : new Date();
      const isCustomLogout = Boolean(customLogoutTime);

      const pauses = await tx
        .select()
        .from(sessionPauses)
        .where(eq(sessionPauses.sessionId, session.id));
      const pausedMs = calculatePausedMilliseconds(pauses, logoutTime);
      const { totalHours, pcPayable } = calculatePcPayableWithPaused(
        session.loginTime,
        logoutTime,
        pausedMs
      );

      const lines = await tx
        .select()
        .from(sessionProducts)
        .where(eq(sessionProducts.sessionId, session.id));
      const productsTotal = lines.reduce(
        (acc, line) => acc + Number(line.quantity) * Number(line.unitPrice),
        0
      );
      const payableAmount = pcPayable + productsTotal;

      const hasPaidAmount = paidAmount !== undefined && paidAmount !== null && paidAmount !== "";
      const finalPaidAmount = hasPaidAmount ? Number(paidAmount) : payableAmount;
      const pendingAmount = Math.max(0, payableAmount - finalPaidAmount);

      await tx
        .update(sessions)
        .set({
          logoutTime,
          totalHours,
          payableAmount,
          paidAmount: finalPaidAmount,
          pendingAmount,
          isCustomLogout,
          sessionStatus: "completed",
          updatedAt: new Date()
        })
        .where(eq(sessions.id, session.id));

      await tx
        .update(pcs)
        .set({ status: "available", updatedAt: new Date() })
        .where(eq(pcs.id, session.pcId));

      const [updated] = await tx.select().from(sessions).where(eq(sessions.id, session.id));
      res.json(updated);
    });
  } catch (error) {
    next(error);
  }
};

export const addSessionProduct = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const { productId, quantity = 1 } = req.body;

    await db.transaction(async (tx) => {
      const [session] = await tx.select().from(sessions).where(eq(sessions.id, Number(sessionId)));
      if (!session || session.sessionStatus !== "active") {
        throw new Error("Active session not found");
      }

      const [product] = await tx.select().from(products).where(eq(products.id, productId));
      if (!product) throw new Error("Product not found");

      const qty = Math.max(1, Number(quantity) || 1);
      const unitPrice = String(product.price);

      const [existing] = await tx
        .select()
        .from(sessionProducts)
        .where(
          and(eq(sessionProducts.sessionId, session.id), eq(sessionProducts.productId, productId))
        );

      let lineId;
      if (existing) {
        await tx
          .update(sessionProducts)
          .set({
            quantity: sql`${sessionProducts.quantity} + ${qty}`,
            updatedAt: new Date()
          })
          .where(eq(sessionProducts.id, existing.id));
        lineId = existing.id;
      } else {
        const [created] = await tx
          .insert(sessionProducts)
          .values({
            sessionId: session.id,
            productId,
            quantity: qty,
            unitPrice
          })
          .returning();
        lineId = created.id;
      }

      const [line] = await tx.select().from(sessionProducts).where(eq(sessionProducts.id, lineId));
      const withProduct = { ...line, Product: product };
      res.status(201).json(withProduct);
    });
  } catch (error) {
    next(error);
  }
};

export const pauseSession = async (req, res, next) => {
  try {
    const { sessionId } = req.params;

    await db.transaction(async (tx) => {
      const [session] = await tx.select().from(sessions).where(eq(sessions.id, Number(sessionId)));
      if (!session || session.sessionStatus !== "active") {
        throw new Error("Active session not found");
      }

      const [activePause] = await tx
        .select()
        .from(sessionPauses)
        .where(and(eq(sessionPauses.sessionId, session.id), isNull(sessionPauses.pauseEnd)));
      if (activePause) return res.status(400).json({ message: "Session is already paused" });

      const [pause] = await tx
        .insert(sessionPauses)
        .values({ sessionId: session.id, pauseStart: new Date() })
        .returning();

      res.status(201).json(pause);
    });
  } catch (error) {
    next(error);
  }
};

export const resumeSession = async (req, res, next) => {
  try {
    const { sessionId } = req.params;

    await db.transaction(async (tx) => {
      const [session] = await tx.select().from(sessions).where(eq(sessions.id, Number(sessionId)));
      if (!session || session.sessionStatus !== "active") {
        throw new Error("Active session not found");
      }

      const [activePause] = await tx
        .select()
        .from(sessionPauses)
        .where(and(eq(sessionPauses.sessionId, session.id), isNull(sessionPauses.pauseEnd)));
      if (!activePause) return res.status(400).json({ message: "Session is not paused" });

      await tx
        .update(sessionPauses)
        .set({ pauseEnd: new Date(), updatedAt: new Date() })
        .where(eq(sessionPauses.id, activePause.id));

      const [updatedPause] = await tx
        .select()
        .from(sessionPauses)
        .where(eq(sessionPauses.id, activePause.id));
      res.json(updatedPause);
    });
  } catch (error) {
    next(error);
  }
};

export const removeSessionProduct = async (req, res, next) => {
  try {
    const { sessionId, lineId } = req.params;

    await db.transaction(async (tx) => {
      const [session] = await tx.select().from(sessions).where(eq(sessions.id, Number(sessionId)));
      if (!session || session.sessionStatus !== "active") {
        throw new Error("Active session not found");
      }

      const [line] = await tx
        .select()
        .from(sessionProducts)
        .where(
          and(eq(sessionProducts.id, Number(lineId)), eq(sessionProducts.sessionId, session.id))
        );
      if (!line) return res.status(404).json({ message: "Line not found" });

      await tx.delete(sessionProducts).where(eq(sessionProducts.id, line.id));
      res.json({ message: "Product removed from session" });
    });
  } catch (error) {
    next(error);
  }
};

export const getDashboardSummary = async (req, res, next) => {
  try {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const [activeRow] = await db
      .select({ n: count() })
      .from(sessions)
      .where(eq(sessions.sessionStatus, "active"));
    const activePCs = Number(activeRow?.n ?? 0);

    const [todayCountRow] = await db
      .select({ n: count() })
      .from(sessions)
      .where(gte(sessions.createdAt, startOfToday));
    const todaysSessions = Number(todayCountRow?.n ?? 0);

    const completedToday = await db
      .select()
      .from(sessions)
      .where(
        and(eq(sessions.sessionStatus, "completed"), gte(sessions.createdAt, startOfToday))
      );

    const todaysEarnings = completedToday.reduce((a, s) => a + Number(s.paidAmount || 0), 0);

    const [sumRow] = await db
      .select({ s: sum(sessions.pendingAmount) })
      .from(sessions)
      .where(eq(sessions.sessionStatus, "completed"));
    const totalPendingAmount = sumRow?.s;

    res.json({
      activePCs,
      todaysSessions,
      todaysEarnings,
      totalPendingAmount: Number(totalPendingAmount ?? 0)
    });
  } catch (error) {
    next(error);
  }
};
