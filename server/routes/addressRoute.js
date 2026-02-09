import express from 'express'
import { addAddress, getAddress, updateAddress, deleteAddress } from '../controllers/addressController.js';
import authUser from '../middlewares/authUser.js';

const addressRouter = express.Router();

addressRouter.post('/add', authUser, addAddress);
addressRouter.get('/get', authUser, getAddress);
addressRouter.post('/update', authUser, updateAddress);
addressRouter.post('/delete', authUser, deleteAddress);

export default addressRouter;