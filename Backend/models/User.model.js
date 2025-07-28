/**
 * @param {import('sequelize').Sequelize} sequelize
 * @param {import('sequelize').DataTypes} DataTypes
 */

module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('User', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        email: {
            type: DataTypes.STRING(255),
            allowNull: false,
            unique: true
        },
        password: {
            type: DataTypes.STRING(255),
        },
        name: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        created_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        },
        updated_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        },
        picture: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        googleId: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        authMethods: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        isEmailVerified: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        emailVerificationToken: {
            type: DataTypes.TEXT,
            allowNull: true
        }
    }, {
        tableName: 'users',
        timestamps: false
    });

    User.associate = (models) => {
        User.hasMany(models.File, {
            foreignKey: 'user_id',
            onDelete: 'CASCADE',
        });
        User.hasMany(models.Story, {
            foreignKey: 'user_id',
            onDelete: 'CASCADE',
        });
    };
    return User;
};

