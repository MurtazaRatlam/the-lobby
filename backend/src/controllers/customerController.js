import db from "../models/index.js";

const { Customer, Session } = db;

export const getCustomers = async (req, res, next) => {
  try {
    const customers = await Customer.findAll({
      include: [{ model: Session }],
      order: [["createdAt", "DESC"]]
    });

    const data = customers.map((c) => {
      const completedSessions = c.Sessions.filter((s) => s.sessionStatus === "completed");
      return {
        id: c.id,
        name: c.name,
        phone: c.phone,
        totalSessions: c.Sessions.length,
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
    const customer = await Customer.create({ name, phone });
    res.status(201).json(customer);
  } catch (error) {
    next(error);
  }
};

export const updateCustomer = async (req, res, next) => {
  try {
    const customer = await Customer.findByPk(req.params.id);
    if (!customer) return res.status(404).json({ message: "Customer not found" });

    const { name, phone } = req.body;
    await customer.update({ name, phone });
    res.json(customer);
  } catch (error) {
    next(error);
  }
};

export const deleteCustomer = async (req, res, next) => {
  try {
    const customer = await Customer.findByPk(req.params.id);
    if (!customer) return res.status(404).json({ message: "Customer not found" });
    await customer.destroy();
    res.json({ message: "Customer deleted" });
  } catch (error) {
    next(error);
  }
};
