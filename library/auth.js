const bcrypt = require ("bcryptjs")
const hashing = async(value)=>{
    try {
        const salt = await bcrypt.genSalt(10)
        const hash = await bcrypt.hash(value,salt);
        return hash;
    } catch (error) {
       return error 
    }
}

const hashCompare = async(password,hashvalue)=>{
    try {
        return await bcrypt.compare(password,hashvalue)
    } catch (error) {
        return error
    }
}
module.exports = {hashing,hashCompare}