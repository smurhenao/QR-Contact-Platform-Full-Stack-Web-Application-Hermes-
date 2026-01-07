import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  const token = req.header("x-auth-token");
  if (!token) return res.status(401).json({ msg: "No hay token, permiso denegado" });

  try {
    const decoded = jwt.verify(token, "MI_FRASE_SECRETA_HERMES");
    req.user = decoded; // Guardamos el ID del usuario en la petición
    next();
  } catch (err) {
    res.status(401).json({ msg: "Token no válido" });
  }
};