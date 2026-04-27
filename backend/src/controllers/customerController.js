import { desc, eq } from "drizzle-orm";
import { customers, db, sessions } from "../db/index.js";

export const getCustomers = async (req, res, next) => {
  try {
    const rows = await db.query.customers.findMany({
      with: { sessions: true },
      orderBy: [desc(customers.createdAt)]
    });

    const data = rows.map((c) => {
      const completedSessions = c.sessions.filter((s) => s.sessionStatus === "completed");
      return {
        id: c.id,
        name: c.name,
        phone: c.phone,
        totalSessions: c.sessions.length,
        totalHoursPlayed: completedSessions.reduce((a, s) => a + Number(s.totalHours || 0), 0),
        totalPaid: completedSessions.reduce((a, s) => a + Number(s.paidAmount || 0), 0),
        totalPending: completedSessions.reduce((a, s) => a + Number(s.pendingAmount || 0), 0),
        createdAt: c.createdAt
      };
    });

    res.json(data);
  } catch (error) {
    next(error);
  }
};

export const createCustomer = async (req, res, next) => {
  try {
    const { name, phone } = req.body;
    const [customer] = await db.insert(customers).values({ name, phone }).returning();
    res.status(201).json(customer);
  } catch (error) {
    next(error);
  }
};

export const updateCustomer = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const [customer] = await db.select().from(customers).where(eq(customers.id, id));
    if (!customer) return res.status(404).json({ message: "Customer not found" });

    const { name, phone } = req.body;
    const [updated] = await db
      .update(customers)
      .set({ name, phone, updatedAt: new Date() })
      .where(eq(customers.id, id))
      .returning();
    res.json(updated);
  } catch (error) {
    next(error);
  }
};

export const deleteCustomer = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const [customer] = await db.select().from(customers).where(eq(customers.id, id));
    if (!customer) return res.status(404).json({ message: "Customer not found" });
    await db.delete(customers).where(eq(customers.id, id));
    res.json({ message: "Customer deleted" });
  } catch (error) {
    next(error);
  }
};
