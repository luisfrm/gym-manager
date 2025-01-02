import authModel from "../models/auth.model";

class AuthController {
  static register = async (req, res) => {
    res.send('Register');
  };

  static login = async (req, res) => {
    try {
      const { email, password } = req.body;
      
    } catch (error) {
      
    }
  };
}

export default AuthController;