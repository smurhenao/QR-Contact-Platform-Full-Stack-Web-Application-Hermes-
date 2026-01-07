import QrCode from "../models/QrCode.js";
import QRCodeLib from "qrcode";
import { nanoid } from "nanoid";

// 1. GENERAR: Crea el QR y lo guarda en la DB
export const generateQr = async (req, res) => {
  try {
    const { name, type, destinationUrl, userId } = req.body;
    const shortCode = nanoid(6); 
    const redirectUrl = `http://localhost:5000/api/qr/scan/${shortCode}`;

    // Generamos la imagen física
    const qrImage = await QRCodeLib.toDataURL(redirectUrl);

    const newQr = new QrCode({
      user: userId,
      name,
      type,
      destinationUrl,
      shortCode,
      qrImage // 👈 ¡AQUÍ se guarda en la DB!
    });

    await newQr.save();

    res.status(201).json({ msg: "QR Generado", qrImage, shortCode });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 2. ESCANEAR: La función que cuenta el clic y redirige
export const scanQr = async (req, res) => {
  try {
    const { shortCode } = req.params;

    // Buscamos el QR por su código corto
    const qr = await QrCode.findOne({ shortCode });

    if (!qr) {
      return res.status(404).send("Código QR no encontrado");
    }

    // Sumamos 1 al contador de escaneos
    qr.scanCount += 1;
    await qr.save();

    // Redirección al destino real
    res.redirect(qr.destinationUrl);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 3. LISTAR: Trae todos los QRs de un usuario específico
export const getUserQrs = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const qrs = await QrCode.find({ user: userId }).sort({ createdAt: -1 });
    
    res.status(200).json(qrs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 4. ELIMINAR: Borra un QR de la base de datos
export const deleteQr = async (req, res) => {
  try {
    const { id } = req.params;
    await QrCode.findByIdAndDelete(id);
    res.status(200).json({ msg: "QR eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};