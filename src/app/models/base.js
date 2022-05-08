const db = require('../../config/db');

function find(filters, table) {
    console.log('aqui', filters, table)
    let query = `SELECT * FROM ${table}`

    if(filters) {
        Object.keys(filters).map(key => {
            //WHERE | OR | AND
            query += ` ${key} `

            Object.keys(filters[key]).map(field => {
                query += `${field} = '${filters[key][field]}'`
            })
        })
    }

        console.log(query)
    return db.query(query)
}

const Base = {
    init({table}) {
        if (!table) throw new Error("Invalid params")

        this.table = table;
        return this
    },
    async find(id) { 
        const results = await find({where: {id}}, this.table)

        return results.rows[0]
    },
    async findOne(filters) { 
        const results = await find(filters, this.table)

        return results.rows[0]
    },
    async findAll(filters) { 
        const results = await find(filters, this.table)

        return results.rows
    },
    async create(fields) {
        //User.create({ name: 'Mayk',... })

        try {
            let keys = [],
                values = []

            Object.keys(fields).map((key) => {
                //name, age, address
                //values

                keys.push(key)
                values.push(`'${fields[key]}'`)               
                
            })

            const query = `INSERT INTO ${this.table}
                    (${keys.join(',')})
                    VALUES (${values.join(',')})
                    RETURNING id
                `
            const results = await db.query(query)
            return results.rows[0].id 

        } catch (error) {
            console.log('erroB1', error)
        }
    },
    update(id, fields) {
       let update = []
       
       try {
        Object.keys(fields).map((key) => {
            const line = `${key} = '${fields[key]}'` //name = ($1)
            update.push(line)
        })   
        
        let query = `UPDATE ${this.table} SET
            ${update.join(',')} WHERE id = ${id}
        `
        return db.query(query)
        
       } catch (error) {
           console.log('erroB2',error)
       }

        
    },
    delete(id) {
        return db.query(`DELETE FROM ${this.table} WHERE id = $1`, [id])
    }
}

module.exports = Base