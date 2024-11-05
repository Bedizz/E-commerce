import React from 'react'
import { motion } from 'framer-motion'

const GetAnalytics = () => {
  return (
<motion.div
          className="text-4x1 font-bold mb-8 text-emerald-400 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className='text-2xl font-semibold text-emerald-300'>Create a New Product</h2>
          
        </motion.div>
  )
}

export default GetAnalytics
