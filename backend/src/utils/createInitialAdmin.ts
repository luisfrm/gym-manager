import { INITIAL_ADMIN_EMAIL, INITIAL_ADMIN_NAME, INITIAL_ADMIN_PASSWORD, INITIAL_ADMIN_USERNAME } from "../config";
import Auth from "../models/auth.model";
import bcrypt from "bcryptjs";

const createInitialAdmin = async () => {
  try {
    const email = INITIAL_ADMIN_EMAIL;
    const password = INITIAL_ADMIN_PASSWORD;
    const role = "admin";
    const username = INITIAL_ADMIN_USERNAME;
    const name = INITIAL_ADMIN_NAME;

    const userExists = await Auth.find();

    if (userExists.length > 0) {
      return console.log("User already exists");
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new Auth({
      email,
      password: hashedPassword,
      username,
      name,
      role: role,
    });

    await user.save();

    return console.log("User created successfully");
  } catch (error) {
    console.error(error);
    return console.log("Error creating user");
  }
};

export default createInitialAdmin;
