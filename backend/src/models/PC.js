import { DataTypes } from "sequelize";

export default (sequelize) => {
  return sequelize.define(
    "PC",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      room: { type: DataTypes.ENUM("left", "right"), allowNull: false },
      position: { type: DataTypes.STRING, allowNull: false },
      status: {
        type: DataTypes.ENUM("available", "in_use"),
        allowNull: false,
        defaultValue: "available"
      }
    },
    { tableName: "pcs", timestamps: true }
  );
};
