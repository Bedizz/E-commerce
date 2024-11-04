import jwt from "jsonwebtoken"
import { redis } from "../db/redis.js"

export const generateTokens = (userId) => {
    const accessToken = jwt.sign({userId}, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "15m"
    })
    const refreshToken = jwt.sign({userId}, process.env.REFRESH_TOKEN_SECRET,{
        expiresIn: "7d"
    })
    return {accessToken,refreshToken}
}

export const storeRefreshToken = async(userId,refreshToken) => {
    await redis.set(`refresh_token:${userId}`,refreshToken,"EX",7*24*60*60) // 7DAYS
}

export const setCookies = (res,accessToken,refreshToken) => {
    res.cookie("accessToken", accessToken, {
        httpOnly: true, // prevent XSS attacks ,cross site scripting attack
        secure: process.env.NODE_ENV === "production",
        sameSite:"strict", // prevents CSRF attack, cross-site request forgery          
        maxAge: 15 * 60 * 1000 // 15 mins
    })
    res.cookie("refreshToken", refreshToken, {
        httpOnly: true, // prevent XSS attacks ,cross site scripting attack
        secure: process.env.NODE_ENV === "production",
        sameSite:"strict", // prevents CSRF attack, cross-site request forgery          
        maxAge: 7 * 24 * 60 * 60 // 7 days
    })
}