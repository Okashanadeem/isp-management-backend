import express from "express";
import {
  createCustomer,
  updateCustomer,
  suspendService,       
} from "../controllers/customerController.js";
import { validateCustomer } from "../validators/customerValidator.js";
import validate from "../middlewares/validateMiddleware.js";
import upload from "../middlewares/uploadMiddleware.js";   
const router = express.Router();


router.post(
  "/", 
  upload.array("documents", 5),          
  validate(validateCustomer), 
  createCustomer
);

router.put(
  "/:id",
  upload.array("documents", 5),          
  validate(validateCustomer),
  updateCustomer
);

router.post("/:id/suspend", suspendService);


export default router;
