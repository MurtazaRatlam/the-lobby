import { DataTypes } from "sequelize";

export default (sequelize) => {
  return sequelize.define(
    "SessionProduct",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      sessionId: { type: DataTypes.INTEGER, allowNull: false },
      productId: { type: DataTypes.INTEGER, allowNull: false },
      quantity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
      unitPrice: { type: DataTypes.DECIMAL(10, 2), allowNull: false }
    },
    { tableName: "session_products", timestamps: true }
  );
};
