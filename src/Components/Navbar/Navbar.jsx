import React from 'react'
import './Navbar.css'
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
export const Navbar = () => {
    const [menu,setMenu]=useState("home");
    const navigate = useNavigate();
    function handleClick(){
        navigate("/home");
    }
    function handleClick2(){
        navigate("/portfolio");
    }
    function handleClick3(){
        navigate("/trade");
    }
    function handleClick4(){
        navigate("/funds");
    }
  return (
    <div className='navbar'>
        <div>
            <ul className='nav-menu'>
                <li><button onClick={handleClick}>Home</button></li>
                {/* <li onClick={()=>setMenu("portfolio")}>Portfolio{menu==="portfolio"?<hr/>:<></>}</li> */}
                <li><button onClick={handleClick2}>Portfolio</button></li>
                {/* <li onClick={()=>setMenu("trade")}>Trade{menu==="trade"?<hr />:<></>}</li> */}
                <li><button onClick={handleClick3}>Trade</button></li>
                {/* <li onClick={()=>setMenu("funds")}>funds{menu==="funds"?<hr/>:<></>}</li>*/}
                <li><button onClick={handleClick4}>Funds</button></li>
            </ul>
        </div>
    </div>
  )
}
export default Navbar;
