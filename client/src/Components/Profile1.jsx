import { useState, useRef, useEffect } from "react";
import { ChevronUp, ChevronDown, LogOut } from "lucide-react";

function Profile1({ userType = "auto" }) {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [userData, setUserData] = useState(null);
    const dropdownRef = useRef(null);
    
    const toggleDropdown = () => {
        setIsOpen((prevState) => !prevState);
    };

    useEffect(() => {
        const loadUserData = () => {
            try {
                const token = localStorage.getItem('token');
                
                // Try multiple possible user data sources
                const storedFaculty = localStorage.getItem('faculty');
                const storedAdmin = localStorage.getItem('admin');
                const storedUser = localStorage.getItem('user');
                
                console.log('=== PROFILE DEBUG ===');
                console.log('User type:', userType);
                console.log('Token exists:', !!token);
                console.log('Faculty data exists:', !!storedFaculty);
                console.log('Admin data exists:', !!storedAdmin);
                console.log('User data exists:', !!storedUser);
                
                if (token) {
                    let user = null;
                    
                    // Try to find user data in order of preference
                    if (storedFaculty) {
                        user = JSON.parse(storedFaculty);
                        console.log('Using faculty data:', user);
                    } else if (storedAdmin) {
                        user = JSON.parse(storedAdmin);
                        console.log('Using admin data:', user);
                    } else if (storedUser) {
                        user = JSON.parse(storedUser);
                        console.log('Using user data:', user);
                    } else {
                        // Fallback: try to decode from token
                        try {
                            const tokenPayload = JSON.parse(atob(token.split('.')[1]));
                            user = {
                                id: tokenPayload.id,
                                name: tokenPayload.name || 'User',
                                employeeId: tokenPayload.employeeId || tokenPayload.id,
                                emailId: tokenPayload.emailId || tokenPayload.email,
                                role: tokenPayload.role || userType
                            };
                            console.log('Using token data:', user);
                        } catch (decodeError) {
                            console.log('Token decode failed, using defaults');
                            user = {
                                name: userType === 'admin' ? 'Admin User' : 'Faculty User',
                                role: userType,
                                employeeId: 'Unknown'
                            };
                        }
                    }
                    
                    // Map to consistent format
                    setUserData({
                        id: user._id || user.id,
                        name: user.name,
                        employeeId: user.employeeId,
                        emailId: user.emailId,
                        role: user.role,
                        imageUrl: user.imageUrl || null
                    });
                } else {
                    console.log('No token found, redirecting to login');
                    // Smart redirect based on user type or current path
                    const isAdminPath = window.location.pathname.includes('/admin');
                    window.location.href = isAdminPath ? '/admin/login' : '/login';
                }
            } catch (error) {
                console.error('Error loading user data:', error);
                const isAdminPath = window.location.pathname.includes('/admin');
                window.location.href = isAdminPath ? '/admin/login' : '/login';
            }
        };
        
        loadUserData();
    }, [userType]);

    // Handle clicks outside the dropdown
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        
        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen]);
    
    const handleSignOut = async () => {
        setIsLoading(true);
        setError(null);
        
        try {
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Clear all possible auth data
            localStorage.removeItem('token');
            localStorage.removeItem('faculty');
            localStorage.removeItem('admin');
            localStorage.removeItem('user');
            localStorage.removeItem('authToken');
            
            console.log("User signed out successfully");
            setIsOpen(false);
            
            // Smart redirect based on user role or current path
            const isAdminUser = userData?.role === 'admin' || window.location.pathname.includes('/admin');
            window.location.href = isAdminUser ? '/admin/login' : '/login';
            
        } catch (err) {
            setError('Failed to sign out. Please try again.');
            console.error('Sign out error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    if (!userData) {
        return (
            <div className="relative">
                <div className="flex items-center p-2 rounded-md">
                    <div className="mr-2 text-white font-semibold">Loading...</div>
                </div>
            </div>
        );
    }
    
    return (
        <div className="relative" ref={dropdownRef}>
            <div className="flex items-center cursor-pointer p-2 rounded-md hover:bg-white hover:bg-opacity-10 transition-colors"
                onClick={toggleDropdown}>
                <div className="mr-2 text-white font-semibold">{userData.name}</div>
                <div className="text-sm text-white font-semibold">
                    ({userData.role ? userData.role.charAt(0).toUpperCase() + userData.role.slice(1) : 'User'})
                </div>
                <div className="ml-2">
                    {isOpen ? <ChevronUp size={20} color="white" /> : <ChevronDown size={20} color="white" />}
                </div>
            </div>
            
            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10">
                    <div className="p-4 border-b border-gray-200 flex justify-evenly">
                        <div>
                            <img 
                                src={userData.imageUrl || "/api/placeholder/50/50"} 
                                alt="profile pic" 
                                className="h-14 w-14 bg-white rounded-full border-black border-2" 
                            />
                        </div>
                        <div>
                            <div className="font-medium">{userData.name}</div>
                            <div className="text-sm text-gray-500">{userData.employeeId}</div>
                        </div>
                    </div>
                    
                    {error && (
                        <div className="p-2 bg-red-100 text-red-600 text-sm">
                            {error}
                        </div>
                    )}
                    
                    <div 
                        className={`p-2 flex items-center cursor-pointer ${
                            isLoading 
                                ? "bg-gray-400" 
                                : "bg-red-600 hover:bg-red-700"
                        }`}
                        onClick={isLoading ? null : handleSignOut}
                    >
                        {isLoading ? (
                            <>
                                <div className="mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                <span className="text-white font-semibold">Signing Out...</span>
                            </>
                        ) : (
                            <>
                                <LogOut className="mr-2" color="white" />
                                <span className="text-white font-semibold">Sign Out</span>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default Profile1;
