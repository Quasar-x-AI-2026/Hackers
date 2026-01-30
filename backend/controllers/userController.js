import validator from "validator";
import bcrypt from "bcrypt";
import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";
import { v2 as cloudinary } from "cloudinary";
import appointmentModel from "../models/appointmentModel.js";
import doctorModel from "../models/doctorModel.js";
import Razorpay from "razorpay";

const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1d" });
};

const getRazorpayInstance = () => {
  try {
    console.log("🔍 [DEBUG] Creating Razorpay instance...");
    
    if (!process.env.RAZORPAY_KEY_ID) {
      throw new Error("RAZORPAY_KEY_ID is not set in environment variables");
    }
    
    if (!process.env.RAZORPAY_KEY_SECRET) {
      throw new Error("RAZORPAY_KEY_SECRET is not set in environment variables");
    }
    
    console.log("✅ [DEBUG] Razorpay credentials are available");
    
    return new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  } catch (error) {
    console.error("❌ [RAZORPAY INSTANCE ERROR]:", error.message);
    throw error;
  }
};

const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.json({ success: false, message: "Missing Details" });
    }

    if (!validator.isEmail(email)) {
      return res.json({ success: false, message: "Enter a valid email" });
    }

    if (password.length < 8) {
      return res.json({
        success: false,
        message: "Password must be at least 8 characters",
      });
    }

    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.json({ success: false, message: "Email already registered" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new userModel({
      name,
      email,
      password: hashedPassword,
      phone: "",
      address: { line1: "", line2: "" },
      gender: "",
      dob: "",
      image: "",
    });

    const user = await newUser.save();
    const token = createToken(user._id);

    res.json({
      success: true,
      token,
      userData: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        gender: user.gender,
        dob: user.dob,
        image: user.image,
      },
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await userModel.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "User does not exist" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.json({ success: false, message: "Invalid credentials" });
    }

    const token = createToken(user._id);

    res.json({
      success: true,
      token,
      userData: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        gender: user.gender,
        dob: user.dob,
        image: user.image,
      },
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await userModel.findById(req.userId).select("-password");
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }
    res.json({ success: true, userData: user });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, phone, address, dob, gender } = req.body;
    const imageFile = req.file;

    if (!name || !phone || !dob || !gender) {
      return res.json({ success: false, message: "Data Missing" });
    }

    let updateFields = { name, phone, dob, gender };

    if (address) {
      updateFields.address = JSON.parse(address);
    }

    if (imageFile) {
      const upload = await cloudinary.uploader.upload(imageFile.path, {
        resource_type: "image",
      });
      updateFields.image = upload.secure_url;
    }

    const updatedUser = await userModel
      .findByIdAndUpdate(req.userId, updateFields, { new: true })
      .select("-password");

    res.json({
      success: true,
      message: "Profile updated successfully",
      userData: updatedUser,
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

const bookAppointment = async (req, res) => {
  try {
    const { docId, slotDate, slotTime, amount, date } = req.body;

    if (!req.userId || !docId || !slotDate || !slotTime || !amount || !date) {
      return res
        .status(400)
        .json({ success: false, message: "Missing appointment details" });
    }

    const user = await userModel.findById(req.userId).select("-password");
    const doctor = await doctorModel.findById(docId);

    const newAppointment = new appointmentModel({
      userId: req.userId,
      docId,
      slotDate,
      slotTime,
      userData: user.toObject(),
      docData: doctor.toObject(),
      amount,
      date,
    });

    await newAppointment.save();

    res.json({
      success: true,
      message: "Appointment booked successfully",
      appointment: newAppointment,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const listAppointment = async (req, res) => {
  try {
    const appointments = await appointmentModel.find({ userId: req.userId });
    res.json({ success: true, appointments });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

const cancelAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.body;
    const appointmentData = await appointmentModel.findById(appointmentId);

    if (appointmentData.userId.toString() !== req.userId.toString()) {
      return res.json({ success: false, message: "Unauthorized action" });
    }

    await appointmentModel.findByIdAndUpdate(appointmentId, {
      cancelled: true,
    });

    const doctorData = await doctorModel.findById(appointmentData.docId);
    if (doctorData) {
      const slots_booked = doctorData.slots_booked || {};
      slots_booked[appointmentData.slotDate] =
        slots_booked[appointmentData.slotDate]?.filter(
          (e) => e !== appointmentData.slotTime
        ) || [];
      await doctorModel.findByIdAndUpdate(appointmentData.docId, {
        slots_booked,
      });
    }

    res.json({ success: true, message: "Appointment Cancelled" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

const paymentRazorpay = async (req, res) => {
  try {
    console.log("🔍 [DEBUG] Payment request received");
    console.log("🔍 [DEBUG] Request body:", req.body);
    console.log("🔍 [DEBUG] User ID:", req.userId);
    
    const { appointmentId } = req.body;
    
    // Check if appointmentId is provided
    if (!appointmentId) {
      console.log("❌ [ERROR] No appointmentId provided");
      return res.json({ 
        success: false, 
        message: "Appointment ID is required" 
      });
    }

    console.log("🔍 [DEBUG] Looking for appointment:", appointmentId);
    
    // Find the appointment
    const appointmentData = await appointmentModel.findById(appointmentId);
    
    // Check if appointment exists
    if (!appointmentData) {
      console.log("❌ [ERROR] Appointment not found in database");
      return res.json({ 
        success: false, 
        message: "Appointment not found" 
      });
    }

    console.log("✅ [DEBUG] Appointment found:", {
      id: appointmentData._id,
      userId: appointmentData.userId,
      amount: appointmentData.amount,
      cancelled: appointmentData.cancelled,
      payment: appointmentData.payment
    });

    // Check if appointment is cancelled
    if (appointmentData.cancelled) {
      console.log("❌ [ERROR] Appointment is cancelled");
      return res.json({ 
        success: false, 
        message: "Appointment is cancelled" 
      });
    }

    // Check if user owns this appointment
    if (appointmentData.userId.toString() !== req.userId.toString()) {
      console.log("❌ [ERROR] User mismatch");
      console.log("Appointment belongs to:", appointmentData.userId);
      console.log("Request user is:", req.userId);
      return res.json({ 
        success: false, 
        message: "Unauthorized access to appointment" 
      });
    }

    // Check if appointment already paid
    if (appointmentData.payment) {
      console.log("❌ [ERROR] Appointment already paid");
      return res.json({ 
        success: false, 
        message: "Appointment already paid" 
      });
    }

    // Check if amount is valid
    if (!appointmentData.amount || appointmentData.amount <= 0) {
      console.log("❌ [ERROR] Invalid amount:", appointmentData.amount);
      return res.json({ 
        success: false, 
        message: "Invalid appointment amount" 
      });
    }

    console.log("🔍 [DEBUG] Checking Razorpay environment variables...");
    console.log("RAZORPAY_KEY_ID:", process.env.RAZORPAY_KEY_ID ? "✓ Set" : "✗ Missing");
    console.log("RAZORPAY_KEY_SECRET:", process.env.RAZORPAY_KEY_SECRET ? "✓ Set" : "✗ Missing");
    console.log("CURRENCY:", process.env.CURRENCY || "INR (default)");

    // Create Razorpay instance
    console.log("🔍 [DEBUG] Creating Razorpay instance...");
    const razorpayInstance = getRazorpayInstance();
    
    // Create order options
    const options = {
      amount: appointmentData.amount * 100, // Convert to paise
      currency: process.env.CURRENCY || "INR",
      receipt: appointmentData._id.toString(),
    };

    console.log("🔍 [DEBUG] Creating Razorpay order with options:", options);
    
    // Create Razorpay order
    const order = await razorpayInstance.orders.create(options);
    
    console.log("✅ [SUCCESS] Razorpay order created!");
    console.log("Order ID:", order.id);
    console.log("Order amount:", order.amount);
    console.log("Order currency:", order.currency);
    
    res.json({ 
      success: true, 
      order: order 
    });
  } catch (error) {
    console.error("❌ [PAYMENT ERROR] Error name:", error.name);
    console.error("❌ [PAYMENT ERROR] Error message:", error.message);
    console.error("❌ [PAYMENT ERROR] Error stack:", error.stack);
    
    // Check for specific Razorpay errors
    if (error.error && error.error.description) {
      console.error("❌ [RAZORPAY API ERROR]:", error.error.description);
      return res.json({ 
        success: false, 
        message: `Razorpay error: ${error.error.description}` 
      });
    }
    
    res.json({ 
      success: false, 
      message: error.message || "Failed to create payment order" 
    });
  }
};

const verifyRazorpay = async (req, res) => {
  try {
    console.log("🔍 [DEBUG] Verifying payment...");
    console.log("🔍 [DEBUG] Request body:", req.body);
    
    const razorpayInstance = getRazorpayInstance();
    const orderInfo = await razorpayInstance.orders.fetch(
      req.body.razorpay_order_id
    );

    console.log("🔍 [DEBUG] Order info:", orderInfo);

    if (orderInfo.status === "paid") {
      await appointmentModel.findByIdAndUpdate(orderInfo.receipt, {
        payment: true,
      });
      console.log("✅ [SUCCESS] Payment verified and marked as paid");
      res.json({ success: true, message: "Payment Successful" });
    } else {
      console.log("❌ [ERROR] Order status is not 'paid':", orderInfo.status);
      res.json({ success: false, message: "Payment Failed" });
    }
  } catch (error) {
    console.error("❌ [VERIFY ERROR]:", error.message);
    res.json({ success: false, message: error.message });
  }
};

export {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
  bookAppointment,
  listAppointment,
  cancelAppointment,
  paymentRazorpay,
  verifyRazorpay,
};