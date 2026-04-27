import { and, desc, eq, gte, inArray, lte } from "drizzle-orm";
import { customers, db, pcs, sessions } from "../db/index.js";
import { stringify } from "csv-stringify/sync";

const buildConditions = (from, to) => {
  const parts = [eq(sessions.sessionStatus, "completed")];
  if (from) parts.push(gte(sessions.createdAt, new Date(from)));
  if (to) parts.push(lte(sessions.createdAt, new Date(to)));
  return parts.length === 1 ? parts[0] : and(...parts);
};

export const getReports = async (req, res, next) => {
  try {
    const { from, to } = req.query;
    const where = buildConditions(from, to);

    const sessionRows = await db
      .select()
      .from(sessions)
      .where(where)
      .orderBy(desc(sessions.createdAt));

    const customerIds = [...new Set(sessionRows.map((s) => s.customerId))];
    const pcIds = [...new Set(sessionRows.map((s) => s.pcId))];

    const custRows =
      customerIds.length > 0
        ? await db.select().from(customers).where(inArray(customers.id, customerIds))
        : [];
    const pcRows =
      pcIds.length > 0 ? await db.select().from(pcs).where(inArray(pcs.id, pcIds)) : [];

    const custById = Object.fromEntries(custRows.map((c) => [c.id, c]));
    const pcById = Object.fromEntries(pcRows.map((p) => [p.id, p]));

    const totals = sessionRows.reduce(
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

    const rows = sessionRows.map((s) => {
      const Customer = custById[s.customerId];
      const PC = pcById[s.pcId];
      return {
        id: s.id,
        customerName: Customer?.name,
        pcNumber: PC?.id,
        loginTime: s.loginTime,
        logoutTime: s.logoutTime,
        totalHours: s.totalHours,
        payableAmount: s.payableAmount,
        paidAmount: s.paidAmount,
        pendingAmount: s.pendingAmount,
        isCustomLogout: s.isCustomLogout
      };
    });

    res.json({ totals, rows });
  } catch (error) {
    next(error);
  }
};

export const downloadReportCsv = async (req, res, next) => {
  try {
    const { from, to } = req.query;
    const where = buildConditions(from, to);

    const sessionRows = await db
      .select()
      .from(sessions)
      .where(where)
      .orderBy(desc(sessions.createdAt));

    const customerIds = [...new Set(sessionRows.map((s) => s.customerId))];
    const pcIds = [...new Set(sessionRows.map((s) => s.pcId))];

    const custRows =
      customerIds.length > 0
        ? await db.select().from(customers).where(inArray(customers.id, customerIds))
        : [];
    const pcRows =
      pcIds.length > 0 ? await db.select().from(pcs).where(inArray(pcs.id, pcIds)) : [];

    const custById = Object.fromEntries(custRows.map((c) => [c.id, c]));
    const pcById = Object.fromEntries(pcRows.map((p) => [p.id, p]));

    const csvRows = sessionRows.map((s) => {
      const Customer = custById[s.customerId];
      const PC = pcById[s.pcId];
      return {
        customerName: Customer?.name || "",
        pcNumber: PC?.id || "",
        loginTime: s.loginTime?.toISOString?.() || "",
        logoutTime: s.logoutTime?.toISOString?.() || "",
        totalHours: s.totalHours || 0,
        payableAmount: s.payableAmount || 0,
        paidAmount: s.paidAmount || 0,
        pendingAmount: s.pendingAmount || 0,
        customLogout: s.isCustomLogout ? "Yes" : "No"
      };
    });

    const csv = stringify(csvRows, { header: true });
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=the-lobby-report.csv");
    res.send(csv);
  } catch (error) {
    next(error);
  }
};
