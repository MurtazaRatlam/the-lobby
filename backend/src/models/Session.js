import { DataTypes } from "sequelize";

export default (sequelize) => {
  return sequelize.define(
    "Session",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      customerId: { type: DataTypes.INTEGER, allowNull: false },
      pcId: { type: DataTypes.INTEGER, allowNull: false },
      loginTime: { type: DataTypes.DATE, allowNull: false },
      logoutTime: { type: DataTypes.DATE, allowNull: true },
      totalHours: { type: DataTypes.FLOAT, allowNull: true },
      payableAmount: { type: DataTypes.FLOAT, allowNull: true },
      paidAmount: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
      pendingAmount: { type: DataTypes.FLOAT, allowNull: true },
      isCustomLogout: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      sessionStatus: {
        type: DataTypes.ENUM("active", "completed"),
        allowNull: false,
        defaultValue: "active"
      }
    },
    { tableName: "sessions", timestamps: true }
  );
};
