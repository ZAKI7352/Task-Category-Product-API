let express = require('express')
let app = express()
let joi = require('joi')
let { Sequelize, Model, DataTypes, QueryTypes, Op } = require('sequelize')
let sequelizeCon = new Sequelize('mysql://root@localhost/task-product')

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

sequelizeCon.authenticate().then(() => {
    console.log("Connected")
}).catch((error) => {
    console.log("Not connected", error)
})
// sequelizeCon.sync({alert:true})

//Category schema
class Category extends Model {}
Category.init({
    id: {
        type : DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    cname:{
        type : DataTypes.STRING,
        allowNull: false
    },
    description:{
        type : DataTypes.STRING(500),
        allowNull: false
    }
},{tableName:'category', modelName: 'Category', sequelize:sequelizeCon})



//Product schema
class Product extends Model{}
Product.init({
    id : {
        type: DataTypes.INTEGER,
        primaryKey:true,
        allowNull:false,
        autoIncrement:true
    },
    name:{
        type: DataTypes.STRING,
        allowNull:false
    },
    price:{
        type: DataTypes.INTEGER,
        allowNull:false
    },
    description:{
        type: DataTypes.STRING(500),
        allowNull:false
    },
    slug:{
        type: DataTypes.STRING
    },
    CategoryID: {
        type: DataTypes.INTEGER,
        allowNull:false
    },
},{tableName:'product', modelName:'Product', sequelize:sequelizeCon})

//Category Joi Validation
async function checkCategory(data){
    let schema = joi.object({
        cname: joi.string().required(),
        description: joi.string().required()
    })
    let valid = await schema.validateAsync(data,{abortEarly:false})
    .catch((error)=>{
        return{error}
    });
    if(!valid || (valid && valid.error)){
        let msg =[]
        for (let i of valid.error.details){
            msg.push(i.message)
        }
        return {error : msg}
    }
    return {data:valid.data}

}


//create Category
app.post('/category/add', async (req,res)=>{
    let valid = await checkCategory(req.body)
    .catch((error)=>{
        return {error}
    })
    if(!valid || (valid && valid.error)){
        return res.send({error: valid.error})
    }
    let find = await Category.findOne({where:{cname:req.body.cname}})
    .catch ((error)=>{
        return {error}
    })
    if (find || (find && find.error)){
        return res.send({error:'Category already exist'})
    }
    let data = await Category.create(req.body)
    .catch ((error)=>{
        return{error}
    })
    if (!data || (data && data.error )){
        return res.send ({ error:'Faild to create Category'})
    }
    return res.send (data)
})



app.listen(3011, () => {
    console.log('DataBase Connected');
})