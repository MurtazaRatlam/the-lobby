import { DataTypes } from "sequelize";

export default (sequelize) => {
  return sequelize.define(
    "SessionPause",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      sessionId: { type: DataTypes.INTEGER, allowNull: false },
      pauseStart: { type: DataTypes.DATE, allowNull: false },
      pauseEnd: { type: DataTypes.DATE, allowNull: true }
    },
    { tableName: "session_pauses", timestamps: true }
  );
};
