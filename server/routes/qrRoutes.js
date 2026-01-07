import express from "express";
import { 
  generateQr, 
  scanQr, 
  getUserQrs, 
  deleteQr 
} from "../controllers/qrController.js";
import { verifyToken } from "../middleware/auth.js"; 

const router = express.Router();

// El escaneo es público para que cualquier celular pueda leerlo
router.get("/scan/:shortCode", scanQr);

// Estas rutas requieren que el usuario esté logueado (Token)
router.post("/generate", verifyToken, generateQr);
router.get("/user/:userId", verifyToken, getUserQrs); // Esta es la que fallaba
router.delete("/:id", verifyToken, deleteQr);

export default router;