import React, { useState, useEffect } from 'react';
import { FaFacebookF, FaTwitter, FaYoutube, FaInstagram, FaLinkedinIn } from 'react-icons/fa';
import AOS from 'aos';
import 'aos/dist/aos.css';

import Imag01 from '../assets/cardimag01.png'
import img1 from '../assets/logo02.png'
import img2 from '../assets/logo03.png'
import img3 from '../assets/logo07.png'
import img4 from '../assets/logo04.png'
import img5 from '../assets/logo05.png'
import img6 from '../assets/logo06.png'

import homeImage from '../assets/home.png'
import nannyImg from '../assets/nanny.png'
import cookImg from '../assets/cook.png'
import driverImg from '../assets/driver.png'

import '../App.css'

export default function Landing() {
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 0) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    AOS.init({
      duration: 1200, 
      once: true, 
    });
  }, []);

  return (
    <div>
        <nav
            className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 sm:px-8 py-2 transition-all duration-500 ${
                scrolled ? 'w-full bg-white shadow-lg' : 'w-[90%] bg-white m-auto mt-2 text-sm'
            }`}
        >
          
            <div className="text-green-500 font-bold text-xl flex items-center">
                <div className="rounded-full border-2 border-green-500 p-2 mr-2">
                   
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        className="w-6 h-6 text-green-500"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 20v-6m0 0V4m0 10l4-4m-4 4l-4-4"
                        />
                    </svg>
                </div>
                CheckMyPeople
            </div>

            <button
                className="sm:hidden text-green-500"
                onClick={() => setMenuOpen(!menuOpen)}
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d={menuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}
                    />
                </svg>
            </button>

            <ul
                className={`fixed sm:static top-16 left-0 w-full sm:w-auto sm:flex bg-white sm:bg-transparent shadow-lg sm:shadow-none space-y-4 sm:space-y-0 px-6 sm:px-0 py-4 sm:py-0 transition-transform duration-300 ${
                    menuOpen ? 'transform translate-x-0' : 'transform -translate-x-full sm:translate-x-0'
                }`}
            >
                <li className="hover:text-green-500">
                    <a href="#about" className="font-semibold">
                        Resources
                    </a>
                </li>
                <li className="hover:text-green-500 relative group mx-5">
                    <a href="#property" className="font-semibold">
                        Our Services
                    </a>
                    {/* Dropdown */}
                    <div className="hidden group-hover:block absolute top-8 left-0 bg-white shadow-lg p-2 text-sm">
                        <a href="#residential" className="block px-4 py-2 hover:bg-gray-100">
                            Identity Verification
                        </a>
                        <a href="#commercial" className="block px-4 py-2 hover:bg-gray-100">
                            Background Check
                        </a>
                    </div>
                </li>
                <li className="hover:text-green-500 relative group mr-5">
                    <a href="#pages" className="font-semibold">
                        Company
                    </a>
                    {/* Dropdown */}
                    <div className="hidden group-hover:block absolute top-8 left-0 bg-white shadow-lg p-2 text-sm">
                        <a href="#blog" className="block px-4 py-2 hover:bg-gray-100">
                            Blog
                        </a>
                        <a href="#contact" className="block px-4 py-2 hover:bg-gray-100">
                            Contact
                        </a>
                    </div>
                </li>
                <li className="hover:text-green-500">
                    <a href="#contact" className="font-semibold">
                        Mobile App
                    </a>
                </li>
            </ul>

            <button className="hidden sm:block bg-green-500 text-white font-semibold px-4 py-2 rounded-lg hover:bg-green-600">
                Client Login
            </button>
        </nav>

        <main className="home flex flex-col-reverse md:flex-row items-center justify-between px-6 sm:px-10 md:px-20 py-10">
            
            <div
                data-aos="fade-left"
                className="left text-white text-center md:text-left md:max-w-md space-y-6 animate-fade-in w-full md:w-1/2"
            >
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-wide leading-tight">
                    Confirming your staff identity and credibility
                </h1>
                <p className="text-base sm:text-lg md:text-xl font-light leading-relaxed">
                    An all-in-one platform to help you verify & confirm that employees are who they say they are.
                </p>
                <div className="space-x-4 mt-6">
                    <button className="get-started-btn px-6 py-3 bg-white text-green-600 rounded-lg shadow-lg hover:scale-105 transition-transform duration-300 ease-in-out">
                        Get Started
                    </button>
                    <button className="login-btn px-6 py-3 bg-green-700 rounded-lg shadow-lg text-gray-800 hover:bg-green-800 hover:scale-105 transition-transform duration-300 ease-in-out">
                        Login
                    </button>
                </div>
            </div>
            
            <div
                data-aos="flip-right"
                className="home-image mt-10 md:mt-0 w-full md:w-1/2 flex justify-center"
            >
                <img
                    src={homeImage}
                    alt="A hand with a directional arrow"
                    className="w-80 sm:w-96 rounded-lg shadow-lg object-cover h-auto"
                />
            </div>
        </main>


        <div className="px-6 sm:px-10 md:px-20 py-10 space-y-10">
            <div className="platform text-center">
                <p className="par text-lg sm:text-xl md:text-2xl font-light text-gray-700 mb-8">
                    An all-in-one platform to help you verify & confirm that employees are who they say they are.
                </p>

                <div className="platform-cards flex flex-wrap">
                    <div className="card bg-white rounded-lg shadow-lg p-6 hover:scale-105 transition-transform duration-300">
                        <img
                            src={Imag01}
                            alt="Person verification status"
                            className="w-full h-40 object-cover rounded-md mb-4"
                        />
                        <h2 className="text-lg font-bold text-green-700 mb-2">Verify Identity</h2>
                        <p className="text-gray-600">
                            We offer our service via our web platform as well as the Online App (CheckMyPeople) on Play Store and App Store.
                        </p>
                    </div>
                    <div className="card bg-white rounded-lg shadow-lg p-6 hover:scale-105 transition-transform duration-300">
                        <img
                            src={Imag01}
                            alt="Person verification status"
                            className="w-full h-40 object-cover rounded-md mb-4"
                        />
                        <h2 className="text-lg font-bold text-green-700 mb-2">Verify Identity</h2>
                        <p className="text-gray-600">
                            We offer our service via our web platform as well as the Online App (CheckMyPeople) on Play Store and App Store.
                        </p>
                    </div>
                    <div className="card bg-white rounded-lg shadow-lg p-6 hover:scale-105 transition-transform duration-300">
                        <img
                            src={Imag01}
                            alt="Person verification status"
                            className="w-full h-40 object-cover rounded-md mb-4"
                        />
                        <h2 className="text-lg font-bold text-green-700 mb-2">Verify Identity</h2>
                        <p className="text-gray-600">
                            We offer our service via our web platform as well as the Online App (CheckMyPeople) on Play Store and App Store.
                        </p>
                    </div>
                    
                </div>
            </div>

            <div className="logo-slide flex items-center justify-center space-x-6 flex-wrap">
                <img src={img1} alt="Company logo 1" className="w-20 h-auto grayscale hover:grayscale-0 transition-all" />
                <img src={img2} alt="Company logo 2" className="w-20 h-auto grayscale hover:grayscale-0 transition-all" />
                <img src={img3} alt="Company logo 3" className="w-20 h-auto grayscale hover:grayscale-0 transition-all" />
                <img src={img4} alt="Company logo 4" className="w-20 h-auto grayscale hover:grayscale-0 transition-all" />
                <img src={img5} alt="Company logo 5" className="w-20 h-auto grayscale hover:grayscale-0 transition-all" />
                <img src={img6} alt="Company logo 6" className="w-20 h-auto grayscale hover:grayscale-0 transition-all" />
            </div>
        </div>

        <div className="home-driver flex flex-col-reverse md:flex-row items-center justify-between px-6 sm:px-10 md:px-20 py-10 space-y-10 md:space-y-0">
            
            <div 
                className="left text-center md:text-left text-white space-y-6 md:max-w-lg w-full" 
                data-aos="fade-up-right"
            >
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-wide leading-tight">
                    Verify your Child Nanny with CheckMyPeople
                </h1>
                <p className="text-base sm:text-lg md:text-xl font-light leading-relaxed">
                    People have a need for trust, security, and peace of mind within their homes. They seek assurance that the individuals they hire are trustworthy, reliable, and pose no threat to their safety or the safety of their families.
                </p>
                <div className="space-x-4 mt-6">
                    <button className="get-started-btn px-6 py-3 bg-white text-green-600 rounded-lg shadow-lg hover:scale-105 transition-transform duration-300 ease-in-out">
                        Get Started
                    </button>
                    <button className="login-btn px-6 py-3 bg-green-700 rounded-lg shadow-lg text-gray-100 hover:bg-green-800 hover:scale-105 transition-transform duration-300 ease-in-out">
                        Login
                    </button>
                </div>
            </div>

            <div 
                className="home-image mt-10 md:mt-0 w-full md:w-1/2 flex justify-center"
                data-aos="fade-up-left"
            >
                <img
                    src={nannyImg}
                    alt="Verify your nanny"
                    className="w-80 sm:w-96 h-auto rounded-lg shadow-lg object-cover"
                />
            </div>
        </div>

        
        <div className="home-driver flex flex-col md:flex-row items-center justify-between px-6 sm:px-10 md:px-20 py-10 space-y-10 md:space-y-0">
            <div 
                className="home-image w-full md:w-1/2 flex justify-center"
                data-aos="fade-up-right"
            >
                <img
                    src={cookImg}
                    alt="Verify your cook and househelp"
                    className="w-80 sm:w-96 h-auto rounded-lg shadow-lg object-cover"
                />
            </div>
            <div 
                className="left text-center md:text-left text-white space-y-6 md:max-w-lg w-full md:w-1/2"
                data-aos="fade-up-left"
            >
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-wide leading-tight">
                    Verify your Cook & Househelp with CheckMyPeople
                </h1>
                <p className="text-base sm:text-lg md:text-xl font-light leading-relaxed">
                    Employee identification and verification helps allay security concerns by verifying the background and identity of potential employees, reducing the risk of hiring individuals with criminal records or questionable backgrounds.
                </p>
                <div className="space-x-4 mt-6">
                    <button className="get-started-btn px-6 py-3 bg-white text-green-600 rounded-lg shadow-lg hover:scale-105 transition-transform duration-300 ease-in-out">
                        Get Started
                    </button>
                    <button className="login-btn px-6 py-3 bg-green-700 rounded-lg shadow-lg text-gray-800 hover:bg-green-800 hover:scale-105 transition-all duration-300 ease-in-out">
                        Login
                    </button>
                </div>
            </div>
        </div>

        <div className="home-driver flex flex-col md:flex-row items-center justify-between px-6 sm:px-10 md:px-20 py-10 space-y-10 md:space-y-0"> 
            <div 
                className="left text-center md:text-left text-white space-y-6 md:max-w-lg w-full md:w-1/2" 
                data-aos="fade-up-right"
            >
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-wide leading-tight">
                    Verify your Driver and Security Staff with CheckMyPeople
                </h1>
                <p className="text-base sm:text-lg md:text-xl font-light leading-relaxed">
                    Employee identification and verification can help validate the qualifications, skills, and work experience of potential employees, ensuring that they possess the necessary expertise for the job.
                </p>
                <div className="space-x-4 mt-6">
                    <button className="get-started-btn px-6 py-3 bg-white text-green-600 rounded-lg shadow-lg hover:scale-105 transition-transform duration-300 ease-in-out">
                        Get Started
                    </button>
                    <button className="login-btn px-6 py-3 bg-green-700 rounded-lg shadow-lg text-gray-800 hover:bg-green-800 hover:scale-105 transition-all duration-300 ease-in-out">
                        Login
                    </button>
                </div>
            </div>

            <div 
                className="home-image w-full md:w-1/2 flex justify-center" 
                data-aos="fade-up-left"
            >
                <img
                    src={driverImg}
                    alt="Verify your driver and security staff"
                    className="w-80 sm:w-96 h-auto rounded-lg shadow-lg object-cover"
                />
            </div>
        </div>

        <div className='signupcard'>
            <h1>Get started today</h1>
            <p>Create a free account. Start collecting better research data today — no credit card or contract required. Full name. Email address. Password.</p>
            <button>Sign Up</button>
        </div>

        <footer className="footer">
            <div className="footer-content">
                <div className="footer-left">
                <h4 className="footer-heading">CheckMyPeople</h4>
                <p className="footer-tagline">Trust But Verify</p>
                </div>
                <div className="footer-right">
                    <ul className="social-icons">
                        <li><a href="#"><FaFacebookF /></a></li>
                        <li><a href="#"><FaTwitter /></a></li>
                        <li><a href="#"><FaYoutube /></a></li>
                        <li><a href="#"><FaInstagram /></a></li>
                        <li><a href="#"><FaLinkedinIn /></a></li>
                    </ul>
                </div>
            </div>
            <div className='hr'></div>
            <div className="footer-links">
                <div className="footer-column">
                <h4 className="footer-heading">Company</h4>
                <ul>
                    <li><a href="#">About Us</a></li>
                    <li><a href="#">Contact Us</a></li>
                    <li><a href="#">Online Community</a></li>
                </ul>
                </div>
                <div className="footer-column">
                <h4 className="footer-heading">Policies</h4>
                <ul>
                    <li><a href="#">Privacy Policy</a></li>
                    <li><a href="#">Terms Of Service</a></li>
                    <li><a href="#">Indemnity Agreement</a></li>
                    <li><a href="#">Cookies Policy</a></li>
                </ul>
                </div>
                <div className="footer-column">
                <h4 className="footer-heading">Resources</h4>
                <ul>
                    <li><a href="#">Use Case</a></li>
                </ul>
                <div className="app-store-buttons">
                    <a href="#"><img src="https://play.google.com/intl/en_us/badges/images/generic/en_badge_web_generic.png" alt="Get it on Google Play" /></a>
                    <a href="#"><img src="https://developer.apple.com/app-store/marketing/guidelines/images/app-store-badge-en-us.svg" alt="Download on the App Store" /></a>
                </div>
                </div>
            </div>
            <div className="hr"></div>
            <div className="footer-copyright">
                <p>&copy; 2024, CheckMyPeople</p>
            </div>
            <div className="footer-chat-button">
                <button><i className="fas fa-comment"></i></button>
            </div>
        </footer>

    </div>
  )
}
