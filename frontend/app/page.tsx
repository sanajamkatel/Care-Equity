'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// Split text into words for animation
const splitTextIntoWords = (text: string) => {
  return text.split(' ');
};

export default function Home() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set());
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Intersection Observer for scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleSections((prev) => new Set(prev).add(entry.target.id));
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    const sections = document.querySelectorAll('[data-animate-section]');
    sections.forEach((section) => observer.observe(section));

    return () => {
      sections.forEach((section) => observer.unobserve(section));
    };
  }, []);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className={`sticky top-0 z-50 bg-white border-b border-green-200 shadow-sm transition-all duration-300 ${
        isScrolled ? 'shadow-md' : 'shadow-sm'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo - Left Corner */}
            <button
              onClick={() => router.push('/')}
              className="flex items-center gap-2 text-2xl font-bold text-green-600 hover:text-green-700 transition-all duration-300 cursor-pointer bg-transparent border-none p-0 hover:scale-105"
            >
              <img src="/icon.png" alt="Care Equity" className="w-8 h-8" />
              <span>Care Equity</span>
            </button>
            
            {/* Navigation - Right Side */}
            <nav className="hidden md:flex items-center gap-1">
              <Link 
                href="/"
                className="px-4 py-2 text-gray-700 hover:text-green-600 hover:bg-green-50 rounded-md text-base font-medium transition-all duration-200"
              >
                Home
              </Link>
              <Link 
                href="/quality-ratings"
                className="px-4 py-2 text-gray-700 hover:text-green-600 hover:bg-green-50 rounded-md text-base font-medium transition-all duration-200"
              >
                Ratings
              </Link>
              <Link 
                href="/find-hospitals"
                className="px-4 py-2 text-gray-700 hover:text-green-600 hover:bg-green-50 rounded-md text-base font-medium transition-all duration-200"
              >
                Find Hospitals
              </Link>
              <Link 
                href="/links"
                className="px-4 py-2 text-gray-700 hover:text-green-600 hover:bg-green-50 rounded-md text-base font-medium transition-all duration-200"
              >
                Newsletters
              </Link>
              <Link 
                href="/report"
                className="ml-2 px-4 py-2 bg-green-600 text-white rounded-md text-base font-medium hover:bg-green-700 transition-all duration-200 shadow-sm"
              >
                Submit Anonymous Form
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section with Background Pattern */}
        <section className="relative overflow-hidden bg-gradient-to-b from-green-50 to-white">
          {/* Decorative background grid */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#10b98112_1px,transparent_1px),linear-gradient(to_bottom,#10b98112_1px,transparent_1px)] bg-[size:24px_24px]"></div>
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 lg:py-40">
            <div className="text-center max-w-4xl mx-auto">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                {/* Animated word-by-word text */}
                <span className="inline-block">
                  {splitTextIntoWords("What if healthcare quality didn't depend on race, gender, or location?").map((word, index) => (
                    <span
                      key={`hero-${index}`}
                      className="inline-block mr-2 md:mr-3"
                      style={{
                        animation: `fadeInUp 0.6s ease-out ${index * 0.08}s both`,
                      }}
                    >
                      {word}
                    </span>
                  ))}
                </span>
              </h1>
              <p 
                className="text-lg md:text-xl text-gray-700 mb-10 max-w-3xl mx-auto leading-loose"
                style={{
                  animation: `fadeInFloat 0.8s ease-out 1.2s both`,
                }}
              >
                Care Equity makes healthcare inequities visible—combining anonymous patient reports and maternal health outcomes to highlight disparities affecting Black patients and other communities of color.
              </p>
              <div 
                className="flex flex-col sm:flex-row gap-4 justify-center"
                style={{
                  animation: `fadeInFloat 0.8s ease-out 1.8s both`,
                }}
              >
                <Link 
                  href="/quality-ratings"
                  className="px-8 py-4 bg-green-600 text-white rounded-lg font-semibold text-lg hover:bg-green-700 transition-all hover:scale-105 shadow-lg text-center"
                >
                  Check ratings for a hospital
                </Link>
                <Link 
                  href="/report"
                  className="px-8 py-4 border-2 border-green-600 text-green-600 rounded-lg font-semibold text-lg hover:bg-green-50 transition-all text-center"
                >
                  Submit Anonymous
                </Link>
              </div>
              <p 
                className="mt-6 text-sm text-gray-600"
                style={{
                  animation: `fadeInFloat 0.8s ease-out 2.1s both`,
                }}
              >
                Join patients and advocates working towards equitable healthcare
              </p>
            </div>
          </div>
        </section>

        {/* Why You'll Love It Section */}
        <section 
          id="why-love-it"
          data-animate-section
          className={`py-20 md:py-32 bg-white transition-all duration-1000 ${
            visibleSections.has('why-love-it') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Why You'll Love It
              </h2>
              <p className="text-xl text-gray-700 max-w-2xl mx-auto">
                Care Equity gives you the transparency you need without the complexity you don't — so you focus on making informed healthcare decisions.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
              <div 
                className={`text-center transform transition-all duration-700 hover:scale-105 hover:-translate-y-2 ${
                  visibleSections.has('why-love-it') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
                style={{ transitionDelay: visibleSections.has('why-love-it') ? '0.1s' : '0s' }}
              >
                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6 hover:bg-green-200 transition-colors duration-300 hover:rotate-6">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Anonymous & Secure
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  Report experiences with complete anonymity. Your privacy is protected while your voice helps create change.
                </p>
              </div>

              <div 
                className={`text-center transform transition-all duration-700 hover:scale-105 hover:-translate-y-2 ${
                  visibleSections.has('why-love-it') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
                style={{ transitionDelay: visibleSections.has('why-love-it') ? '0.3s' : '0s' }}
              >
                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6 hover:bg-green-200 transition-colors duration-300 hover:rotate-6">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Data-Driven Insights
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  Access transparent hospital ratings based on real patient experiences and health outcomes by demographic.
                </p>
              </div>

              <div 
                className={`text-center transform transition-all duration-700 hover:scale-105 hover:-translate-y-2 ${
                  visibleSections.has('why-love-it') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
                style={{ transitionDelay: visibleSections.has('why-love-it') ? '0.5s' : '0s' }}
              >
                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6 hover:bg-green-200 transition-colors duration-300 hover:rotate-6">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Easy to Use
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  Find safer hospitals and report experiences in seconds. Simple interface designed for everyone.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* The Problem Section */}
        <section 
          id="problem" 
          data-animate-section
          className={`py-20 md:py-32 bg-green-50 transition-all duration-1000 ${
            visibleSections.has('problem') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                The Hospital Quality Problem
              </h2>
              <p className="text-xl text-gray-700 max-w-2xl mx-auto">
                Severe disparities exist in maternal healthcare outcomes across different demographics
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <div 
                className={`bg-white p-8 rounded-xl shadow-sm border border-green-100 transform transition-all duration-700 hover:scale-105 hover:shadow-lg hover:border-green-300 ${
                  visibleSections.has('problem') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
                style={{ transitionDelay: visibleSections.has('problem') ? '0.1s' : '0s' }}
              >
                <div className="text-5xl font-bold text-green-600 mb-4 animate-pulse-once">3.5x</div>
                <p className="text-gray-700 leading-relaxed mb-3">
                  Non-Hispanic Black women are more than 3 times more likely to have a maternal death than white women in the United States
                </p>
                <p className="text-sm text-gray-600">
                  Source: <a href="https://www.cdc.gov/nchs/data/hestat/maternal-mortality/2023/maternal-mortality-rates-2023.htm" target="_blank" rel="noopener noreferrer" className="text-green-600 hover:text-green-700 underline">CDC</a>
                </p>
              </div>

              <div 
                className={`bg-white p-8 rounded-xl shadow-sm border border-green-100 transform transition-all duration-700 hover:scale-105 hover:shadow-lg hover:border-green-300 ${
                  visibleSections.has('problem') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
                style={{ transitionDelay: visibleSections.has('problem') ? '0.3s' : '0s' }}
              >
                <div className="text-5xl font-bold text-green-600 mb-4 animate-pulse-once">2x</div>
                <p className="text-gray-700 leading-relaxed mb-3">
                  Black infants were at twice the risk of being at a hospital with high rates of mortality and morbidity
                </p>
                <p className="text-sm text-gray-600">
                  Sources: <a href="https://www.ajmc.com/view/racial-disparities-persist-in-maternal-morbidity-mortality-and-infant-health" target="_blank" rel="noopener noreferrer" className="text-green-600 hover:text-green-700 underline">AJMC</a>, <a href="https://news.harvard.edu/gazette/story/2025/04/mortality-rates-between-black-white-americans-narrow-except-in-case-of-infants/" target="_blank" rel="noopener noreferrer" className="text-green-600 hover:text-green-700 underline">Harvard Online</a>
                </p>
              </div>

              <div 
                className={`bg-white p-8 rounded-xl shadow-sm border border-green-100 transform transition-all duration-700 hover:scale-105 hover:shadow-lg hover:border-green-300 ${
                  visibleSections.has('problem') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
                style={{ transitionDelay: visibleSections.has('problem') ? '0.5s' : '0s' }}
              >
                <div className="text-5xl font-bold text-green-600 mb-4 animate-pulse-once">10x</div>
                <p className="text-gray-700 leading-relaxed mb-3">
                  Black women were ten times more likely to report unfair treatment and discrimination from maternity care providers
                </p>
                <p className="text-sm text-gray-600">
                  Source: <a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC9914526/" target="_blank" rel="noopener noreferrer" className="text-green-600 hover:text-green-700 underline">PMC</a>
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div 
                className={`bg-white p-8 rounded-xl shadow-sm border border-green-100 transform transition-all duration-700 hover:scale-105 hover:shadow-lg hover:border-green-300 ${
                  visibleSections.has('problem') ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'
                }`}
                style={{ transitionDelay: visibleSections.has('problem') ? '0.7s' : '0s' }}
              >
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                  Hospital Distribution Disparities
                </h3>
                <p className="text-gray-700 mb-3 leading-relaxed">
                  <strong className="text-gray-900">75%</strong> of Black pregnant women are cared for by only <strong className="text-gray-900">25%</strong> of hospitals
                </p>
                <p className="text-gray-700 leading-relaxed">
                  Some hospitals serving Black mothers received 'F' ratings from quality groups
                </p>
                <p className="text-sm text-gray-600 mt-4">
                  Sources: <a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC7384760/" target="_blank" rel="noopener noreferrer" className="text-green-600 hover:text-green-700 underline">PMC</a>, <a href="https://tcf.org/content/commentary/addressing-the-rural-maternal-health-crisis-with-the-black-maternal-health-momnibus/" target="_blank" rel="noopener noreferrer" className="text-green-600 hover:text-green-700 underline">TCF</a>
                </p>
              </div>

              <div 
                className={`bg-white p-8 rounded-xl shadow-sm border border-green-100 transform transition-all duration-700 hover:scale-105 hover:shadow-lg hover:border-green-300 ${
                  visibleSections.has('problem') ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'
                }`}
                style={{ transitionDelay: visibleSections.has('problem') ? '0.9s' : '0s' }}
              >
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                  Patient Experience of Discrimination
                </h3>
                <p className="text-gray-700 mb-3 leading-relaxed">
                  <strong className="text-gray-900">30%</strong> of Black and Hispanic women reported provider mistreatment compared to <strong className="text-gray-900">21%</strong> of White women
                </p>
                <p className="text-gray-700 leading-relaxed">
                  Patients who perceived racial bias were less likely to follow medical advice or seek care
                </p>
                <p className="text-sm text-gray-600 mt-4">
                  Sources: <a href="https://tcf.org/content/commentary/maternal-health-care-for-all-must-be-made-a-reality/" target="_blank" rel="noopener noreferrer" className="text-green-600 hover:text-green-700 underline">TCF</a>, <a href="https://www.cbcfinc.org/capstones/health-equity/healing-hands-amplifying-black-healthcare-providers-impact-on-americas-maternal-mortality-crisis/" target="_blank" rel="noopener noreferrer" className="text-green-600 hover:text-green-700 underline">CBCF</a>
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Advanced Features Section */}
        <section 
          id="features" 
          data-animate-section
          className={`py-20 md:py-32 bg-white transition-all duration-1000 ${
            visibleSections.has('features') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Advanced features for Transparent, Safe Healthcare
              </h2>
              <p className="text-xl text-gray-700 max-w-2xl mx-auto">
                From anonymous reporting to hospital finder tools, Care Equity gives you the building blocks for informed healthcare decisions — with a clean, user-friendly experience.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
              <div 
                className={`bg-green-50 p-8 rounded-xl border border-green-100 transform transition-all duration-700 hover:scale-105 hover:shadow-lg hover:bg-green-100 hover:border-green-300 ${
                  visibleSections.has('features') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
                style={{ transitionDelay: visibleSections.has('features') ? '0.1s' : '0s' }}
              >
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-6 hover:rotate-12 transition-transform duration-300">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                  Anonymous Reporting
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  Report experiences of bias or discrimination with complete anonymity. Your voice matters, and your privacy is protected.
                </p>
              </div>

              <div 
                className={`bg-green-50 p-8 rounded-xl border border-green-100 transform transition-all duration-700 hover:scale-105 hover:shadow-lg hover:bg-green-100 hover:border-green-300 ${
                  visibleSections.has('features') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
                style={{ transitionDelay: visibleSections.has('features') ? '0.3s' : '0s' }}
              >
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-6 hover:rotate-12 transition-transform duration-300">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                  Hospital Ratings by Race
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  Access transparent ratings on maternal health outcomes by race, helping you make informed decisions about where to receive care.
                </p>
              </div>

              <div 
                className={`bg-green-50 p-8 rounded-xl border border-green-100 transform transition-all duration-700 hover:scale-105 hover:shadow-lg hover:bg-green-100 hover:border-green-300 ${
                  visibleSections.has('features') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
                style={{ transitionDelay: visibleSections.has('features') ? '0.5s' : '0s' }}
              >
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-6 hover:rotate-12 transition-transform duration-300">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                  Hospital Finder
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  Find safer hospitals with comprehensive ratings and patient experiences. Make informed choices for you and your family.
                </p>
              </div>

              <div 
                className={`bg-green-50 p-8 rounded-xl border border-green-100 transform transition-all duration-700 hover:scale-105 hover:shadow-lg hover:bg-green-100 hover:border-green-300 ${
                  visibleSections.has('features') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
                style={{ transitionDelay: visibleSections.has('features') ? '0.7s' : '0s' }}
              >
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-6 hover:rotate-12 transition-transform duration-300">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                  Data Aggregation
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  Aggregate data to identify patterns and systemic issues, enabling advocacy and driving policy change for equitable healthcare.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section 
          id="faq" 
          data-animate-section
          className={`py-20 md:py-32 bg-green-50 transition-all duration-1000 ${
            visibleSections.has('faq') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                About Equity Care
              </h2>
              <p className="text-xl text-gray-700">
                Common questions you might have around privacy, data security, and how Care Equity works
              </p>
            </div>

            <div className="space-y-6">
              <div 
                className={`bg-white p-6 rounded-xl border border-green-100 transform transition-all duration-700 hover:scale-[1.02] hover:shadow-lg ${
                  visibleSections.has('faq') ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'
                }`}
                style={{ transitionDelay: visibleSections.has('faq') ? '0.1s' : '0s' }}
              >
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  What is Care Equity, and why should I use it?
                </h3>
                <p className="text-gray-700 leading-loose">
                  Care Equity is a healthcare quality tracker focused on identifying and exposing inequities in hospital care, especially those affecting people of color and marginalized communities. It provides transparent, data-driven insights into hospital quality, patient experiences, and disparities in outcomes—so patients can make informed decisions and advocate for safer, fairer care.
                </p>
              </div>

              <div 
                className={`bg-white p-6 rounded-xl border border-green-100 transform transition-all duration-700 hover:scale-[1.02] hover:shadow-lg ${
                  visibleSections.has('faq') ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'
                }`}
                style={{ transitionDelay: visibleSections.has('faq') ? '0.3s' : '0s' }}
              >
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Who is Care Equity for?
                </h3>
                <div className="text-gray-700 leading-loose">
                  <p className="mb-3">
                    Care Equity is designed for anyone navigating the healthcare system, especially:
                  </p>
                  <ul className="list-disc list-inside mt-3 space-y-2 text-gray-700 leading-loose">
                    <li>Patients seeking safer, more equitable hospital care</li>
                    <li>Black women and people of color, who are disproportionately affected by healthcare bias</li>
                    <li>Pregnant individuals choosing where to give birth</li>
                    <li>Advocates and researchers working to address healthcare inequities</li>
                    <li>Anyone who has experienced bias, discrimination, or unequal treatment in healthcare</li>
                  </ul>
                </div>
              </div>

              <div 
                className={`bg-white p-6 rounded-xl border border-green-100 transform transition-all duration-700 hover:scale-[1.02] hover:shadow-lg ${
                  visibleSections.has('faq') ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'
                }`}
                style={{ transitionDelay: visibleSections.has('faq') ? '0.5s' : '0s' }}
              >
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  How does Care Equity ensure my privacy?
                </h3>
                <p className="text-gray-700 leading-loose">
                  All reports are completely anonymous. We do not collect personally identifiable information, and submissions cannot be traced back to individuals. Our goal is to surface systemic patterns—not expose personal identities.
                </p>
              </div>

              <div 
                className={`bg-white p-6 rounded-xl border border-green-100 transform transition-all duration-700 hover:scale-[1.02] hover:shadow-lg ${
                  visibleSections.has('faq') ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'
                }`}
                style={{ transitionDelay: visibleSections.has('faq') ? '0.7s' : '0s' }}
              >
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  How are hospital ratings calculated?
                </h3>
                <p className="text-gray-700 leading-loose">
                  Hospital ratings are calculated using aggregated patient reports, health outcomes, and demographic-specific data. By analyzing patterns across race, ethnicity, and other factors, Care Equity highlights disparities that are often hidden in traditional hospital ratings.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section 
          data-animate-section
          className={`py-20 md:py-32 bg-white transition-all duration-1000 ${
            visibleSections.has('cta') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
          id="cta"
        >
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              You've Scrolled Enough. Time to Act.
            </h2>
            <p className="text-xl text-gray-700 mb-10 max-w-2xl mx-auto">
              Start making informed healthcare decisions with the platform built for patients like you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/quality-ratings"
                className="px-8 py-4 bg-green-600 text-white rounded-lg font-semibold text-lg hover:bg-green-700 transition-all hover:scale-110 hover:shadow-xl shadow-lg transform"
              >
                GET STARTED
              </Link>
              <button className="px-8 py-4 border-2 border-green-600 text-green-600 rounded-lg font-semibold text-lg hover:bg-green-50 transition-all hover:scale-110 hover:border-green-700 hover:text-green-700 transform">
                CONTACT US
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-green-500 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-lg font-bold text-white mb-4">Care Equity</h3>
              <p className="text-sm text-green-50">
                Empowering patients with data-driven insights to address healthcare inequities
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Services</h4>
              <ul className="space-y-2 text-sm text-green-50">
                <li><Link href="/quality-ratings" className="hover:text-white transition-colors">Ratings</Link></li>
                <li><Link href="/find-hospitals" className="hover:text-white transition-colors">Find Hospitals</Link></li>
                <li><Link href="/links" className="hover:text-white transition-colors">Newsletters</Link></li>
                <li><Link href="/report" className="hover:text-white transition-colors">Submit Anonymous Form</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-green-50">
                <li><Link href="#faq" className="hover:text-white transition-colors">FAQ</Link></li>
                <li><Link href="#features" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link href="#problem" className="hover:text-white transition-colors">The Problem</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Contact Us</h4>
              <p className="text-sm text-green-50">
                <a href="mailto:info@careequity.org" className="hover:text-white transition-colors">
                  info@careequity.org
                </a>
              </p>
            </div>
          </div>
          <div className="border-t border-green-500 pt-8 text-center">
            <p className="text-sm text-green-50">
              © 2026 Care Equity. All rights reserved.
            </p>
            <p className="text-xs text-green-100 mt-2">
              Code 2040 Hackathon 2026. Team 15.
            </p>
          </div>
        </div>
      </footer>

      {/* CSS Animations for Hero Section */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInFloat {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes pulse-once {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.1);
          }
        }

        .animate-pulse-once {
          animation: pulse-once 1s ease-in-out;
        }
      `}</style>
    </div>
  );
}
