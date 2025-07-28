/**
 * @param {import('sequelize').Sequelize} sequelize
 * @param {import('sequelize').DataTypes} DataTypes
 */
module.exports = (sequelize, DataTypes) => {
    const Story = sequelize.define('Story', {
        id: {
            type: DataTypes.STRING(100),
            primaryKey: true,
            allowNull: false,
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        title: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        prompt: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        uploadFile: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        video_path: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        status: {
            type: DataTypes.STRING(50),
            allowNull: true,
            defaultValue: 'pending',
        },
        created_at: {
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue: DataTypes.NOW,
        },
    }, {
        tableName: 'stories',
        timestamps: false,
    })
    Story.associate = (models) => {
        Story.belongsTo(models.User, {
            foreignKey: 'user_id',
            onDelete: 'CASCADE',
        });
    };
    return Story;
}
