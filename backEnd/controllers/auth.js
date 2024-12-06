import { db } from "../db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
//Router register:
export const register = (req, res) => {
  //Check existing user
  const q = "SELECT * FROM users WHERE email = ? OR username = ?"; //query
  db.query(q, [req.body.email, req.body.username], (err, data) => {
    //sending query and values
    if (err) return res.json(err);
    if (data.length) return res.status(409).json("User already exists!"); //user already exists

    //Hash the password and create a user  :using bcrypt.js
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(req.body.password, salt);

    //Insertion of values
    const q = "INSERT INTO users (`username`,`email`,`password`) VALUES(?)";
    const values = [req.body.username, req.body.email, hash];

    //sending of values into database
    db.query(q, [values], (err, data) => {
      if (err) return res.json(err);
      return res.status(200).json(" User has been created successfully!!");
    });
  });
};

export const login = (req, res) => {
  //Check USER

  const q = "SELECT * FROM users WHERE username = ? OR password = ?";
  db.query(q, [req.body.username, req.body.password], (err, data) => {
    if (err) return res.json(err);
    if (data.length === 0)
      return res.status(401).json("No User exist with those credentials");

    //Checking for password
    const isPasswordCorrect = bcrypt.compareSync(
      req.body.password,
      data[0].password //array of data so we use 0 and . operator
    );
    if (!isPasswordCorrect) {
      return res.status(400).json("Invalid credentials");
    }

    //JWT
    const token = jwt.sign({ id: data[0].id }, "jwtkey");
    //we dont want to send our password in cookie so:
    const { password, ...other } = data[0];

    //cookie response sending
    res
      .cookie("access_token", token, { httpOnly: true })
      .status(200)
      .json(other);
  });
};
export const logout = (req, res) => {};
