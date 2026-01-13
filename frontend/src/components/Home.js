import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="min-h-screen overflow-hidden">
      {/* Hero Section */}
      <div className="gradient-bg text-white py-24 relative overflow-hidden">
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-white bg-opacity-10 rounded-full animate-float"></div>
        <div className="absolute top-40 right-20 w-32 h-32 bg-white bg-opacity-10 rounded-full animate-float" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-20 left-1/4 w-16 h-16 bg-white bg-opacity-10 rounded-full animate-float" style={{animationDelay: '2s'}}></div>
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <h1 className="text-6xl md:text-7xl font-display font-black mb-6 animate-fade-in-up">
            <span className="bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
              Decentralized Voting
            </span>
          </h1>
          <p className="text-xl md:text-2xl mb-10 max-w-3xl mx-auto font-light animate-fade-in-up opacity-90" style={{animationDelay: '0.2s'}}>
            Experience transparent, secure, and tamper-proof voting powered by blockchain technology
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 animate-fade-in-up" style={{animationDelay: '0.4s'}}>
            <Link
              to="/register"
              className="group bg-white text-primary-600 px-10 py-4 rounded-full font-bold text-lg shadow-2xl hover:shadow-glow transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
            >
              <span>Get Started</span>
              <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link
              to="/elections"
              className="group bg-transparent border-2 border-white px-10 py-4 rounded-full font-bold text-lg hover:bg-white hover:text-primary-600 transition-all duration-300 backdrop-blur-sm flex items-center justify-center gap-2"
            >
              <span>View Elections</span>
              <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-20">
        <h2 className="text-4xl md:text-5xl font-display font-bold text-center mb-4 text-gray-800 animate-fade-in-up">
          Key Features
        </h2>
        <p className="text-center text-gray-600 mb-16 max-w-2xl mx-auto animate-fade-in-up">
          Built with cutting-edge blockchain technology to ensure transparency and security
        </p>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-2xl card-shadow group stagger-item hover:shadow-glow">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-primary-600 rounded-2xl flex items-center justify-center mb-6 transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-2xl font-display font-bold mb-3 text-gray-800">Voter Registration</h3>
            <p className="text-gray-600 leading-relaxed">
              Secure voter registration with eligibility verification and unique cryptographic credentials.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl card-shadow group stagger-item hover:shadow-glow-purple">
            <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-600 rounded-2xl flex items-center justify-center mb-6 transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-2xl font-display font-bold mb-3 text-gray-800">Anonymous Voting</h3>
            <p className="text-gray-600 leading-relaxed">
              Cast your vote anonymously while maintaining integrity and transparency.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl card-shadow group stagger-item hover:shadow-glow">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-600 rounded-2xl flex items-center justify-center mb-6 transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
              </svg>
            </div>
            <h3 className="text-2xl font-display font-bold mb-3 text-gray-800">Auto Results</h3>
            <p className="text-gray-600 leading-relaxed">
              Real-time vote counting with automatic calculation and transparent display.
            </p>
          </div>
        </div>
      </div>

      {/* Use Cases Section */}
      <div className="bg-gradient-to-br from-gray-50 to-blue-50 py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-display font-bold text-center mb-4 text-gray-800 animate-fade-in-up">
            Perfect For
          </h2>
          <p className="text-center text-gray-600 mb-16 max-w-2xl mx-auto">
            Versatile voting solution for various democratic processes
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: '🏆', title: 'Scientific Club Elections', color: 'from-yellow-400 to-orange-500' },
              { icon: '📊', title: 'Course Polls', color: 'from-blue-400 to-cyan-500' },
              { icon: '📝', title: 'Project Evaluations', color: 'from-green-400 to-emerald-500' },
              { icon: '⭐', title: 'Competition Judging', color: 'from-purple-400 to-pink-500' }
            ].map((useCase, index) => (
              <div key={index} className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 text-center group transform hover:-translate-y-2 stagger-item">
                <div className={`w-20 h-20 bg-gradient-to-br ${useCase.color} rounded-2xl flex items-center justify-center text-4xl mb-4 mx-auto transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 shadow-lg`}>
                  {useCase.icon}
                </div>
                <h3 className="font-display font-bold text-gray-800 text-lg">{useCase.title}</h3>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="container mx-auto px-4 py-20">
        <h2 className="text-4xl md:text-5xl font-display font-bold text-center mb-4 text-gray-800">
          How It Works
        </h2>
        <p className="text-center text-gray-600 mb-16 max-w-2xl mx-auto">
          Simple four-step process to participate in blockchain voting
        </p>
        <div className="max-w-4xl mx-auto">
          <div className="space-y-6">
            {[
              { num: 1, title: 'Register as Voter', desc: 'Create your account and receive unique voter credentials', color: 'from-blue-500 to-cyan-500' },
              { num: 2, title: 'Browse Elections', desc: 'View available elections and their candidates', color: 'from-purple-500 to-pink-500' },
              { num: 3, title: 'Cast Your Vote', desc: 'Submit your vote securely and anonymously', color: 'from-green-500 to-emerald-500' },
              { num: 4, title: 'View Results', desc: 'Access transparent, real-time voting results', color: 'from-orange-500 to-red-500' }
            ].map((step, index) => (
              <div key={index} className="flex items-start group stagger-item">
                <div className={`flex-shrink-0 w-16 h-16 bg-gradient-to-br ${step.color} text-white rounded-2xl flex items-center justify-center font-display font-bold text-2xl shadow-lg transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
                  {step.num}
                </div>
                <div className="ml-8 flex-1 bg-white p-6 rounded-2xl shadow-md group-hover:shadow-xl transition-all duration-300">
                  <h3 className="text-2xl font-display font-bold mb-2 text-gray-800">{step.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="gradient-bg text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-6 animate-fade-in-up">
            Ready to Get Started?
          </h2>
          <p className="text-xl mb-10 max-w-2xl mx-auto opacity-90 animate-fade-in-up" style={{animationDelay: '0.2s'}}>
            Join the future of democratic voting with blockchain technology
          </p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 bg-white text-primary-600 px-10 py-4 rounded-full font-bold text-lg shadow-2xl hover:shadow-glow transform hover:scale-105 transition-all duration-300 animate-fade-in-up"
            style={{animationDelay: '0.4s'}}
          >
            <span>Create Your Account</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
