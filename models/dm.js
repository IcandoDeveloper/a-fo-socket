"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class DM extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {}
  }
  DM.init(
    {
      id: {
        primaryKey: true,
        type: DataTypes.STRING,
      },
      room: DataTypes.INTEGER,
      author: DataTypes.STRING,
      message: DataTypes.STRING,
      time: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "DM",
    }
  );
  return DM;
};
