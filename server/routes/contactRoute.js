import express from 'express';
import { addContact, listContact } from '../controllers/contactController.js';
import authSeller from '../middlewares/authSeller.js';

const contactRouter = express.Router();

contactRouter.post('/add', addContact);
contactRouter.get('/list', authSeller, listContact);

export default contactRouter;
