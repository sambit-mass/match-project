import * as seq from "sequelize";

export class Config {

    private dbName: string = '';
    private dbUserName: string = '';
    private dbUserPass: string = '';

    /**
     * @developer : Joyanta Sarkar
     * @date : 17-04-2024
     * @description : Pgsql connesction using sequelize
    */
    connectMySqlDB() {

        let connectionConfigObj: object = {
            host: process.env.DB_HOST,
            dialect: process.env.DB_DIALECT,
            timezone: process.env.DB_TIMEZONE,
            logging: process.env.NODE_ENV === 'production' ? false : console.log,
            define: {
                timestamps: false,
                freezeTableName: true
            },
            pool: {
                max: 5, // max 100 connections 
                min: 0,
                idle: 5000
            }
        };

        this.dbName = process.env.DB_NAME as string;
        this.dbUserName = process.env.DB_USERNAME as string;
        this.dbUserPass = process.env.DB_PASS as string;
        let conn = new seq.Sequelize(this.dbName, this.dbUserName, this.dbUserPass, connectionConfigObj);
        return conn
    }
    /*End*/
}
