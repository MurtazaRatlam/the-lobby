import { relations } from "drizzle-orm";
import {
  boolean,
  doublePrecision,
  integer,
  numeric,
  pgTable,
  serial,
  timestamp,
  varchar
} from "drizzle-orm/pg-core";

/** Column names and types align with the prior Sequelize `sync()` schema. */

export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 255 }).notNull().unique(),
  createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updatedAt", { mode: "date" }).notNull().defaultNow()
});

export const pcs = pgTable("pcs", {
  id: serial("id").primaryKey(),
  room: varchar("room", { length: 255 }).notNull(),
  position: varchar("position", { length: 255 }).notNull(),
  status: varchar("status", { length: 255 }).notNull().default("available"),
  createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updatedAt", { mode: "date" }).notNull().defaultNow()
});

export const sessions = pgTable("sessions", {
  id: serial("id").primaryKey(),
  customerId: integer("customerId").notNull(),
  pcId: integer("pcId").notNull(),
  loginTime: timestamp("loginTime", { mode: "date" }).notNull(),
  logoutTime: timestamp("logoutTime", { mode: "date" }),
  totalHours: doublePrecision("totalHours"),
  payableAmount: doublePrecision("payableAmount"),
  paidAmount: doublePrecision("paidAmount").notNull().default(0),
  pendingAmount: doublePrecision("pendingAmount"),
  isCustomLogout: boolean("isCustomLogout").notNull().default(false),
  sessionStatus: varchar("sessionStatus", { length: 255 }).notNull().default("active"),
  createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updatedAt", { mode: "date" }).notNull().defaultNow()
});

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updatedAt", { mode: "date" }).notNull().defaultNow()
});

export const sessionProducts = pgTable("session_products", {
  id: serial("id").primaryKey(),
  sessionId: integer("sessionId").notNull(),
  productId: integer("productId").notNull(),
  quantity: integer("quantity").notNull().default(1),
  unitPrice: numeric("unitPrice", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updatedAt", { mode: "date" }).notNull().defaultNow()
});

export const sessionPauses = pgTable("session_pauses", {
  id: serial("id").primaryKey(),
  sessionId: integer("sessionId").notNull(),
  pauseStart: timestamp("pauseStart", { mode: "date" }).notNull(),
  pauseEnd: timestamp("pauseEnd", { mode: "date" }),
  createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updatedAt", { mode: "date" }).notNull().defaultNow()
});

export const customersRelations = relations(customers, ({ many }) => ({
  sessions: many(sessions)
}));

export const pcsRelations = relations(pcs, ({ many }) => ({
  sessions: many(sessions)
}));

export const sessionsRelations = relations(sessions, ({ one, many }) => ({
  customer: one(customers, {
    fields: [sessions.customerId],
    references: [customers.id]
  }),
  pc: one(pcs, {
    fields: [sessions.pcId],
    references: [pcs.id]
  }),
  sessionProducts: many(sessionProducts),
  pauses: many(sessionPauses)
}));

export const productsRelations = relations(products, ({ many }) => ({
  sessionProducts: many(sessionProducts)
}));

export const sessionProductsRelations = relations(sessionProducts, ({ one }) => ({
  session: one(sessions, {
    fields: [sessionProducts.sessionId],
    references: [sessions.id]
  }),
  product: one(products, {
    fields: [sessionProducts.productId],
    references: [products.id]
  })
}));

export const sessionPausesRelations = relations(sessionPauses, ({ one }) => ({
  session: one(sessions, {
    fields: [sessionPauses.sessionId],
    references: [sessions.id]
  })
}));
