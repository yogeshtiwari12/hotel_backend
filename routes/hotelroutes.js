import express from 'express';
import { booksingleroom,  checkingetdata, deletebooking, deleteone, getallbookings, gethoteldata, hoteldetails,  roomdetails, roomdetails_related_to_hotel, savehotel, saveroomdetails, setroom, updatechekin, updatedetails } from '../methods/hotel.js';

import { isadmin,  verifytoken } from '../routes/auth.js';
const route = express.Router();

route.put('/savehotel',verifytoken,isadmin("admin"),savehotel);
route.delete('/deleteone/:id',verifytoken,isadmin("admin"),deleteone);
route.get('/gethoteldata',gethoteldata);
route.put('/saveroomdetails/:id',saveroomdetails);

route.post('/update/:id',verifytoken,isadmin("admin"),updatedetails);
route.delete('/deletebooking/:id',deletebooking);
route.delete('/deleteone/:id',verifytoken,isadmin("admin"),deleteone);
route.get('/checkindata',verifytoken,isadmin("admin"),checkingetdata);

route.post('/updatechekin/:id',verifytoken,isadmin("admin"),updatechekin); 


route.get('/roomdetails_related_to_hotel/:id',roomdetails_related_to_hotel);  
route.get('/hoteldetail',hoteldetails); 
route.get('/roomdata',roomdetails);
route.get('/getallbookings',verifytoken,getallbookings)
route.post("/setroom/:id",verifytoken,isadmin("admin"),setroom);

route.put('/booksingleroom/:id',verifytoken, booksingleroom);
export default route;           
    
