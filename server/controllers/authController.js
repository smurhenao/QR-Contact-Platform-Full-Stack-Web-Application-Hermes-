import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // 1. Verificamos si ya existe
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ msg: "El usuario ya existe" });

    // 2. Encriptamos la clave
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Guardamos
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ msg: "Usuario creado con éxito" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "Usuario no encontrado" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Contraseña incorrecta" });

    // 4. Creamos el Token (Llave maestra)
    // Usa una frase secreta en lugar de 'SECRET_KEY'
    const token = jwt.sign({ id: user._id }, "MI_FRASE_SECRETA_HERMES", { expiresIn: "1d" });

    res.json({ 
      token, 
      user: { id: user._id, name: user.name, email: user.email } 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};