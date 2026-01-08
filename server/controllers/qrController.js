import QrCode from "../models/QrCode.js";
import QRCodeLib from "qrcode";
import { nanoid } from "nanoid";

// 1. GENERAR: Crea el QR con colores y lo guarda
export const generateQr = async (req, res) => {
  try {
    // Aseguramos que recibimos todas las variables necesarias
    const { name, type, destinationUrl, userId, color, bgColor, logoUrl } = req.body;
    
    if (!destinationUrl || !userId) {
      return res.status(400).json({ error: "Faltan datos obligatorios" });
    }

    const shortCode = nanoid(6); 
    const redirectUrl = `http://localhost:5000/api/qr/scan/${shortCode}`;

    // Generamos la imagen física con los colores elegidos
    const qrImage = await QRCodeLib.toDataURL(redirectUrl, {
      color: {
        dark: color || "#000000",   
        light: bgColor || "#ffffff" 
      },
      margin: 1,
      errorCorrectionLevel: 'H'
    });

    const newQr = new QrCode({
      user: userId,
      name: name || "Sin nombre",
      type: type || "custom",
      destinationUrl,
      shortCode,
      qrImage,
      color: color || "#000000",
      bgColor: bgColor || "#ffffff",
      logoUrl: logoUrl || ""
    });

    await newQr.save();
    res.status(201).json(newQr);
  } catch (error) {
    console.error("Error en generateQr:", error);
    res.status(500).json({ error: error.message });
  }
};

// 2. ESCANEAR: Redirección y contador
export const scanQr = async (req, res) => {
  try {
    const { shortCode } = req.params;
    const qr = await QrCode.findOne({ shortCode });
    if (!qr) return res.status(404).send("Código QR no encontrado");

    qr.scanCount += 1;
    await qr.save();
    res.redirect(qr.destinationUrl);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 3. LISTAR: Trae los QRs de un usuario
export const getUserQrs = async (req, res) => {
  try {
    const { userId } = req.params;
    const qrs = await QrCode.find({ user: userId }).sort({ createdAt: -1 });
    res.status(200).json(qrs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 4. ELIMINAR
export const deleteQr = async (req, res) => {
  try {
    const { id } = req.params;
    await QrCode.findByIdAndDelete(id);
    res.status(200).json({ msg: "QR eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 5. ACTUALIZAR: Cambiar nombre o destino del QR
export const updateQr = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, destinationUrl, color } = req.body;

    const updatedQr = await QrCode.findByIdAndUpdate(
      id,
      { name, destinationUrl, color },
      { new: true } // Esto devuelve el objeto ya actualizado
    );

    if (!updatedQr) return res.status(404).json({ msg: "QR no encontrado" });
    
    res.status(200).json(updatedQr);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};