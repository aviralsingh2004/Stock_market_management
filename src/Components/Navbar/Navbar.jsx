import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Navbar as MTNavbar,
  MobileNav,
  Typography,
  Button,
  IconButton,
} from "@material-tailwind/react";

export const Navbar = () => {
  const [menu, setMenu] = useState("home");
  const [openNav, setOpenNav] = useState(false);
  const [userName, setUserName] = useState("");
  const navigate = useNavigate();
  const location = useLocation(); // Hook to get current path

  // Handle responsive behavior
  useEffect(() => {
    fetchUser();
    const handleResize = () => {
      if (window.innerWidth >= 960) {
        setOpenNav(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleNavigate = (path) => {
    setMenu(path);
    navigate(`/${path}`);
  };

  const fetchUser = async () => {
    try {
      const response = await fetch(`http://localhost:4000/api/username`);
      if (!response.ok) {
        throw new Error("Failed to fetch username");
      }
      const data = await response.json();
      setUserName(data);
    } catch (err) {
      console.error("Error fetching username:", err);
    }
  };

  const navList = (
    <ul className="mt-2 mb-4 flex flex-col gap-4 lg:mb-0 lg:mt-0 lg:flex-row lg:items-center lg:gap-6 text-white">
      <li>
        <button
          onClick={() => handleNavigate("home")}
          className={`${
            location.pathname === "/home"
              ? "text-blue-600"
              : "hover:text-blue-500"
          } text-sm font-semibold transition duration-300`}
        >
          Home
        </button>
      </li>
      <li>
        <button
          onClick={() => handleNavigate("portfolio")}
          className={`${
            location.pathname === "/portfolio"
              ? "text-blue-600"
              : "hover:text-blue-500"
          } text-sm font-semibold transition duration-300`}
        >
          Portfolio
        </button>
      </li>
      <li>
        <button
          onClick={() => handleNavigate("trade")}
          className={`${
            location.pathname === "/trade"
              ? "text-blue-600"
              : "hover:text-blue-500"
          } text-sm font-semibold transition duration-300`}
        >
          Trade
        </button>
      </li>
      <li>
        <button
          onClick={() => handleNavigate("funds")}
          className={`${
            location.pathname === "/funds"
              ? "text-blue-600"
              : "hover:text-blue-500"
          } text-sm font-semibold transition duration-300`}
        >
          Funds
        </button>
      </li>
      <li>
        <button
          onClick={() => handleNavigate("chatbot")}
          className={`${
            location.pathname === "/chatbot"
              ? "text-blue-600"
              : "hover:text-blue-500"
          } text-sm font-semibold transition duration-300`}
        >
          DataBridgeAI
        </button>
      </li>
    </ul>
  );

  const handleClick = () => {
    navigate("/");
  };

  return (
    <MTNavbar className="fixed top-0 left-0 w-full z-10 bg-gradient-to-r from-blue-950 via-blue-950 to-black px-4 py-3 lg:px-8 lg:py-4 shadow-lg">
      <div className="flex items-center justify-between">
        <Typography
          as="a"
          href="#"
          className="mr-4 text-lg font-bold text-white cursor-pointer"
        >
          Hello {userName}
        </Typography>
        <div className="hidden lg:flex lg:items-center lg:gap-4">{navList}</div>
        <div className="hidden lg:flex lg:items-center lg:gap-2">
          <Button
            size="sm"
            className="rounded-md bg-indigo-600 text-white hover:bg-indigo-700 transition"
            onClick={handleClick}
          >
            Log out
          </Button>
        </div>
        <IconButton
          variant="text"
          className="ml-auto h-6 w-6 text-white hover:bg-transparent lg:hidden"
          ripple={false}
          onClick={() => setOpenNav(!openNav)}
        >
          {openNav ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          )}
        </IconButton>
      </div>
    </MTNavbar>
  );
};

export default Navbar;
