import contactModel from "../models/contactModel.js";

const addContact = async (req, res) => {
    try {
        const { firstName, lastName, email, message } = req.body;
        
        const newContact = new contactModel({
            firstName, 
            lastName, 
            email, 
            message
        })

        await newContact.save();
        res.json({ success: true, message: "Message sent successfully" })

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })
    }
}

const listContact = async (req, res) => {
    try {
        const requests = await contactModel.find({}).sort({ createdAt: -1 });
        res.json({ success: true, requests })
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })
    }
}

export { addContact, listContact }