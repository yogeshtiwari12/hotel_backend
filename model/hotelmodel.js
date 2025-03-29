import mongoose from "mongoose";

const hotelmodel = mongoose.Schema({

    hotelname:{
        type: String,
        required: true
    },
    location:{
        type: String,
        required: true
    },
    total_rooms:{
        type: Number,
        required: true
    },
    room_price:{
        type: Number,
        required: true
    },
    total_price: {
        type: Number,
        default: 0,  
    },
    
    hotel_image:{
        public_id:{

            type:String,
            required:true,
        },
        url:{
            type:String,
            required:true,
        }
    },

   

})
 
const Hotel = mongoose.model('Hotel', hotelmodel);
export default Hotel;