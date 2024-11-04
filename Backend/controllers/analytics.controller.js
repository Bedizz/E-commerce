import User from "../models/user.model"
import Product from "../models/product.model"
import Order from "../models/order.model"

export const getAnalytics = async (req,res) => {
    try {
        const analyticsData = await getAnalyticsData()

        const endDate = new Date()
        const startDate = new Date(endDate).getTime() - 7 * 24 * 60 * 60 * 1000 // 7 days ago

        const dailySalesData = await getDailySalesData(startDate,endDate)
        res.status(200).json({ analyticsData, dailySalesData })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

export const getAnalyticsData = async () => {
    try {
        const totalUsers = await User.countDocuments() // Get the total number of users
        const totalProducts = await Product.countDocuments() // Get the total number of products

        // Get the total sales data from the orders collection in the database
        const salesData = await Order.aggregate([
            {
                $group: {
                    _id: null,
                    totalSales: { $sum: 1 },
                    totalRevenue: { $sum: "$totalAmount" }
                }
            }
        ])
        const {totalSales,totalRevenue} = salesData[0] || {totalSales:0,totalRevenue:0}

        return {
            users:totalUsers,
            products:totalProducts,
            totalSales,
            totalRevenue
        }
        
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

export const getDailySalesData = async (startDate,endDate) => {
    try {
        const dailySalesData = await Order.aggregate([
            {
                $match: {
                    createdAt: {
                        $gte: startDate,
                        $lt: endDate
                    }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    totalSales: { $sum: 1 },
                    totalRevenue: { $sum: "$totalAmount" }
                }
            },
            {
                $sort: { _id: 1 }
            }
        ]) 
        const dateArray = getDatesInRange(startDate,endDate)
        return dateArray.map(date => {
            const data = dailySalesData.find(d => d._id === date)
            return {
                date,
                sales: data?.sales || 0,
                revenue: data.revenue || 0
            } 
        
        
        })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

export const getDatesInRange = (startDate,endDate) => {
    const dates = []
    let currentDate = new Date(startDate)

    while(currentDate <= endDate) {
        dates.push(currentDate.toISOString().split("T")[0])
        currentDate.setDate(currentDate.getDate() + 1)
    }
    return dates
}

