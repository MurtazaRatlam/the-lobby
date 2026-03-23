import { DataTypes } from "sequelize";

export default (sequelize) => {
  return sequelize.define(
    "Product",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      name: { type: DataTypes.STRING, allowNull: false },
      price: { type: DataTypes.DECIMAL(10, 2), allowNull: false }
    },
    { tableName: "products", timestamps: true }
  );
};
