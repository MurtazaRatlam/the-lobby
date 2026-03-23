import sequelize from "../config/database.js";
import CustomerModel from "./Customer.js";
import PCModel from "./PC.js";
import SessionModel from "./Session.js";
import ProductModel from "./Product.js";
import SessionProductModel from "./SessionProduct.js";
import SessionPauseModel from "./SessionPause.js";

const Customer = CustomerModel(sequelize);
const PC = PCModel(sequelize);
const Session = SessionModel(sequelize);
const Product = ProductModel(sequelize);
const SessionProduct = SessionProductModel(sequelize);
const SessionPause = SessionPauseModel(sequelize);

Customer.hasMany(Session, { foreignKey: "customerId" });
PC.hasMany(Session, { foreignKey: "pcId" });
Session.belongsTo(Customer, { foreignKey: "customerId" });
Session.belongsTo(PC, { foreignKey: "pcId" });

Session.hasMany(SessionProduct, { foreignKey: "sessionId", as: "sessionProducts" });
SessionProduct.belongsTo(Session, { foreignKey: "sessionId" });
Product.hasMany(SessionProduct, { foreignKey: "productId" });
SessionProduct.belongsTo(Product, { foreignKey: "productId" });
Session.hasMany(SessionPause, { foreignKey: "sessionId", as: "pauses" });
SessionPause.belongsTo(Session, { foreignKey: "sessionId" });

const db = { sequelize, Customer, PC, Session, Product, SessionProduct, SessionPause };
export default db;
