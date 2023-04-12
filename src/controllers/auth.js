import User from "../models/user.js";
import bcrypt from "bcryptjs";
import { signupSchema,signinSchema } from "../schemas/auth.js";
import jwt from "jsonwebtoken"
import dotenv from"dotenv";

dotenv.config();

export const user = async (req, res) => {
  try {
    // const { data: products } = await axios.get(
    //   "http://localhost:3001/products"
    // );
    const users = await Users.find();
    if (users.length === 0) {
      res.send({
        messenger: "Danh sách sản phẩm trống",
      });
    }
    return res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ messenger: err });
  }
};


export const signup  = async(req,res)=>{
    try {
        const{name,email,password} = req.body;

        const{error} = signupSchema.validate(req.body,{abortEarly:false});

        if(error){
            const errors = error.details.map((err)=>err.message);
            return res.status(400).json({
                message:errors,
            });
        }

       // Check xem email đăng ký này đã tồn tại trong DB hay chưa?
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    // Dùng bcrypt để mã hoá
    const hashedPassword = await bcrypt.hash(password, 10);

    // Tạo user mới với password đã được mã hoá
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    user.password = undefined;
    return res.status(201).json({
      message: "User created successfully",
      user,
    });
    } catch (error) {
        return res.status(400).json({
            message: error,
          });
        }
    
    }


////////////////////
export const signin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const { error } = signinSchema.validate(
      { email, password },
      { abortEarly: false }
    );

    if (error) {
      const errors = error.details.map((err) => err.message);
      return res.status(400).json({
        message: errors,
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        message: "Tài khoản không tồn tại",
      });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        message: "Không đúng mật khẩu",
      });
    }
    const token = jwt.sign({ _id: user._id }, "123456", {
      expiresIn: "1d",
    });

    user.password = undefined;

    return res.status(200).json({
      message: "Đăng nhập thành công",
      accessToken: token,
      user,
    });
  } catch (error) {
    return res.status(400).json({
      message: error,
    });
  }
};