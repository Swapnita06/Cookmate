"use client"
import { Button } from "./component/ui/button"
import { Heart, Eye, Facebook, Instagram, Twitter, TwitterIcon as TikTok, Menu, ChefHat, Star, Sparkles, Users, Clock } from "lucide-react"
import Link from "next/link"
import { useState, useEffect, useRef } from "react"

export default function CookMateLanding() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isVisible, setIsVisible] = useState({
    hero: false,
    posts: false,
    about: false,
    footer: false
  })

const aboutRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight;
      
      // Hero section
      const heroElement = document.getElementById('hero');
      if (heroElement && scrollPosition > heroElement.offsetTop + 100) {
        setIsVisible(prev => ({...prev, hero: true}));
      }
      
      // Posts section
      const postsElement = document.getElementById('posts');
      if (postsElement && scrollPosition > postsElement.offsetTop + 100) {
        setIsVisible(prev => ({...prev, posts: true}));
      }
      
      // About section
      const aboutElement = document.getElementById('about');
      if (aboutElement && scrollPosition > aboutElement.offsetTop + 100) {
        setIsVisible(prev => ({...prev, about: true}));
      }
      
      // Footer section
      const footerElement = document.getElementById('footer');
      if (footerElement && scrollPosition > footerElement.offsetTop + 100) {
        setIsVisible(prev => ({...prev, footer: true}));
      }
    }

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check on initial render
    
    return () => window.removeEventListener('scroll', handleScroll);
}, []);

const scrollToAbout = (e: React.MouseEvent) => {
     e.preventDefault();
  aboutRef.current?.scrollIntoView({ behavior: 'smooth' });
}


const scrollToContact = (e: React.MouseEvent) => {
  e.preventDefault();
   if (typeof window === 'undefined') return;
  const contactElement = document.getElementById('footer');
  const headerHeight = document.querySelector('header')?.offsetHeight || 0;
  
  if (contactElement) {
    window.scrollTo({
      top: contactElement.offsetTop - headerHeight - 20, // 20px extra spacing
      behavior: 'smooth'
    });
  }
}
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 z-0 bg-no-repeat"
        style={{ backgroundImage: 'url("/images/ChatGPT Image Jun 10, 2025, 12_17_51 PM.png")' }}
      ></div>
      <div className="absolute inset-0 z-0 bg-black/30"></div> {/* Overlay to ensure text readability */}
      {/* Header */}
      <header className="bg-orange-100 px-6 py-4 relative z-20">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-amber-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">🍳</span>
            </div>
            <span className="text-xl font-semibold text-gray-800">CookMate</span>
          </div>

          {/* Mobile menu button */}
          <button className="md:hidden text-gray-700" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            <Menu size={24} />
          </button>

          {/* Desktop navigation */}
          <nav className="hidden md:flex space-x-8">
          <a href="#" className="text-gray-700 hover:text-gray-900 font-medium">
  Home
</a>
<a 
  //href="#about" 
  className="text-gray-700 hover:text-gray-900 font-medium transition-colors duration-300 cursor-pointer"
  onClick={scrollToAbout}
>
  About
</a>
 <a 
    className="text-gray-700 hover:text-gray-900 font-medium transition-colors duration-300 cursor-pointer"
    onClick={scrollToContact}
  >
    Contact Us
  </a>

<Link 
  href="/auth" 
  className="text-gray-700 hover:text-gray-900 font-medium transition-colors duration-300 cursor-pointer"
>
  Get Started
</Link>
          </nav>
        </div>

        {/* Mobile navigation */}
        {mobileMenuOpen && (
  <div className="md:hidden bg-amber-50 mt-2 py-4 px-6 rounded-lg shadow-lg absolute left-0 right-0">
    <nav className="flex flex-col space-y-4">
      <a href="#" className="text-gray-700 hover:text-gray-900 font-medium cursor-pointer">
        Home
      </a>
      {/* <a href="#" className="text-gray-700 hover:text-gray-900 font-medium cursor-pointer">
        Welcome
      </a> */}
      <a 
        className="text-gray-700 hover:text-gray-900 font-medium cursor-pointer"
        onClick={scrollToAbout}
      >
        About
      </a>
       <a 
    className="text-gray-700 hover:text-gray-900 font-medium transition-colors duration-300 cursor-pointer"
    onClick={scrollToContact}
  >
    Contact Us
  </a>
    </nav>
  </div>
)}
      </header>
      {/* Main Content */}
      <main className="relative">
        {/* Hero Section */}
        <section 
          id="hero"
          className={`flex items-center justify-center px-6 py-12 transition-all duration-1000 ${isVisible.hero ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
        >
          <div className="max-w-4xl mx-auto w-full">
            {/* Hero Card */}
            <div className="bg-orange-200  p-6 md:p-12 text-center shadow-2xl relative hover:shadow-xl opacity-85 transition-shadow duration-300">
              <p className="text-gray-600 text-base md:text-lg mb-4 md:mb-8">
                Discover the Joy of Cooking with
                <br />
                CookMate
              </p>

              <h3 className="text-3xl md:text-5xl lg:text-5xl font-black text-gray-900 mb-8 md:mb-12 leading-tight">
                Explore Exciting
                <br />
                Recipes
              </h3>

              <Link href="/auth" passHref>
                <Button className="bg-transparent border-2 border-gray-800 text-gray-800 hover:bg-gray-800 hover:text-white px-6 md:px-8 py-2 md:py-3 rounded-full text-base md:text-lg font-medium transition-all duration-300 transform hover:scale-105">
                  Get Started
                </Button>
              </Link>

              {/* Scrolling text */}
              <div className="mt-8 md:mt-16 overflow-hidden">
                <div className="flex animate-scroll whitespace-nowrap">
                  <span className="text-gray-700 text-sm md:text-lg mx-4 md:mx-8">New Recipes Daily</span>
                  <span className="text-gray-400 text-sm md:text-lg mx-1 md:mx-2">•</span>
                  <span className="text-gray-700 text-sm md:text-lg mx-4 md:mx-8">New Recipes Daily</span>
                  <span className="text-gray-400 text-sm md:text-lg mx-1 md:mx-2">•</span>
                  <span className="text-gray-700 text-sm md:text-lg mx-4 md:mx-8">New Recipes Daily</span>
                  <span className="text-gray-400 text-sm md:text-lg mx-1 md:mx-2">•</span>
                  <span className="text-gray-700 text-sm md:text-lg mx-4 md:mx-8">New Recipes Daily</span>
                  <span className="text-gray-400 text-sm md:text-lg mx-1 md:mx-2">•</span>
                  <span className="text-gray-700 text-sm md:text-lg mx-4 md:mx-8">New Recipes Daily</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Latest Posts Section */}
        <section 
          id="posts"
          className={`bg-orange-200 py-16 px-6 transition-all duration-1000 delay-200 ${isVisible.posts ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
        >
          <div className="max-w-7xl mx-auto">
            <h2 className="text-5xl font-bold text-gray-900 mb-16">Latest Posts</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
              {/* Post 1 */}
              <div className="bg-orange-100 overflow-hidden border border-black hover:shadow-lg transition-shadow duration-300">
                <div className="h-64 overflow-hidden">
                  <img
                    src="/images/Verrine citron-menthe et spéculoos _ une recette dessert facile et fraîche.jpeg"
                    alt="Yellow cups and an open book"
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    style={{ objectPosition: "5% 28%" }}
                  />
                </div>
                <div className="p-6">
                  <p className="text-sm text-gray-500 mb-2">Swapnita Singh</p>
                  <h3 className="text-2xl font-semibold text-gray-800 mb-3">
                    Delicious Recipe Ideas to Try Today on COOKMATE
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Calling all food enthusiasts and home cooks! Are you looking for delicious and innovative recipe ideas to try out today? Look no further...
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      <Eye size={18} className="text-gray-400" />
                      <span className="text-sm text-gray-500">0</span>
                    </div>
                    <button className="text-gray-400 hover:text-red-500 transition-colors duration-300">
                      <Heart size={18} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Post 2 */}
              <div className="bg-orange-100 overflow-hidden border border-black hover:shadow-lg transition-shadow duration-300">
                <div className="h-64 overflow-hidden">
                  <img
                    src="/images/download (1).jpeg"
                    alt="Kitchen utensils hanging on a rack"
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    style={{ objectPosition: "50% 0" }}
                  />
                </div>
                <div className="p-6">
                  <p className="text-sm text-gray-500 mb-2">Swapnita Singh</p>
                  <h3 className="text-2xl font-semibold text-gray-800 mb-3">
                    Stay Organized in the Kitchen with COOKMATE's Tools
                  </h3>
                  <p className="text-gray-600 mb-4">
                    In a bustling kitchen, where pots simmer, pans sizzle, and flavors dance, staying organized is the secret ingredient to a seamless...
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      <Eye size={18} className="text-gray-400" />
                      <span className="text-sm text-gray-500">0</span>
                    </div>
                    <button className="text-gray-400 hover:text-red-500 transition-colors duration-300">
                      <Heart size={18} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Post 3 */}
              <div className="bg-orange-100 overflow-hidden border border-black hover:shadow-lg transition-shadow duration-300">
                <div className="h-64 overflow-hidden">
                  <img
                    src="/images/Sweet and Spicy Chicken Wings.jpeg"
                    alt="Yellow cups and an open book"
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    style={{ objectPosition: "100% 0" }}
                  />
                </div>
                <div className="p-6">
                  <p className="text-sm text-gray-500 mb-2">Swapnita Singh</p>
                  <h3 className="text-2xl font-semibold text-gray-800 mb-3">
                    Discover Kitchen Tips and Tricks on COOKMATE
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Are you someone who is passionate about cooking and always on the lookout for new kitchen tips and tricks? Look no further than...
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      <Eye size={18} className="text-gray-400" />
                      <span className="text-sm text-gray-500">0</span>
                    </div>
                    <button className="text-gray-400 hover:text-red-500 transition-colors duration-300">
                      <Heart size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* About Us Section */}
        <section 
          id="about"
          ref={aboutRef}
          className={`relative h-[380px] md:h-[800px] overflow-hidden transition-all duration-1000 delay-300 ${isVisible.about ? 'opacity-100' : 'opacity-0'}`}
        >
          <img
            src="/images/ChatGPT Image Jun 10, 2025, 03_05_31 PM.png"
            alt="Yellow cups and an open book"
            className="w-full h-full object-cover"
            style={{ objectPosition: "100% 0" }}
          />
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: 'url("/images/about-us-background.png")' }}
          ></div>

          {/* Content Overlay */}
          <div className="absolute inset-0 flex items-center justify-center mt-48">
            <div className={`bg-orange-200 p-8 md:p-20 w-[90%] max-w-md md:max-w-lg lg:max-w-xl transition-all duration-700 ${isVisible.about ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 md:mb-8 text-center">About Us</h2>
              <p className="text-gray-800 text-base leading-relaxed">
                CookMate is your go-to destination for all things culinary. Our platform enables users to unleash their
                creativity in the kitchen, from creating, viewing, and saving recipes to interacting with a voice-over
                AI assistant that guides you through each step.
              </p>
              <p className="text-gray-800 text-base leading-relaxed mt-4">
                Manage your pantry efficiently with our special section dedicated to tracking ingredient expiry dates.
                Our focus is on providing a visually engaging experience that prioritizes user engagement above all
                else.
              </p>
            </div>
          </div>
        </section>




 {/* Enhanced Features Section */}
      <div className="relative bg-gradient-to-br from-amber-100 via-orange-50 to-amber-200 py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-32 h-32 bg-amber-400 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-40 h-40 bg-orange-400 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm rounded-full px-6 py-3 mb-6 shadow-lg">
              <Sparkles className="w-5 h-5 text-amber-600 animate-pulse" />
              <span className="text-amber-800 font-semibold">Why Choose CookMate?</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-amber-800 to-orange-800 bg-clip-text text-transparent mb-6">
              Your Culinary Journey Starts Here
            </h2>
            <p className="text-xl text-amber-700 max-w-3xl mx-auto leading-relaxed">
              Experience the perfect blend of technology and tradition with features designed to elevate your cooking
              experience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {/* Voice Assistant Feature */}
            <div className="group text-center transform hover:scale-105 transition-all duration-500">
              <div className="relative mb-8">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-400 to-orange-500 rounded-3xl blur-xl opacity-25 group-hover:opacity-40 transition-opacity duration-500"></div>
                <div className="relative bg-gradient-to-br from-amber-500 to-orange-600 rounded-3xl w-20 h-20 flex items-center justify-center mx-auto shadow-2xl group-hover:shadow-3xl transition-all duration-500 group-hover:rotate-6">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-10 w-10 text-white group-hover:scale-110 transition-transform duration-300"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"
                    />
                  </svg>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-amber-900 mb-4 group-hover:text-orange-800 transition-colors duration-300">
                Voice Assistant
              </h3>
              <p className="text-amber-800 leading-relaxed text-lg">
                Get step-by-step cooking instructions hands-free with our intelligent voice assistant. Perfect for messy
                hands!
              </p>
            </div>

            {/* Save Money Feature */}
            <div className="group text-center transform hover:scale-105 transition-all duration-500">
              <div className="relative mb-8">
                <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-emerald-500 rounded-3xl blur-xl opacity-25 group-hover:opacity-40 transition-opacity duration-500"></div>
                <div className="relative bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl w-20 h-20 flex items-center justify-center mx-auto shadow-2xl group-hover:shadow-3xl transition-all duration-500 group-hover:rotate-6">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-10 w-10 text-white group-hover:scale-110 transition-transform duration-300"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-amber-900 mb-4 group-hover:text-green-800 transition-colors duration-300">
                Smart Savings
              </h3>
              <p className="text-amber-800 leading-relaxed text-lg">
                Discover recipes based on what's in your pantry to reduce food waste and save money on groceries.
              </p>
            </div>

            {/* Community Feature */}
            <div className="group text-center transform hover:scale-105 transition-all duration-500">
              <div className="relative mb-8">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-pink-500 rounded-3xl blur-xl opacity-25 group-hover:opacity-40 transition-opacity duration-500"></div>
                <div className="relative bg-gradient-to-br from-purple-500 to-pink-600 rounded-3xl w-20 h-20 flex items-center justify-center mx-auto shadow-2xl group-hover:shadow-3xl transition-all duration-500 group-hover:rotate-6">
                  <Users className="h-10 w-10 text-white group-hover:scale-110 transition-transform duration-300" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-amber-900 mb-4 group-hover:text-purple-800 transition-colors duration-300">
                Vibrant Community
              </h3>
              <p className="text-amber-800 leading-relaxed text-lg">
                Join a passionate community of food lovers sharing their favorite recipes, tips, and culinary
                adventures.
              </p>
            </div>
          </div>

          {/* Mini Features Grid */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center group">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                <Clock className="w-8 h-8 text-amber-600 mx-auto mb-3 group-hover:rotate-12 transition-transform duration-300" />
                <div className="text-sm font-semibold text-amber-800">Quick Recipes</div>
              </div>
            </div>
            <div className="text-center group">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                <Star className="w-8 h-8 text-amber-600 mx-auto mb-3 group-hover:rotate-12 transition-transform duration-300" />
                <div className="text-sm font-semibold text-amber-800">Top Rated</div>
              </div>
            </div>
            <div className="text-center group">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                <Heart className="w-8 h-8 text-amber-600 mx-auto mb-3 group-hover:rotate-12 transition-transform duration-300" />
                <div className="text-sm font-semibold text-amber-800">Favorites</div>
              </div>
            </div>
            <div className="text-center group">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                <ChefHat className="w-8 h-8 text-amber-600 mx-auto mb-3 group-hover:rotate-12 transition-transform duration-300" />
                <div className="text-sm font-semibold text-amber-800">Chef's Choice</div>
              </div>
            </div>
          </div>
        </div>
      </div>


        {/* Footer */}
        <footer 
          id="footer"
          className={`bg-orange-100 relative z-20 transition-all duration-1000 delay-200 ${isVisible.footer ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
        >
          <div className="max-w-7xl mx-auto px-6 py-12">
            {/* Top border */}
            <div className="border-t border-gray-300 mb-12"></div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {/* Left Column */}
              <div className="space-y-8">
                <h2 className="text-2xl font-bold hover:text-amber-600 transition-colors duration-300">CookMate</h2>

                <div className="space-y-6">
                  <h3 className="text-3xl md:text-4xl font-bold">Stay Connected with Us</h3>

                  <div className="space-y-4">
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        id="email"
                        className="w-full border-b border-gray-400 py-2 bg-transparent focus:outline-none focus:border-gray-900 transition-colors duration-300"
                        required
                      />
                    </div>

                    <div className="flex items-start space-x-2">
                      <input type="checkbox" id="newsletter" className="mt-1 hover:cursor-pointer" />
                      <label htmlFor="newsletter" className="text-sm text-gray-700 hover:text-gray-900 transition-colors duration-300">
                        Yes, subscribe me to your newsletter. <span className="text-red-500">*</span>
                      </label>
                    </div>

                    <button className="w-full border border-gray-800 py-3 text-center hover:bg-gray-800 hover:text-white transition-colors duration-300 transform hover:scale-[1.01]">
                      Subscribe
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="md:border-l md:border-gray-300 md:pl-12">
                <div className="space-y-6">
                  <div>
                    <p className="text-gray-700 hover:text-gray-900 transition-colors duration-300">123-456-7890</p>
                    <p className="text-gray-700 hover:text-gray-900 transition-colors duration-300">info@mysite.com</p>
                  </div>

                  <div>
                    <p className="text-gray-700 hover:text-gray-900 transition-colors duration-300">500 Terry Francine Street,</p>
                    <p className="text-gray-700 hover:text-gray-900 transition-colors duration-300">6th Floor, San Francisco,</p>
                    <p className="text-gray-700 hover:text-gray-900 transition-colors duration-300">CA 94158</p>
                  </div>

                  <div className="space-y-1">
                    <a href="#" className="block text-gray-700 hover:underline hover:text-gray-900 transition-colors duration-300">
                      Privacy Policy
                    </a>
                    <a href="#" className="block text-gray-700 hover:underline hover:text-gray-900 transition-colors duration-300">
                      Accessibility Statement
                    </a>
                    <a href="#" className="block text-gray-700 hover:underline hover:text-gray-900 transition-colors duration-300">
                      Shipping Policy
                    </a>
                    <a href="#" className="block text-gray-700 hover:underline hover:text-gray-900 transition-colors duration-300">
                      Terms & Conditions
                    </a>
                    <a href="#" className="block text-gray-700 hover:underline hover:text-gray-900 transition-colors duration-300">
                      Refund Policy
                    </a>
                  </div>

                  <div className="flex space-x-4">
                    <a href="#" className="text-gray-700 hover:text-gray-900 transition-colors duration-300 transform hover:scale-110">
                      <Facebook size={20} />
                      <span className="sr-only">Facebook</span>
                    </a>
                    <a href="#" className="text-gray-700 hover:text-gray-900 transition-colors duration-300 transform hover:scale-110">
                      <Instagram size={20} />
                      <span className="sr-only">Instagram</span>
                    </a>
                    <a href="#" className="text-gray-700 hover:text-gray-900 transition-colors duration-300 transform hover:scale-110">
                      <Twitter size={20} />
                      <span className="sr-only">Twitter</span>
                    </a>
                    <a href="#" className="text-gray-700 hover:text-gray-900 transition-colors duration-300 transform hover:scale-110">
                      <TikTok size={20} />
                      <span className="sr-only">TikTok</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom border */}
            <div className="border-t border-gray-300 mt-12"></div>
          </div>
        </footer>
      </main>
      <style jsx>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        
        .animate-scroll {
          animation: scroll 20s linear infinite;
        }
      `}</style>
    </div>
  )
}