import { Config } from "./configuration/config"
import * as Sequelize from 'sequelize';

export class Model {
    public connectionObj = new Config();
    public Op: object;
    public Model: any;

    constructor(name: string, schema: {}, options: {}) {

        this.connectionObj.connectMySqlDB();
        this.Op = Sequelize.Op;
        this.Model = this.connectionObj.connectMySqlDB().define(name, schema, options);
    }
    /**
     * @developer : Aditi Pal
     * @date : 26-07-2023
     * @description : 
    */
    public findByAnyOne(dataobj: object): Promise<object> {
        return this.Model.findOne(dataobj);
    }

    /**
     * @developer : Aditi Pal
     * @date : 26-07-2023
     * @description : 
    */
    public countAllByAny(dataobj: object): Promise<number> {
        return this.Model.count(dataobj);
    }

    /**
     * @developer : Aditi Pal
     * @date : 26-07-2023
     * @description : 
    */
    public countAllByAnyNot(dataobj: any, field: string, value: string | number): number {
        dataobj[field] = {
            [Sequelize.Op.ne]: value
        };
        return this.Model.count({
            where: dataobj,
        });
    }

    /**
     * @developer : Aditi Pal
     * @date : 26-07-2023
     * @description : 
    */
    public updateAnyRecord(dataobj: object, whereobj = {}): Promise<object> {
        let that = this;
        return new Promise(function (resolve, reject) {
            that.Model.update(dataobj, whereobj)
                .then((saveData: []) => {
                    let returnData: [] = saveData;
                    return resolve(returnData);
                })
                .catch((error: any) => {
                    let returnData: object = {
                        status: 0,
                        data: error
                    };
                    return reject(returnData);
                });
        });
    }
    /**
     * @developer : Aditi Pal
     * @date : 26-07-2023
     * @description : 
    */
    public addNewRecord(dataobj: object): Promise<object> {
        return this.Model.build(dataobj).save();
    }

    /**
     * @developer : Aditi Pal
     * @date : 26-07-2023
     * @description : 
    */
    public deleteByAny(dataobj: object) {
        return this.Model.destroy({
            where: dataobj
        })
    }

    /**
     * @developer : Aditi Pal
     * @date : 26-07-2023
     * @description : Inserting bulk data into table
    */
    public bulkInsert(data_arr: {}[]) {
        return this.Model.bulkCreate(data_arr, { returning: true });
    }

    /**
     * @developer : Aditi Pal
     * @date : 26-07-2023
     * @description : 
    */
    public findAllByAny(dataobj: object) {
        return this.Model.findAll(dataobj);
    }

    /**
     * @developer : Anjali Show
     * @date : 20-11-2024
     * @description : Returns the data with count
    */
    public findAndCountAll(dataobj: object) {
        return this.Model.findAndCountAll(dataobj);
    }
}