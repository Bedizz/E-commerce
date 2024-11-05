import React, { useState } from 'react'
import { motion } from 'framer-motion'
import  {BarChart, PlusCircle, ShoppingBasket}  from 'lucide-react'
import CreateProductForm from '../components/CreateProductForm';
import GetProducts from '../components/GetProducts';
import GetAnalytics from '../components/GetAnalytics';


const tabs = [
    { id: "create", label: "Create Product", icon: PlusCircle },
    { id: "products", label: "Products", icon: ShoppingBasket },
    { id: "analytics", label: "Analytics", icon: BarChart },
    ];

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState("create");
    console.log(activeTab)
  return (
    <div className="bg-gray-900 min-h-screen text-white relative overflow-hidden">
      <div className="mx-auto z-10 relative px-4 py-16">
        <motion.h1
          className="text-4x1 font-bold mb-8 text-emerald-400 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Admin Dashboard
        </motion.h1>
        <div className='flex justify-center mb-8'>
            {tabs.map((tab) => (
                <button
                key={tab.id}
                onClick={()=> setActiveTab(tab.id)}
                className={`flex items-center px-4 py-2 mx-2 rounded-md transition-colors duration-200 ${activeTab === tab.id ? "bg-emerald-600 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"}`}>
                    {tab.label}
                </button>
            ))}
        </div>
        {activeTab === "create" && <CreateProductForm/>}
        {activeTab === "products" && <GetProducts/>}
        {activeTab === "analytics" && <GetAnalytics/>}
      </div>
    </div>
  );
};

export default AdminDashboard
