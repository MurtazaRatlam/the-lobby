import { Op } from "sequelize";
import db from "../models/index.js";
import {
  calculatePausedMilliseconds,
  calculatePcPayableWithPaused
} from "../utils/sessionCalculator.js";

const { sequelize, Session, PC, Customer, SessionProduct, Product, SessionPause } = db;

export const startSession = async (req, res, next) => {
  const tx = await sequelize.transaction();
  try {
    const { pcId, customerId, customerName, customerPhone } = req.body;

    const pc = await PC.findByPk(pcId, { transaction: tx });
    if (!pc) throw new Error("PC not found");
    if (pc.status !== "available") throw new Error("PC is already in use");

    let finalCustomerId = customerId;
    if (!finalCustomerId) {
      const customer = await Customer.create(
        { name: customerName, phone: customerPhone },
        { transaction: tx }
      );
      finalCustomerId = customer.id;
    }

    const session = await Session.create(
      {
        customerId: finalCustomerId,
        pcId,
        loginTime: new Date(),
        paidAmount: 0,
        sessionStatus: "active"
      },
      { transaction: tx }
    );

    await pc.update({ status: "in_use" }, { transaction: tx });
    await tx.commit();
    res.status(201).json(session);
  } catch (error) {
    await tx.rollback();
    next(error);
  }
};

export const logoutSession = async (req, res, next) => {
  const tx = await sequelize.transaction();
  try {
    const { sessionId } = req.params;
    const { customLogoutTime, paidAmount } = req.body;

    const session = await Session.findByPk(sessionId, { transaction: tx });
    if (!session || session.sessionStatus !== "active") {
      throw new Error("Active session not found");
    }

    const logoutTime = customLogoutTime ? new Date(customLogoutTime) : new Date();
    const isCustomLogout = Boolean(customLogoutTime);

    const pauses = await SessionPause.findAll({
      where: { sessionId: session.id },
      transaction: tx
    });
    const pausedMs = calculatePausedMilliseconds(pauses, logoutTime);
    const { totalHours, pcPayable } = calculatePcPayableWithPaused(
      session.loginTime,
      logoutTime,
      pausedMs
    );

    const lines = await SessionProduct.findAll({
      where: { sessionId: session.id },
      transaction: tx
    });
    const productsTotal = lines.reduce(
      (sum, line) => sum + Number(line.quantity) * Number(line.unitPrice),
      0
    );
    const payableAmount = pcPayable + productsTotal;

    const hasPaidAmount = paidAmount !== undefined && paidAmount !== null && paidAmount !== "";
    const finalPaidAmount = hasPaidAmount ? Number(paidAmount) : payableAmount;
    const pendingAmount = Math.max(0, payableAmount - finalPaidAmount);

    await session.update(
      {
        logoutTime,
        totalHours,
        payableAmount,
        paidAmount: finalPaidAmount,
        pendingAmount,
        isCustomLogout,
        sessionStatus: "completed"
      },
      { transaction: tx }
    );

    const pc = await PC.findByPk(session.pcId, { transaction: tx });
    await pc.update({ status: "available" }, { transaction: tx });

    await tx.commit();
    res.json(session);
  } catch (error) {
    await tx.rollback();
    next(error);
  }
};

export const addSessionProduct = async (req, res, next) => {
  const tx = await sequelize.transaction();
  try {
    const { sessionId } = req.params;
    const { productId, quantity = 1 } = req.body;

    const session = await Session.findByPk(sessionId, { transaction: tx });
    if (!session || session.sessionStatus !== "active") {
      throw new Error("Active session not found");
    }

    const product = await Product.findByPk(productId, { transaction: tx });
    if (!product) throw new Error("Product not found");

    const qty = Math.max(1, Number(quantity) || 1);
    const unitPrice = Number(product.price);

    const existing = await SessionProduct.findOne({
      where: { sessionId: session.id, productId },
      transaction: tx
    });

    let lineId;
    if (existing) {
      await existing.increment("quantity", { by: qty, transaction: tx });
      lineId = existing.id;
    } else {
      const created = await SessionProduct.create(
        {
          sessionId: session.id,
          productId,
          quantity: qty,
          unitPrice
        },
        { transaction: tx }
      );
      lineId = created.id;
    }

    const withProduct = await SessionProduct.findByPk(lineId, {
      include: [{ model: Product }],
      transaction: tx
    });

    await tx.commit();
    res.status(201).json(withProduct);
  } catch (error) {
    await tx.rollback();
    next(error);
  }
};

export const pauseSession = async (req, res, next) => {
  const tx = await sequelize.transaction();
  try {
    const { sessionId } = req.params;
    const session = await Session.findByPk(sessionId, { transaction: tx });
    if (!session || session.sessionStatus !== "active") {
      throw new Error("Active session not found");
    }

    const activePause = await SessionPause.findOne({
      where: { sessionId: session.id, pauseEnd: null },
      transaction: tx
    });
    if (activePause) return res.status(400).json({ message: "Session is already paused" });

    const pause = await SessionPause.create(
      { sessionId: session.id, pauseStart: new Date() },
      { transaction: tx }
    );
    await tx.commit();
    res.status(201).json(pause);
  } catch (error) {
    await tx.rollback();
    next(error);
  }
};

export const resumeSession = async (req, res, next) => {
  const tx = await sequelize.transaction();
  try {
    const { sessionId } = req.params;
    const session = await Session.findByPk(sessionId, { transaction: tx });
    if (!session || session.sessionStatus !== "active") {
      throw new Error("Active session not found");
    }

    const activePause = await SessionPause.findOne({
      where: { sessionId: session.id, pauseEnd: null },
      transaction: tx
    });
    if (!activePause) return res.status(400).json({ message: "Session is not paused" });

    await activePause.update({ pauseEnd: new Date() }, { transaction: tx });
    await tx.commit();
    res.json(activePause);
  } catch (error) {
    await tx.rollback();
    next(error);
  }
};

export const removeSessionProduct = async (req, res, next) => {
  const tx = await sequelize.transaction();
  try {
    const { sessionId, lineId } = req.params;

    const session = await Session.findByPk(sessionId, { transaction: tx });
    if (!session || session.sessionStatus !== "active") {
      throw new Error("Active session not found");
    }

    const line = await SessionProduct.findOne({
      where: { id: lineId, sessionId: session.id },
      transaction: tx
    });
    if (!line) return res.status(404).json({ message: "Line not found" });

    await line.destroy({ transaction: tx });
    await tx.commit();
    res.json({ message: "Product removed from session" });
  } catch (error) {
    await tx.rollback();
    next(error);
  }
};

export const getDashboardSummary = async (req, res, next) => {
  try {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const activePCs = await Session.count({ where: { sessionStatus: "active" } });
    const todaysSessions = await Session.count({ where: { createdAt: { [Op.gte]: startOfToday } } });

    const completedToday = await Session.findAll({
      where: {
        sessionStatus: "completed",
        createdAt: { [Op.gte]: startOfToday }
      }
    });

    const todaysEarnings = completedToday.reduce((a, s) => a + Number(s.paidAmount || 0), 0);
    const totalPendingAmount = await Session.sum("pendingAmount", {
      where: { sessionStatus: "completed" }
    });

    res.json({
      activePCs,
      todaysSessions,
      todaysEarnings,
      totalPendingAmount: Number(totalPendingAmount || 0)
    });
  } catch (error) {
    next(error);
  }
};
