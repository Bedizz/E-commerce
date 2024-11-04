import Coupon from "../models/coupon.model.js";
export const getCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findOne({
      userId: req.user._id,
      isActive: true,
    });
    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found" });
    }
    res.status(200).json(coupon);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const validateCoupon = async ( req, res) => {
    const {code} = req.body;
    try {
        const coupon = await Coupon.findOne({code:code, userId:req.user._id, isActive:true})
        if(!coupon){
            return res.status(404).json({message:"Coupon not found"})
        }
        if(coupon.expirationDate < Date.now()){
            coupon.isActive = false;
            await coupon.save()
            return res.status(400).json({message:"Coupon expired"})
        }
        res.status(200).json({message: "Coupon is valid",code: coupon.code,
            discountPercentage: coupon.discountPercentage,
            expirationDate: coupon.expirationDate
        })
        
    } catch (error) {
        res.status(500).json({message:error.message})
    }
}