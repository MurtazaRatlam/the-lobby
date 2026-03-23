import { Op } from "sequelize";
import { stringify } from "csv-stringify/sync";
import db from "../models/index.js";

const { Session, Customer, PC } = db;

const buildWhere = (from, to) => {
  const where = { sessionStatus: "completed" };
  if (from || to) {
    where.createdAt = {};
    if (from) where.createdAt[Op.gte] = new Date(from);
    if (to) where.createdAt[Op.lte] = new Date(to);
  }
  return where;
};

export const getReports = async (req, res, next) => {
  try {
    const { from, to } = req.query;
    const where = buildWhere(from, to);

    const sessions = await Session.findAll({
      where,
      include: [{ model: Customer }, { model: PC }],
      order: [["createdAt", "DESC"]]
    });

    const totals = sessions.reduce(
      (acc, s) => {
        acc.totalEarnings += Number(s.paidAmount || 0);
        acc.totalPayable += Number(s.payableAmount || 0);
        acc.totalPaid += Number(s.paidAmount || 0);
        acc.totalPending += Number(s.pendingAmount || 0);
        acc.totalHours += Number(s.totalHours || 0);
        return acc;
      },
      { totalEarnings: 0, totalPayable: 0, totalPaid: 0, totalPending: 0, totalHours: 0 }
    );

    const rows = sessions.map((s) => ({
      id: s.id,
      customerName: s.Customer?.name,
      pcNumber: s.PC?.id,
      loginTime: s.loginTime,
      logoutTime: s.logoutTime,
      totalHours: s.totalHours,
      payableAmount: s.payableAmount,
      paidAmount: s.paidAmount,
      pendingAmount: s.pendingAmount,
      isCustomLogout: s.isCustomLogout
    }));

    res.json({ totals, rows });
  } catch (error) {
    next(error);
  }
};

export const downloadReportCsv = async (req, res, next) => {
  try {
    const { from, to } = req.query;
    const where = buildWhere(from, to);

    const sessions = await Session.findAll({
      where,
      include: [{ model: Customer }, { model: PC }],
      order: [["createdAt", "DESC"]]
    });

    const csvRows = sessions.map((s) => ({
      customerName: s.Customer?.name || "",
      pcNumber: s.PC?.id || "",
      loginTime: s.loginTime?.toISOString?.() || "",
      logoutTime: s.logoutTime?.toISOString?.() || "",
      totalHours: s.totalHours || 0,
      payableAmount: s.payableAmount || 0,
      paidAmount: s.paidAmount || 0,
      pendingAmount: s.pendingAmount || 0,
      customLogout: s.isCustomLogout ? "Yes" : "No"
    }));

    const csv = stringify(csvRows, { header: true });
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=the-lobby-report.csv");
    res.send(csv);
  } catch (error) {
    next(error);
  }
};
