import React from 'react'
import { useState } from 'react'
import {Menu,X,HeartPulse, Info, MapPin,Home,User,LogIn,LogOut, icons} from 'lucide-react'
import { AuthContext } from '../context/AuthContext';
import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
    const Navigate=useNavigate()
    const [isMenuOpen,setMenuOpen]=useState(false)
    const { isLoggedin, setLogged } = useContext(AuthContext);

    const handleLogout = () => {
        console.log('logged out')
    localStorage.removeItem("token");
    setLogged(false);
    Navigate('/login')
    };

    const guestLinks=[
        {name:'Home',href:'/',icon:Home},
        {name:'Hospitals',href:'/hospitallist',icon:MapPin},
        {name:'Register',href:'/register',icon:User},
        {name:'Login',href:'/login',icon:LogIn}
    ]

    const userLinks=[
        {name:'Home',href:'/',icon:Home},
        {name:'Hospitals',href:'/hospitallist',icon:MapPin},
        {name:'Logout',href:'#',icon:LogOut,onClick:true}
    ]

    const navLinks=isLoggedin ? userLinks:guestLinks

    return (
        <div className='bg-[#00cc99] shadow-lg shadow-black/40 relative border-b border-[#f0fff0]/30'>
        <div className='max-w-7xl mx-auto top-0 px-4 sm:px-6 lg:px-8'>
            <div className='flex h-16'>
                <div className='absolute left-6 top-4 flex items-center space-x-2'>
                    <HeartPulse className='w-8 h-8 text-[#f0fff0]'/>
                    <span className='text-2xl font-bold text-white'>Hospice</span>
                </div>

                
                <button 
                    onClick={()=>setMenuOpen(!isMenuOpen)} 
                    className='absolute right-4 text-[#f0fff0] p-5 rounded-md transition-colors hover:text-white hover:bg-[#00b386]/30'>
                    {isMenuOpen ? <X className='w-6 h-6'/>:<Menu className='w-6 h-6'/>}
                </button>

                {isMenuOpen &&(
                    <div className='absolute right-4 top-16 bg-[#f0fff0] rounded-lg shadow-xl shadow-black/50 border border-[#00cc99]/60 w-64 z-50 overflow-hidden'>
                     <div className='py-2'>
                     {navLinks.map((link)=>{
                        const Icon=link.icon
                        if(link.name === 'Logout')
                        {
                            return(
                                <button key={link.name} onClick={handleLogout} className='flex items-center space-x-3 p-4 py-3 text-[#00996b] hover:bg-[#00cc99]/20 w-full duration-200 font-medium tracking-tight'>
                                    <Icon className='w-4 h-4'/>
                                    <span>{link.name}</span>
                                </button>
                            )
                        }

                        return(
                            <a key={link.name} 
                            href={link.href}
                            className='flex items-center space-x-3 p-4 py-3 text-[#00996b] hover:bg-[#00cc99]/20 hover:text-[#00cc99] font-medium transition-all duration-200'
                            onClick={()=>setMenuOpen(false)}>
                                <Icon className='w-4 h-4'/>
                                <span>{link.name}</span> 
                            </a>
                        )
                    })

                    }
                </div>
                </div>
                )}
            </div>

        </div>
    </div>
  )
}

export default Navbar