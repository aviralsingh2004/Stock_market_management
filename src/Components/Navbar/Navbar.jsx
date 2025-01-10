import React from "react";
import "./Navbar.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
export const Navbar = () => {
  const [menu, setMenu] = useState("home");
  const navigate = useNavigate();
  function handleClick() {
    navigate("/home");
  }
  function handleClick2() {
    navigate("/portfolio");
  }
  function handleClick3() {
    navigate("/trade");
  }
  function handleClick4() {
    navigate("/funds");
  }

  function handleClick5() {
    navigate("/chatbot");
  }
  return (
    <div className="bg-black">
      <div>
        <ul className="nav-menu">
          <li>
            <button
              class="text-white border rounded-lg px-2 py-1 mt-2 bg-transparent  hover:bg-white hover:text-black transition duration-200"
              onClick={handleClick}
            >
              Home
            </button>
          </li>
          {/* <li onClick={()=>setMenu("portfolio")}>Portfolio{menu==="portfolio"?<hr/>:<></>}</li> */}
          <li>
            <button
              class="text-white border rounded-lg px-2 py-1 mt-2 bg-transparent  hover:bg-white hover:text-black transition duration-200"
              onClick={handleClick2}
            >
              Portfolio
            </button>
          </li>
          {/* <li onClick={()=>setMenu("trade")}>Trade{menu==="trade"?<hr />:<></>}</li> */}
          <li>
            <button
              class="text-white border rounded-lg px-2 py-1 mt-2 bg-transparent  hover:bg-white hover:text-black transition duration-200"
              onClick={handleClick3}
            >
              Trade
            </button>
          </li>
          {/* <li onClick={()=>setMenu("funds")}>funds{menu==="funds"?<hr/>:<></>}</li>*/}
          <li>
            <button
              class="text-white border rounded-lg px-2 py-1 mt-2 bg-transparent  hover:bg-white hover:text-black transition duration-200"
              onClick={handleClick4}
            >
              Funds
            </button>
          </li>

          <li>
            <button
              class="text-white border rounded-lg px-2 py-1 mt-2 bg-transparent  hover:bg-white hover:text-black transition duration-200"
              onClick={handleClick5}
            >
              DataBridgeAI
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
};
export default Navbar;
