import User from "../model/usermodel.js";
import cloudinary from 'cloudinary';
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken"
import Booking from "../model/bookings.js";
const jwtkey = "yogesh12345sGDSDSs"

export const signup = async (req, res) => {
  const { photo } = req.files;
  if (!req.files || !req.files.photo) {
    return res.status(400).json({ message: "No photo found" });
  }
  const allowedFormats = ["jpg", "png",'webp', ];
  const fileFormat = photo.name.split('.').pop();

  if (!allowedFormats.includes(fileFormat)) {
    return res.status(400).json({ message: "Invalid photo format" });
  }
  const { name, email, phone, password, role } = req.body;
  try {
    if (!name || !email || !phone || !password || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }
    if(password.length <7){
      return res.status(400).json({ message: "Password should be at least 8 characters long" });
    }
    const mobile_n = String(phone);
    if(mobile_n.length!=10 ){
      return res.status(400).json({ message: "phone number length should be 10" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    const uploadResponse = await cloudinary.v2.uploader.upload(photo.tempFilePath);
    const newUser = new User({
      name,
      email,
      phone,
      password: hashedPassword,
      role,
      photo: {
        public_id: uploadResponse.public_id,
        url: uploadResponse.secure_url
      }
    });
    await newUser.save();
    res.status(201).json({ message: "User registered successfully", });

  } catch (error) {
    return res.send("User registration failed : " + error.message)
  }
};




export const login = async (req, res) => {

  const { email, password } = req.body;

  try {
    if (password.length < 8) {
      return res.status(400).json({ message: "Password should be at least 8 characters long" });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User does not exist" });
    }
    
      if (user.role !== "admin"  && user.role !== "user") {
        console.log(user.role)
        return res.status(200).json({ message: `User with role ${role} is not found` });
      }
      
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    jwt.sign({ id: user._id }, jwtkey, { expiresIn: "2h" }, (error, token) => {
      if (error) {
        return res.json({ message: "token Error", error: error.message });
      }


      res.cookie('token', token,{
        secure: true, // Set to true since Render uses HTTPS
        sameSite: 'None', // Allows cross-site cookies with HTTPS
        httpOnly: true,
        secure: true, // Render uses HTTPS
        sameSite: 'None',

      })

      res.json({
        message: 'Logged in successfully',
        role:user.role
      })
    }
    )
    
  }
  catch (error) {
    return res.send("User login failed : " + error.message)
  }
}



export const logout = (req, res) => {
  const token = req.cookies.token;
  try {
    if (!token) {
      return res.json({ message: ' Token not found' });
    }
    res.clearCookie('token',{
      httpOnly:true,
      secure: true, // Render uses HTTPS
      sameSite: 'None',
    });
    res.json({ message: 'Logged out successfully' });

  } catch (error) {
    return res.status(500).json({ message: "Error logging out", error: error.message });
  }
}


export const getMyProfile = async (req, res) => {
  try {
    const user = req.user;
    const email = user.email;
    const bookingdetails = await Booking.find({ user_email: email });//Booking model me humne user_email pass kiya in place of email in usermodel to wo hotelname roomno total price bking model me 
    

   
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (!bookingdetails) {
      return res.status(404).json({ message: "User not found " });
    }
    const isuseravl = await Booking.find();

    const  userprofile = {
        name: user.name,
        email: user.email ,
        phone: user.phone,
        role: user.role,
        photo:user.photo,
        totalbookings:isuseravl.length,
        userid: user.id
      }

    const bookings = bookingdetails.map(booking => ({
      hotel_name: booking.user_hotel_name,
      user_room_no: booking.user_room_no,  
      total_price: booking.total_price,
      booking_date: booking.user_date,
      CheckIn: booking.CheckIn,
   
    }));

    res.json({ message: "User profile fetched successfully",
       user:userprofile, 
       bookings:bookings,
     
     });

  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


export const getallprofiles = async (req, res) => {
  try {
    const allusers = await User.find({$or:[{role:"user"},{role:"admin"}]}).select("-password");
    const totalusers = allusers.length;
 
    

    if (allusers.length === 0) {
      return res.status(404).json({ message: "No users found" });
    }

    
    res.json({ message: "All users fetched successfully", allusers,totalusers });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving user data", error: error.message });
  }
};




export const deleteuser = async (req, res) => {
  const userid = req.params.id;
  try{
    const deteuser = await User.findByIdAndDelete(userid);
    if(!deteuser){
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ message: "User deleted successfully","deleted user":deleteuser});
  }
  catch(error){
    res.status(500).json({ message: "Error deleting user", error: error.message });
    console.log("error deleting")
    
  }
}

export const updateuser = async (req, res) => {
  const userid = req.params.id;
  try{
    const updateuser = await User.findByIdAndUpdate(userid,req.body,{new:true});
    if(req.body.password){
      return res.status(200).json({ message: "You cant change the user password"})
    }
    if(!updateuser){
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ message: "User updated successfully","updated user":updateuser });
  } catch (error) {
    res.status(500).json({ message: "Error updating user", error: error.message });
    
  }
}

export const updatebookinguser = async (req, res) => {
  const booking_user_id = req.params.id;
  console.log(booking_user_id)
  try {
    
    const updateuser = await Booking.findByIdAndUpdate(booking_user_id,req.body,{new:true});
    if(!updateuser){
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ message: "User updated successfully","updated user":updateuser });
  } catch (error) {
    res.status(500).json({ message: "Error updating user", error: error.message });
    console.log("error updating")
    
  }
}

