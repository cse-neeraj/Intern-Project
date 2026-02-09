import Address from "../models/Address.js";


// Add Address : /api/address/add

export const addAddress = async (req, res) => {
  try {
    await Address.create(req.body);
    res.json({ success: true, message: "Address added sucessfully" });
  } catch (error){
    console.log(error.message);
    res.json({ success: false, message: error.message });   
  }
}
// Get Address : /api/address/get
export const getAddress = async (req, res) => {
  try {
    const { userId } = req.body;
    const address = await Address.find({ userId });
    res.json({ success: true, address });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
}

// Update Address : /api/address/update
export const updateAddress = async (req, res) => {
  try {
    const { _id, ...data } = req.body;
    await Address.findByIdAndUpdate(_id, data);
    res.json({ success: true, message: "Address Updated Successfully" });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
}

// Delete Address : /api/address/delete
export const deleteAddress = async (req, res) => {
  try {
    const { _id } = req.body;
    await Address.findByIdAndDelete(_id);
    res.json({ success: true, message: "Address Deleted Successfully" });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
}