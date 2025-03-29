
import jwt from "jsonwebtoken";
import User from "../model/usermodel.js";
const jwtkey = "yogesh12345sGDSDSs"

export const verifytoken = async (req, res, next) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).json({ message: 'Token not found' });
        }
        const decoded = jwt.verify(token, jwtkey);
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(401).json({ message: 'User is not valid' });
        }

        req.user = user;
        next();

    } catch (error) {
        res.status(401).json({ message: 'Token is not valid' });
    }
}
export const isadmin = (...roles)=>{
   
    return(req, res, next)=>{
         if(!req.user.role.includes(roles)){
             return res.status(403).json({ message: `user with role ${req.user.role} is not authorized to acces` });
         }
         next();
    }

};
