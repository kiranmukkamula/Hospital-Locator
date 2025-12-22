import React from 'react'
import Navbar from './Navbar'
import Img from '../assets/Img.jpg'
import { useNavigate } from 'react-router-dom'
const Home = () => {
    const navigate = useNavigate()
  return (
    <div className="relative min-h-screen overflow-hidden bg-white text-[#1a1a1a]" style={{ fontFamily: 'Manrope, system-ui, sans-serif' }}>
      {/* Import Manrope font */}
      <style>
        {`@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');`}
      </style>

      {/* Subtle gradient overlay */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(240,255,240,1)_0,_rgba(230,250,240,0.5)_100%)]" />

      <div className="relative">
        <Navbar />

        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-24 text-[#1a1a1a]">
        {/* Hero Section */}
        <section id="home" className="grid gap-10 md:grid-cols-2 items-center">
          <div className="space-y-6">
            <p className="text-sm font-semibold tracking-widest uppercase text-[#009b7d]">
              Real-time emergency hospital locator
            </p>
            <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight text-[#1a1a1a]">
              Find the nearest lifesaving care
              <span className="block text-[#009b7d]">in just a few seconds.</span>
            </h1>
            <p className="text-base sm:text-lg text-[#2a2a2a] max-w-xl font-medium">
              Hospice tracks live hospital availability around you – bed counts, emergency capacity, and travel distance –
              so you can choose the best option when every second matters.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              {/* 3D Emergency Button */}
              <button onClick={()=>navigate('/hospitals')}
                type="button"
                className="group relative inline-flex items-center gap-2 rounded-2xl bg-gradient-to-br from-[#00b894] to-[#009b7d] 
                px-8 py-4 text-sm font-bold uppercase tracking-wide text-white shadow-[0_8px_0_rgba(0,122,99,1),0_13px_25px_rgba(0,155,125,0.4)] transition-all 
                hover:translate-y-1 hover:shadow-[0_4px_0_rgba(0,122,99,1),0_8px_20px_rgba(0,155,125,0.3)] active:translate-y-2 active:shadow-[0_0px_0_rgba(0,122,99,1),0_3px_10px_rgba(0,155,125,0.2)] focus-visible:outline-none focus-visible:ring-2 
                focus-visible:ring-[#009b7d] focus-visible:ring-offset-2"
              >
                <span className="relative z-10">Emergency now</span>
                <span className="relative z-10 text-xs font-medium">(share location)</span>
                {/* Shine effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-transparent via-white/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              </button>

              {/* 3D Search Hospitals Button */}
              <button
                onClick={() => navigate('/hospitallist')}
                type="button"
                className="group relative inline-flex items-center gap-2 rounded-2xl bg-gradient-to-br from-white to-[#e0f5ed] px-8 py-4 text-sm font-bold text-[#009b7d] shadow-[0_8px_0_rgba(192,222,213,1),0_13px_25px_rgba(0,155,125,0.15)] transition-all hover:translate-y-1 hover:shadow-[0_4px_0_rgba(192,222,213,1),0_8px_20px_rgba(0,155,125,0.15)] active:translate-y-2 active:shadow-[0_0px_0_rgba(192,222,213,1),0_3px_10px_rgba(0,155,125,0.1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#009b7d] focus-visible:ring-offset-2"
              >
                <span className="relative z-10">Search hospitals</span>
                {/* Shine effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-transparent via-white/40 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              </button>

              {/* Government Scheme Button */}
              <button
                onClick={() => navigate('/govtscheme')}
                type="button"
                className="group relative inline-flex items-center gap-2 rounded-2xl bg-gradient-to-br from-[#ff6b6b] to-[#ee5a6f] px-8 py-4 text-sm font-bold uppercase tracking-wide text-white shadow-[0_8px_0_rgba(200,50,70,1),0_13px_25px_rgba(238,90,111,0.4)] transition-all hover:translate-y-1 hover:shadow-[0_4px_0_rgba(200,50,70,1),0_8px_20px_rgba(238,90,111,0.3)] active:translate-y-2 active:shadow-[0_0px_0_rgba(200,50,70,1),0_3px_10px_rgba(238,90,111,0.2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ee5a6f] focus-visible:ring-offset-2"
              >
                <span className="relative z-10">🏛️ Govt Schemes</span>
                {/* Shine effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-transparent via-white/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              </button>
            </div>

            <div className="flex flex-wrap gap-6 pt-4 text-xs sm:text-sm text-[#2a2a2a] font-medium">
              <div className="flex items-center gap-2">
                <span className="inline-block h-2 w-2 rounded-full bg-[#009b7d] shadow-[0_0_8px_rgba(0,155,125,0.6)]" />
                <span>Live tracking enabled when you allow location access.</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-block h-2 w-2 rounded-full bg-[#009b7d] shadow-[0_0_8px_rgba(0,155,125,0.6)]" />
                <span>Hospital data is refreshed continuously in the background.</span>
              </div>
            </div>
          </div>

         {/* Hero Visual */}
         <div className="relative h-[260px] sm:h-[320px] md:h-[360px]">
  <img
    src={Img}
    alt="Hero"
    className="bg-[#f0fff0] ml-50 absolute inset-3 h-full rounded-3xl "
  />
</div>

        </section>

        {/* Stats / About Section */}
        <section id="about" className="space-y-10">
          <div className="max-w-2xl space-y-3">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1a1a1a]">Built for real emergencies</h2>
            <p className="text-sm sm:text-base text-[#2a2a2a] font-medium">
              Hospice continuously listens to updates from hospitals in your network, tracks your movement in real time,
              and recalculates the safest route so you never lose precious minutes searching.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {/* Glassmorphism Card 1 */}
            <article className="group relative rounded-3xl bg-white/40 backdrop-blur-xl p-6 shadow-[0_8px_32px_rgba(0,155,125,0.15)] border border-white/60 transition-all duration-300 hover:bg-white/60 hover:shadow-[0_12px_48px_rgba(0,155,125,0.25)] hover:-translate-y-2 overflow-hidden">
              {/* Glass shine effect on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <div className="relative z-10">
                <h3 className="text-sm font-bold text-[#009b7d] uppercase tracking-wide">Tracking speed</h3>
                <p className="mt-3 text-4xl font-extrabold text-[#009b7d]">&lt; 2 sec</p>
                <p className="mt-2 text-xs text-[#2a2a2a] font-medium">
                  Location and hospital availability refresh in under two seconds on average for supported regions.
                </p>
              </div>
              
              {/* Accent glow */}
              <div className="absolute -bottom-10 -right-10 h-32 w-32 rounded-full bg-[#009b7d]/20 blur-3xl transition-all group-hover:bg-[#009b7d]/30" />
            </article>

            {/* Glassmorphism Card 2 */}
            <article className="group relative rounded-3xl bg-white/40 backdrop-blur-xl p-6 shadow-[0_8px_32px_rgba(0,155,125,0.15)] border border-white/60 transition-all duration-300 hover:bg-white/60 hover:shadow-[0_12px_48px_rgba(0,155,125,0.25)] hover:-translate-y-2 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <div className="relative z-10">
                <h3 className="text-sm font-bold text-[#009b7d] uppercase tracking-wide">People saved</h3>
                <p className="mt-3 text-4xl font-extrabold text-[#009b7d]">10,000+</p>
                <p className="mt-2 text-xs text-[#2a2a2a] font-medium">
                  Real and simulated deployments have guided thousands of patients to faster emergency care.
                </p>
              </div>
              
              <div className="absolute -bottom-10 -right-10 h-32 w-32 rounded-full bg-[#009b7d]/20 blur-3xl transition-all group-hover:bg-[#009b7d]/30" />
            </article>

            {/* Glassmorphism Card 3 */}
            <article className="group relative rounded-3xl bg-white/40 backdrop-blur-xl p-6 shadow-[0_8px_32px_rgba(0,155,125,0.15)] border border-white/60 transition-all duration-300 hover:bg-white/60 hover:shadow-[0_12px_48px_rgba(0,155,125,0.25)] hover:-translate-y-2 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <div className="relative z-10">
                <h3 className="text-sm font-bold text-[#009b7d] uppercase tracking-wide">Hospitals connected</h3>
                <p className="mt-3 text-4xl font-extrabold text-[#009b7d]">120+</p>
                <p className="mt-2 text-xs text-[#2a2a2a] font-medium">
                  Integrated with a growing network of urban and rural hospitals ready for emergency response.
                </p>
              </div>
              
              <div className="absolute -bottom-10 -right-10 h-32 w-32 rounded-full bg-[#009b7d]/20 blur-3xl transition-all group-hover:bg-[#009b7d]/30" />
            </article>
          </div>

          {/* Supporting visuals */}
          <div className="w-full">
  {/* Wide Glassmorphism Info Card */}
  <div className="group relative rounded-3xl bg-white/40 backdrop-blur-xl p-6 sm:p-8 shadow-[0_8px_32px_rgba(0,155,125,0.15)] border border-white/60 transition-all duration-300 hover:bg-white/60 hover:shadow-[0_12px_48px_rgba(0,155,125,0.25)] overflow-hidden">

    {/* Hover shine */}
    <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

    {/* Content */}
    <div className="relative z-10 max-w-3xl">
      <h3 className="text-lg font-bold text-[#009b7d]">Why tracking matters</h3>

      <p className="mt-3 text-sm text-[#2a2a2a] font-medium">
        In fast-moving emergencies, both the patient and the ambulance may change locations before reaching
        the hospital. Our tracker updates your route in real time and syncs automatically with live hospital capacity.
      </p>

      <p className="mt-3 text-sm text-[#2a2a2a] font-medium">
        This reduces diversions, shortens waiting times, and gives doctors a clearer picture before you arrive.
      </p>
    </div>

    {/* Ambient Glow */}
    <div className="absolute -bottom-16 -right-16 h-48 w-48 rounded-full bg-[#009b7d]/20 blur-3xl transition-all group-hover:bg-[#009b7d]/30" />
  </div>
</div>

        </section>
      </main>

      {/* Footer */}
      <footer className="relative border-t border-[#009b7d]/40 bg-[#009b7d] backdrop-blur py-8 mt-10 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h3 className="text-lg font-extrabold text-white">Hospice</h3>
            <p className="mt-1 text-xs uppercase tracking-wide text-[#e0f5ed] font-bold">Real-time emergency hospital locator</p>
            <p className="mt-3 text-sm text-[#f0fff0] max-w-sm font-medium">
              Built to reduce the time between distress and treatment by connecting people to the right hospital, fast.
            </p>
          </div>

          <div className="text-sm text-[#e0f5ed] space-y-1 font-medium">
            <p className="font-bold text-white">Contact</p>
            <p>Address: 123 Emergency Lane, City Center</p>
            <p>Phone: +91-98765-43210</p>
            <p>
              Email:{' '}
              <a href="mailto:support@hospice-care.app" className="text-[#f0fff0] hover:text-white underline-offset-2 hover:underline font-semibold">
                support@hospice-care.app
              </a>
            </p>
            <p className="mt-2 text-xs text-[#e0f5ed]/90">
              Have suggestions or feedback? Write to us at the email above and help us improve emergency response for
              everyone.
            </p>
          </div>
        </div>
      </footer>
      </div>
    </div>
  )
}

export default Home