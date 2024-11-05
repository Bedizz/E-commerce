
import { redis } from "../db/redis.js";
import User from "../models/user.model.js"
import {generateTokens, setCookies, storeRefreshToken} from "../utils/tokens.js"
import jwt from "jsonwebtoken"





export const signUp =async (req,res) => {
    const {name,email,password } = req.body;
    try {
    const userExists = await User.findOne({email})
    if(userExists) {
        return res.status(400).json({message: "User already exists"})
    }
        const user = await User.create({name,email,password})
        
        //authenticate -------------------------------------
        const {accessToken,refreshToken} = generateTokens(user._id)
        await storeRefreshToken(user._id,refreshToken)
        setCookies(res,accessToken,refreshToken)
        //------------------------------------------------------------

        res.status(201).json({ user:{
            _id: user._id,
            name:user.name,
            email:user.email,
            role:user.role
        },message:"User created successfully"})
    } catch (error) {
        res.status(500).json({message: "User could not be created"})
        
    }
}

export const login =async (req,res) => {
    try {
        const {email,password} = req.body
        const user = await User.findOne({email})
        if(user && (await user.comparePassword(password))) {
            const {accessToken,refreshToken} = generateTokens(user._id)
            await storeRefreshToken(user._id,refreshToken)
            setCookies(res,accessToken,refreshToken)
            res.status(200).json({ user:{
                _id: user._id,
                name:user.name,
                email:user.email,
                role:user.role
            },message:"User logged in successfully"})
        } else {
            res.status(500).json({message:"Invalid password or email"})
        }
        
    } catch (error) {
        res.status(500).json({error:error.message})
    }
    
}

export const logout =async (req,res) => {
    
    try {
        
        const refreshToken = req.cookies.refreshToken
        if(refreshToken) {
            const decoded = jwt.verify(refreshToken,process.env.REFRESH_TOKEN_SECRET)
            await redis.del(`refresh_token:${decoded.userId}`)
        }
        res.clearCookie("accessToken");
        res.clearCookie("refreshToken");
        res.status(200).json({message:"Logged out successfully"})
    } catch (error) {
        res.status(500).json({message:error.message})
    }
    
}

export const refreshToken = async (req,res) => {
    try {
        const refreshToken = req.cookies.refreshToken
        if(!refreshToken) {
            return res.status(401).json({ message: "No refresh token provided"})
        }
        const decoded = jwt.verify(refreshToken,process.env.REFRESH_TOKEN_SECRET)
        const storedToken = await redis.get(`refresh_token:${decoded.userId}`)
        if(storedToken !== refreshToken) {
            res.status(401).json({message:"Invalid refresh token"})
        }
        const accessToken = jwt.sign({ userId: decoded.userId}, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "15m"})

        res.cookie("accessToken", accessToken), {
            httpOnly: true, // prevent XSS attacks ,cross site scripting attack
            secure: process.env.NODE_ENV === "production",
            sameSite:"strict", // prevents CSRF attack, cross-site request forgery          
            maxAge: 7 * 24 * 60 * 60 // 7 days
        }
        res.status(200).json({ message: "token is refreshed"})
    } catch (error) {
        res.status(500).json({message: error.message})
    }
}

export const getProfile = async (req,res) => {
    // const {id}  = req.params 
    // try {
    //     const user = await User.findById(id).select("-password")
    //     if(!user) {
    //         return res.status(404).json({message:"User not found"})
    //     }
    try {
        res.status(200).json(req.user)        
    } catch (error) {
        res.status(500).json({message: error.message})
    }
}