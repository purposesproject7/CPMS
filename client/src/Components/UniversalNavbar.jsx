import React from "react";
import Logo from "../Images/VITLogoEmblem.png";
import Leftmenu from "./Leftmenu";      // Admin menu
import Leftmenu1 from "./Leftmenu1";    // Faculty menu
import Profile1 from "./Profile1";      // Universal profile


function UniversalNavbar({
  userType = "auto",
  showLeftMenu = "auto",
  campusName = "(Chennai Campus)",
}) {
  const pathname = window.location.pathname;

  // Auto-detect user type
  const detectedUserType =
    userType === "auto"
      ? pathname.includes("/admin")
        ? "admin"
        : "faculty"
      : userType;

  // Define routes where left menu and profile should be hidden
  const hideUIRoutes = ["/Home", "/login", "/admin/login"];

  const shouldHideUI = hideUIRoutes.includes(pathname);

  // Determine if left menu should be shown
  const displayLeftMenu =
    showLeftMenu === true
      ? true
      : showLeftMenu === false
      ? false
      : !shouldHideUI;

  return (
    <div className="fixed top-0 left-0 w-screen h-14 bg-[linear-gradient(130deg,_rgba(36,85,163,1)_23%,_rgba(52,151,219,1)_52%,_rgba(52,142,219,1)_58%,_rgba(52,131,219,1)_65%,_rgba(40,116,166,1)_74%)] z-50">
      <div className="flex justify-between items-center h-full">
        <div className="flex items-center pl-4 h-full">
          {/* Conditionally render side menus */}
          {displayLeftMenu && (
            detectedUserType === "admin" ? <Leftmenu /> : <Leftmenu1 />
          )}

          <div className="flex items-center space-x-2">
            <img src={Logo} className="h-12 w-12" alt="Logo" />
            <p className="m-0 leading-none text-white font-serif font-bold text-4xl">
              VIT
            </p>
            <p className="m-0 leading-none text-white">{campusName}</p>
          </div>
        </div>

        <div className="pr-4 flex items-center">
          {/* Conditionally render Profile1 except on hidden UI routes */}
          {!shouldHideUI && <Profile1 userType={detectedUserType} />}
        </div>
      </div>
    </div>
  );
}

export default UniversalNavbar;
