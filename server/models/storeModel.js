import mongoose from "mongoose";

const storeSchema = new mongoose.Schema({
    address: { type: String, default: '' },
    phone: { type: String, default: '' },
    email: { type: String, default: '' }
});

const storeModel = mongoose.models.store || mongoose.model("store", storeSchema);

export default storeModel;