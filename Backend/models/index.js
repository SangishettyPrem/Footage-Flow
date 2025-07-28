const Sequelize = require('sequelize');
const { sequelize } = require('../database/db');

const db = {};

const UserModel = require('./User.model')(sequelize, Sequelize.DataTypes);
const FilesModel = require('./Files.model')(sequelize, Sequelize.DataTypes);
const StoryModel = require('./Story.model')(sequelize, Sequelize.DataTypes);

db.File = FilesModel;
db.User = UserModel;
db.Story = StoryModel;

Object.keys(db).forEach(modelName => {
    if (db[modelName].associate) {
        db[modelName].associate(db);
    }
});

// Export
db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
