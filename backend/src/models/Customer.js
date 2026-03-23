import { DataTypes } from "sequelize";

export default (sequelize) => {
  return sequelize.define(
    "Customer",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      name: { type: DataTypes.STRING, allowNull: false },
      phone: { type: DataTypes.STRING, allowNull: false, unique: true }
    },
    { tableName: "customers", timestamps: true }
  );
};
