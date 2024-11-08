import React from 'react'
import { ShoppingCart, UserPlus, LogIn, LogOut, Lock} from "lucide-react"
import { Link } from "react-router-dom"
import { useUserStore } from '../stores/useUserStore'
import { useCartStore } from '../stores/useCartStore'

const Navbar = () => {
    const {user,logOut} = useUserStore()
    const {cart} = useCartStore()
    console.log(cart)
    const isAdmin = user?.role === "admin" ? true : false;
  return (
    <header className='fixed top-0 left-0 w-full bg-gray-900 bg-opacity-90 backdrop-blur-md shadow-lg z-40 transition-all duration-300 border-b border-emerald-800'>
      <div className='container mx-auto px-4 py-3'>
        <div className='flex flex-wrap justify-between items-center'>
        <Link to="/" className="text-2xl font-bold text-emerald-400 items-center space-x-2 flex">E-Commerce</Link>
        <nav className='flex flex-wrap items-center gap-4'>
            <Link to="/" className='text-gray-300 hover:text-emerald-400 transition duration-300 ease-in-out'>Home</Link>
            {user && (
                <Link to={"/cart"} className='relative group text-gray-300 hover:text-emerald-400 transition duration-300 ease-in-out'>
                    <ShoppingCart className='inline-block mr-2 group-hover:text-emerald-400' size={20} />
                    <span className='hidden sm:inline'>Cart</span>
                    {cart.length > 0 && (<span className='bg-emerald-500 text-white rounded-full px-2 py-0.5 text-xs absolute -top-2 -left-2 group-hover:bg-emerald-400 transition duration-300 ease-in-out'>{cart.length}</span>)}
                </Link>
            )}
            {isAdmin && (
                <Link to={"/admin-dashboard"} className='flex items-center px-3 py-1 rounded-md font-medium text-gray-300 bg-emerald-700 hover:bg-emerald-600 transition duration-300 ease-in-out'>
                    <Lock className='inline-block mr-1' size={20} />
                    <span className='hidden sm:inline'>Dashboard</span>
                </Link>
            )}
            {user ? (
                <button className='bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-md flex items-center transition duration-300 ease-in-out' onClick={logOut}>
                    <LogOut size={20} />
                    <span className='hidden sm:inline '>Logout</span>
                </button>
            ): (
                <>
                    <Link to={"/login"} className='bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-md flex items-center transition duration-300 ease-in-out'>
                        <LogIn size={20} />
                        <span className='hidden sm:inline ml-3'>Login</span>
                    </Link>
                    <Link to={"/signup"} className='bg-emerald-700 hover:bg-emerald-600 text-white py-2 px-4 rounded-md flex items-center transition duration-300 ease-in-out'>
                        <UserPlus size={20} />
                        <span className='hidden sm:inline ml-3'>Sign Up</span>
                    </Link>
                </>
            )}
        </nav>
        </div>
      </div>
    </header>
  )
}

export default Navbar
