import storeModel from "../models/storeModel.js";

const getStoreInfo = async (req, res) => {
    try {
        let store = await storeModel.findOne({});
        if (!store) {
            store = await storeModel.create({});
        }
        res.json({ success: true, store });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

const updateStoreInfo = async (req, res) => {
    try {
        const { address, phone, email } = req.body;
        let store = await storeModel.findOne({});
        if (!store) {
            store = new storeModel({ address, phone, email });
        } else {
            store.address = address;
            store.phone = phone;
            store.email = email;
        }
        await store.save();
        res.json({ success: true, message: "Store info updated" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

export { getStoreInfo, updateStoreInfo }