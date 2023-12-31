import { Request, Response } from "express";
import User from "../models/User";
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";
import { assertDefined } from "../utils/asserts";

export const register = async (req: Request, res: Response) => {
    const { username, password } = req.body;

    try {
        if (await User.findOne({userName: username})) {
            return res.status(400).json({ message: "Username taken" });
        }

        const user = new User({ userName: username, password })
        await user.save()

        res.status(201).json({ username, id: user._id });
    } catch (error) {
        console.log(error);
        res.status(500).send("Internal Server Error");
    }
}

export const logIn = async (req: Request, res: Response) => {
    try {
        // Ta in användarnamn och lösen
        const { username, password } = req.body;
        // Hitta en användare via username och hämta ut lösenordet
        const user = await User.findOne({userName: username}, '+password');

        // Kolla att vi har en användare och om lösenordet matchar det i databasen.
        if (!user || !await bcrypt.compare(password, user.password)) {
            return res.status(400).json({ message: 'Wrong username or password' });
        }
        
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            throw Error('Missing JWT_SECRET');
        }
        // Returnera JWT med 1h livstid
        const token = jwt.sign({ userId: user._id }, secret, { expiresIn: '1h'});
        
        // const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;
        // if (!refreshTokenSecret) {
        //     throw Error('Missing REFRESH_TOKEN_SECRET');
        // }
        // // Refresh token
        // const refreshToken = jwt.sign({ userId: user._id }, refreshTokenSecret, { expiresIn: '1d'});

        res.status(200).json({token, username: user.userName, userId: user._id})
    } catch (error) {
        console.log("Error in login", error);
        res.status(500).json({
            message: "Something blew up"
        })
    }
}

export const refreshJWT = async ( req: Request, res: Response) => {
  const { refreshToken } = req.body;
        
  const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;
  if (!refreshTokenSecret) {
      throw Error('Missing REFRESH_TOKEN_SECRET');
  }

  try {
    // Retunera refreshToken
    const decoded = await jwt.verify( refreshToken, refreshTokenSecret) as {userId: string}

    // hämta in secret och kolla om det är en sträng
    const secret = process.env.JWT_SECRET;
    assertDefined(secret)
    
    // Retunera JWT
    const token = jwt.sign({ userId : decoded.userId}, secret, {expiresIn: '1h'})

    return res.status(200).json({
        token
    })

 } catch(error) {

  console.log(error)
  return res.status(403).json({message: 'invalid token '})
  
 }
}

export const profile = async (req: Request, res: Response) => {
    const { userId } = req

    const user = await User.findById(userId);

    if (!user) {
        console.log("User not found with id: ", userId)
        return res.status(404).json({message: 'User not found'});
    }

    res.status(200).json({
        id: user._id,
        userName: user.userName
    })
}