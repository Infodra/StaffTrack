import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin, Clock, Users, Shield, BarChart3, CalendarDays,
  CheckCircle2, ArrowRight, Menu, X, Smartphone,
  Fingerprint, ChevronRight, Star, Zap,
  Lock, TrendingUp, UserCheck, MapPinned, Timer, BellRing
} from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [pricingTab, setPricingTab] = useState('saas');

  const features = [
    {
      icon: MapPinned,
      title: 'GPS-Based Attendance',
      description: 'Employees check in/out with real-time GPS verification. Location is validated against the office geofence for accurate attendance tracking.',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Shield,
      title: 'Geofence Verification',
      description: 'Define office boundaries with customizable radius. Only allow check-ins within the designated area to prevent buddy punching.',
      color: 'from-indigo-500 to-purple-500'
    },
    {
      icon: Clock,
      title: 'Real-Time Tracking',
      description: 'Live dashboard showing who\'s checked in, working hours, and current office presence. Auto-checkout at end of day.',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: CalendarDays,
      title: 'Leave Management',
      description: 'Complete leave workflow — employees apply, admins approve/reject. Track casual, sick, earned, and unpaid leave balances.',
      color: 'from-orange-500 to-red-500'
    },
    {
      icon: BellRing,
      title: 'Auto Checkout & Alerts',
      description: 'Automatic end-of-day checkout ensures no missed records. Get alerts for late check-ins, missed attendance, and overtime.',
      color: 'from-emerald-500 to-teal-500'
    },
    {
      icon: BarChart3,
      title: 'Analytics & Reports',
      description: 'Attendance summaries, working hours analysis, and exportable reports. Admins get full visibility into team performance.',
      color: 'from-amber-500 to-orange-500'
    }
  ];

  const highlights = [
    {
      icon: Smartphone,
      title: 'Mobile Responsive',
      description: 'Works perfectly on any device — phone, tablet, or desktop'
    },
    {
      icon: Lock,
      title: 'Enterprise Security',
      description: 'JWT authentication, encrypted passwords, role-based access'
    },
    {
      icon: UserCheck,
      title: 'Employee Self-Service',
      description: 'Employees manage their own attendance, leaves, and working hours'
    },
    {
      icon: Zap,
      title: 'Instant Setup',
      description: 'Create a company and start tracking attendance in under 2 minutes'
    }
  ];

  const stats = [
    { value: '99.9%', label: 'Uptime', icon: TrendingUp },
    { value: '< 1s', label: 'Check-in Speed', icon: Timer },
    { value: '100%', label: 'GPS Accuracy', icon: Shield },
    { value: '24/7', label: 'Availability', icon: Clock }
  ];

  const howItWorks = [
    {
      step: '01',
      title: 'Add Employees',
      description: 'Admin adds employees with their roles, email, and sets the office location with geofence radius.'
    },
    {
      step: '02',
      title: 'Employees Check In',
      description: 'Employees open the portal, check in with GPS verification, and attendance is recorded automatically.'
    },
    {
      step: '03',
      title: 'Track & Manage',
      description: 'Admin views real-time dashboards, approves leaves, monitors working hours, and exports reports.'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-lg z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2 rounded-xl shadow-lg shadow-blue-500/25">
                <MapPin className="text-white" size={22} />
              </div>
              <div>
                <span className="text-xl font-extrabold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  StaffTrack
                </span>
                <span className="hidden sm:inline text-sm text-gray-400 ml-2 font-medium">| A Product of <a href="https://www.infodra.ai" target="_blank" rel="noopener noreferrer" className="text-indigo-500 hover:text-indigo-700 transition-colors">Infodra</a></span>
              </div>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors">Features</a>
              <a href="#how-it-works" className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors">How It Works</a>
              <a href="#highlights" className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors">Why StaffTrack</a>
              <a href="#pricing" className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors">Pricing</a>
              <a href="https://www.infodra.ai" target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors">Infodra.ai</a>
              <button
                onClick={() => navigate('/login?mode=super')}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 hover:-translate-y-0.5"
              >
                Super Admin
              </button>
            </div>

            {/* Mobile menu button */}
            <button className="md:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile menu */}
          {mobileMenuOpen && (
            <div className="md:hidden pb-4 space-y-2">
              <a href="#features" className="block px-4 py-2 text-gray-600 hover:bg-indigo-50 rounded-lg" onClick={() => setMobileMenuOpen(false)}>Features</a>
              <a href="#how-it-works" className="block px-4 py-2 text-gray-600 hover:bg-indigo-50 rounded-lg" onClick={() => setMobileMenuOpen(false)}>How It Works</a>
              <a href="#highlights" className="block px-4 py-2 text-gray-600 hover:bg-indigo-50 rounded-lg" onClick={() => setMobileMenuOpen(false)}>Why StaffTrack</a>
              <a href="#pricing" className="block px-4 py-2 text-gray-600 hover:bg-indigo-50 rounded-lg" onClick={() => setMobileMenuOpen(false)}>Pricing</a>
              <button
                onClick={() => { setMobileMenuOpen(false); navigate('/login?mode=super'); }}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold"
              >
                Super Admin
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-14 sm:pt-32 sm:pb-20 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50"></div>
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-10 left-1/3 w-72 h-72 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '4s' }}></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-indigo-100 shadow-sm mb-10">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-gray-700">GPS Attendance Platform</span>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-gray-700">Built for Modern Teams</span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-tight sm:leading-snug mb-10">
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">Smart Attendance for</span>
              <br />
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Modern Workplaces
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto mb-14 leading-relaxed">
              GPS-powered employee attendance tracking with geofence verification,
              leave management, and real-time analytics — built for
              growing businesses that value accuracy and efficiency.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a
                href="#features"
                className="group bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-xl text-base font-semibold shadow-xl shadow-blue-500/25 hover:shadow-2xl hover:shadow-blue-500/30 transition-all duration-300 hover:-translate-y-1 flex items-center gap-2"
              >
                Explore Features
                <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </a>
              <a
                href="#pricing"
                className="px-8 py-4 rounded-xl text-base font-semibold text-gray-700 bg-white border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all duration-300 flex items-center gap-2"
              >
                Explore Plan
                <ArrowRight size={18} />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, idx) => (
              <div key={idx} className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-50 mb-3">
                  <stat.icon size={22} className="text-indigo-600" />
                </div>
                <div className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-500 font-medium mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 sm:py-28 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-indigo-50 px-4 py-2 rounded-full mb-4">
              <Star size={16} className="text-indigo-600" />
              <span className="text-sm font-semibold text-indigo-600">Core Features</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">
              Everything You Need for{' '}
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Attendance Management
              </span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              A complete workforce management solution with GPS tracking, geofencing,
              leave management, and powerful admin controls.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="group bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all duration-300 hover:-translate-y-1"
              >
                <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon size={26} className="text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 sm:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-emerald-50 px-4 py-2 rounded-full mb-4">
              <Zap size={16} className="text-emerald-600" />
              <span className="text-sm font-semibold text-emerald-600">Simple Process</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">
              Up and Running in{' '}
              <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                3 Simple Steps
              </span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              From employee setup to GPS attendance tracking — get started in minutes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {howItWorks.map((item, idx) => (
              <div key={idx} className="relative">
                <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8 border border-gray-100 h-full">
                  <div className="text-5xl font-extrabold bg-gradient-to-r from-blue-200 to-indigo-200 bg-clip-text text-transparent mb-4">
                    {item.step}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{item.description}</p>
                </div>
                {idx < howItWorks.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 z-10">
                    <ChevronRight size={24} className="text-indigo-300" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why StaffTrack / Highlights */}
      <section id="highlights" className="py-20 sm:py-28 bg-gradient-to-br from-indigo-600 via-blue-600 to-purple-700 relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full" style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }}></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
              Why Enterprises Choose StaffTrack
            </h2>
            <p className="text-lg text-blue-100 max-w-2xl mx-auto">
              Built for reliability, security, and scale — trusted by businesses that demand the best.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {highlights.map((item, idx) => (
              <div
                key={idx}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-white/20 mb-4">
                  <item.icon size={24} className="text-white" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                <p className="text-blue-100 text-sm leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Role-Based Access Section */}
      <section className="py-20 sm:py-28 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-purple-50 px-4 py-2 rounded-full mb-4">
              <Fingerprint size={16} className="text-purple-600" />
              <span className="text-sm font-semibold text-purple-600">Role-Based Access</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">
              Two Levels of{' '}
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Smart Access Control
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Admin */}
            <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300">
              <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-6">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 p-3 rounded-xl">
                    <UserCheck size={28} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Admin</h3>
                    <p className="text-blue-100 text-sm">HR / Manager</p>
                  </div>
                </div>
              </div>
              <div className="p-6 space-y-3">
                {['Add & manage employees', 'View attendance reports', 'Approve/reject leaves', 'Company settings', 'Real-time team tracking'].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle2 size={18} className="text-blue-500 flex-shrink-0" />
                    <span className="text-gray-700 text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Employee */}
            <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300">
              <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 p-3 rounded-xl">
                    <Users size={28} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Employee</h3>
                    <p className="text-emerald-100 text-sm">Staff Member</p>
                  </div>
                </div>
              </div>
              <div className="p-6 space-y-3">
                {['GPS check-in / check-out', 'View attendance history', 'Apply for leaves', 'Track working hours', 'Personal dashboard'].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle2 size={18} className="text-emerald-500 flex-shrink-0" />
                    <span className="text-gray-700 text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 sm:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-green-50 px-4 py-1.5 rounded-full border border-green-200 mb-4">
              <span className="text-sm font-semibold text-green-700">Transparent Pricing</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">
              Choose the Right Plan for Your Team
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Whether you prefer a hassle-free SaaS subscription or a custom-built solution — we've got you covered.
            </p>
          </div>

          {/* Tabs */}
          <div className="flex justify-center mb-12">
            <div className="inline-flex bg-gray-100 rounded-xl p-1">
              <button
                type="button"
                onClick={() => setPricingTab('saas')}
                className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${
                  pricingTab === 'saas'
                    ? 'bg-white text-indigo-700 shadow-md'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                SaaS Pricing
              </button>
              <button
                type="button"
                onClick={() => setPricingTab('build')}
                className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${
                  pricingTab === 'build'
                    ? 'bg-white text-indigo-700 shadow-md'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                App Pricing
              </button>
            </div>
          </div>

          {/* SaaS Pricing */}
          <div className={pricingTab === 'saas' ? '' : 'hidden'}>
            <div className="max-w-lg mx-auto">
              <div className="relative bg-white rounded-3xl border-2 border-indigo-200 shadow-xl shadow-indigo-500/10 overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
                <div className="p-8 sm:p-10 text-center">
                  <div className="inline-flex items-center gap-2 bg-indigo-50 px-3 py-1 rounded-full mb-4">
                    <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wide">Most Popular</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">SaaS Subscription</h3>
                  <p className="text-gray-500 text-sm mb-6">No setup cost. Pay as you grow.</p>
                  <div className="flex items-baseline justify-center gap-1 mb-8">
                    <span className="text-5xl font-extrabold text-gray-900">₹150</span>
                    <span className="text-gray-500 text-lg">/employee/month</span>
                  </div>
                  <ul className="space-y-3 text-left mb-8">
                    {[
                      'GPS Attendance Tracking',
                      'Leave Management',
                      'Employee Dashboard',
                      'Admin Dashboard',
                      'Leave Approval Workflow',
                      'Reports & Analytics',
                      'Role-Based Access',
                      'Scalable — Add Employees Anytime',
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-3">
                        <CheckCircle2 size={18} className="text-green-500 flex-shrink-0" />
                        <span className="text-gray-700 text-sm">{item}</span>
                      </li>
                    ))}
                  </ul>
                  <a
                    href="https://wa.me/918148146785"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-semibold text-sm hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 hover:-translate-y-0.5"
                  >
                    Get Started
                  </a>
                  <div className="mt-6 space-y-2 text-xs text-gray-400">
                    <p>Cancel anytime &middot; Secure cloud hosting &middot; Browser access &middot; Minimum 3 employees</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Build for Client Pricing */}
          <div className={pricingTab === 'build' ? '' : 'hidden'}>
            <div>
              <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                {/* Basic */}
                <div className="bg-white rounded-3xl border border-gray-200 shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
                  <div className="p-8 text-center">
                    <h3 className="text-xl font-bold text-gray-900 mb-1">Basic</h3>
                    <p className="text-gray-500 text-sm mb-6">For small teams getting started</p>
                    <div className="flex items-baseline justify-center gap-1 mb-2">
                      <span className="text-4xl font-extrabold text-gray-900">₹45,000</span>
                    </div>
                    <p className="text-gray-400 text-xs mb-8">One-time setup</p>
                    <ul className="space-y-3 text-left mb-8">
                      {[
                        'Up to 30 Employees',
                        'Subdomain Portal',
                        'GPS Attendance',
                        'Leave Management',
                        'Employee & Admin Dashboard',
                      ].map((item, i) => (
                        <li key={i} className="flex items-center gap-3">
                          <CheckCircle2 size={18} className="text-green-500 flex-shrink-0" />
                          <span className="text-gray-700 text-sm">{item}</span>
                        </li>
                      ))}
                    </ul>
                    <a
                      href="https://wa.me/918148146785"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full border-2 border-indigo-600 text-indigo-600 py-3 rounded-xl font-semibold text-sm hover:bg-indigo-50 transition-colors duration-300"
                    >
                      Contact Sales
                    </a>
                  </div>
                </div>

                {/* Standard */}
                <div className="relative bg-white rounded-3xl border-2 border-indigo-200 shadow-xl shadow-indigo-500/10 overflow-hidden">
                  <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
                  <div className="p-8 text-center">
                    <div className="inline-flex items-center gap-2 bg-indigo-50 px-3 py-1 rounded-full mb-3">
                      <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wide">Recommended</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">Standard</h3>
                    <p className="text-gray-500 text-sm mb-6">For growing businesses</p>
                    <div className="flex items-baseline justify-center gap-1 mb-2">
                      <span className="text-4xl font-extrabold text-gray-900">₹95,000</span>
                    </div>
                    <p className="text-gray-400 text-xs mb-8">One-time setup</p>
                    <ul className="space-y-3 text-left mb-8">
                      {[
                        'Up to 100 Employees',
                        'Custom Branding',
                        'Leave Configuration',
                        'Reports & Analytics',
                        'GPS Attendance',
                        'Admin Dashboard',
                      ].map((item, i) => (
                        <li key={i} className="flex items-center gap-3">
                          <CheckCircle2 size={18} className="text-green-500 flex-shrink-0" />
                          <span className="text-gray-700 text-sm">{item}</span>
                        </li>
                      ))}
                    </ul>
                    <a
                      href="https://wa.me/918148146785"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-semibold text-sm hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 hover:-translate-y-0.5"
                    >
                      Contact Sales
                    </a>
                  </div>
                </div>

                {/* Enterprise */}
                <div className="bg-white rounded-3xl border border-gray-200 shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
                  <div className="p-8 text-center">
                    <h3 className="text-xl font-bold text-gray-900 mb-1">Enterprise</h3>
                    <p className="text-gray-500 text-sm mb-6">For large organizations</p>
                    <div className="flex items-baseline justify-center gap-1 mb-2">
                      <span className="text-4xl font-extrabold text-gray-900">₹1,75,000</span>
                    </div>
                    <p className="text-gray-400 text-xs mb-8">One-time setup</p>
                    <ul className="space-y-3 text-left mb-8">
                      {[
                        'Unlimited Employees',
                        'Custom Workflows',
                        'API Integrations',
                        'Advanced Reporting',
                        'Priority Support',
                        'Dedicated Account Manager',
                      ].map((item, i) => (
                        <li key={i} className="flex items-center gap-3">
                          <CheckCircle2 size={18} className="text-green-500 flex-shrink-0" />
                          <span className="text-gray-700 text-sm">{item}</span>
                        </li>
                      ))}
                    </ul>
                    <a
                      href="https://wa.me/918148146785"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full border-2 border-indigo-600 text-indigo-600 py-3 rounded-xl font-semibold text-sm hover:bg-indigo-50 transition-colors duration-300"
                    >
                      Contact Sales
                    </a>
                  </div>
                </div>
              </div>

              {/* Hosting & Maintenance */}
              <div className="max-w-2xl mx-auto mt-10">
                <div className="bg-gradient-to-r from-gray-50 to-indigo-50 rounded-2xl p-6 sm:p-8 border border-gray-200">
                  <h4 className="text-lg font-bold text-gray-900 mb-4 text-center">Hosting & Maintenance</h4>
                  <div className="grid sm:grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-extrabold text-indigo-600">₹500</p>
                      <p className="text-xs text-gray-500 mt-1">Hosting / month</p>
                    </div>
                    <div>
                      <p className="text-2xl font-extrabold text-indigo-600">₹1,000</p>
                      <p className="text-xs text-gray-500 mt-1">Maintenance / month</p>
                    </div>
                    <div>
                      <p className="text-2xl font-extrabold text-green-600">₹1,500</p>
                      <p className="text-xs text-gray-500 mt-1">Total / month</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 text-center mt-4">
                    Dedicated portal under Infodra domain (e.g., tecinfo.stafftrack.infodra.ai) &middot; Developed by Infodra Technologies
                  </p>
                  <p className="text-sm font-medium text-green-600 text-center mt-3">
                    ✓ Free installation and onboarding included.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 sm:py-28 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-3xl p-10 sm:p-16 border border-indigo-100 shadow-xl shadow-indigo-500/5">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/25 mb-6">
              <MapPin size={30} className="text-white" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">
              Ready to Transform Your Attendance System?
            </h2>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Join businesses that trust StaffTrack for accurate, GPS-verified attendance
              tracking. Set up your company in under 2 minutes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="https://www.infodra.ai/contact"
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-xl text-base font-semibold shadow-xl shadow-blue-500/25 hover:shadow-2xl hover:shadow-blue-500/30 transition-all duration-300 hover:-translate-y-1 flex items-center justify-center gap-2"
              >
                Get Started Now
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </a>
              <a
                href="https://wa.me/918148146785?text=Hi%2C%20I%27m%20interested%20in%20StaffTrack%20attendance%20solution"
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-4 rounded-xl text-base font-semibold text-white bg-green-500 hover:bg-green-600 transition-all duration-300 hover:-translate-y-1 flex items-center justify-center gap-2"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Contact Sales
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2 rounded-xl">
                  <MapPin className="text-white" size={20} />
                </div>
                <span className="text-xl font-extrabold text-white">StaffTrack</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed max-w-sm mb-6">
                GPS-powered employee attendance tracking platform by Infodra Technologies.
                Smart workforce management for modern businesses.
              </p>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-400">Powered by</span>
                <img src="/logos/infodra.png" alt="Infodra" className="h-8 opacity-60 hover:opacity-100 transition-opacity" />
              </div>
            </div>

            {/* Product */}
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a></li>
                <li><a href="#highlights" className="hover:text-white transition-colors">Why StaffTrack</a></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="https://www.infodra.ai" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Infodra.ai</a></li>
                <li><a href="https://infodratechnologies.com/about" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">About Infodra</a></li>
                <li><a href="https://www.infodra.ai/contact" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="mailto:connect@infodra.ai" className="hover:text-white transition-colors">connect@infodra.ai</a></li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-500">
              © {new Date().getFullYear()} Infodra Technologies Private Limited. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm text-gray-500">
              <a href="https://www.infodra.ai/privacy" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="https://www.infodra.ai/terms" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
