/**
 * @param {import('sequelize').Sequelize} sequelize
 * @param {import('sequelize').DataTypes} DataTypes
 */

module.exports = (sequelize, DataTypes) => {
    const File = sequelize.define('File', {
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
        file_size: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        file_type: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        duration: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        transcription: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        thumbnail_path: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        processing_status: {
            type: DataTypes.STRING(50),
            defaultValue: 'pending',
        },
        created_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
        tags: {
            type: DataTypes.JSON,
            allowNull: true,
        }
    }, {
        tableName: 'files',
        timestamps: false,
        underscored: true,
    });

    // Define association
    File.associate = (models) => {
        File.belongsTo(models.User, {
            foreignKey: 'user_id',
            onDelete: 'CASCADE',
        });
    };

    return File;
};
