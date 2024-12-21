import React from 'react'
import './Navbar.css'
import { useState } from 'react';
export const Navbar = () => {
    const [menu,setMenu]=useState("home");
  return (
    <div className='navbar'>
        <div>
            <ul className='nav-menu'>
                <li onClick={()=>setMenu("home")}>Home{menu==="home"?<hr/>:<></>}</li>
                <li onClick={()=>setMenu("portfolio")}>Portfolio{menu==="portfolio"?<hr/>:<></>}</li>
                <li onClick={()=>setMenu("trade")}>Trade{menu==="trade"?<hr />:<></>}</li>
                <li onClick={()=>setMenu("funds")}>funds{menu==="funds"?<hr/>:<></>}</li>
            </ul>
        </div>
    </div>
  )
}
export default Navbar;
