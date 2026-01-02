import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'
import { User } from 'lucide-react'

const Doctor = () => {
  const navigate = useNavigate()
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchDoctors()
  }, [])

  const fetchDoctors = async () => {
    try {
      setLoading(true)
      // Replace with your actual API endpoint
      const response = await fetch('http://localhost:5000/api/doctors')
      
      if (!response.ok) {
        throw new Error('Failed to fetch doctors')
      }
      
      const data = await response.json()
      setDoctors(data)
      setError(null)
    } catch (err) {
      setError(err.message)
      console.error('Error fetching doctors:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleMessage = (doctor) => {
    // Navigate to message page with doctor info
    navigate(`/message/${doctor._id || doctor.id}`, { state: { doctor } })
  }

  // Generate consistent color for each doctor based on their name
  const getColorForDoctor = (name) => {
    const colors = [
      'from-[#00b894] to-[#009b7d]',
      'from-[#0984e3] to-[#0652dd]',
      'from-[#6c5ce7] to-[#5f3dc4]',
      'from-[#fd79a8] to-[#e84393]',
      'from-[#fdcb6e] to-[#f39c12]',
      'from-[#00cec9] to-[#00a8a8]'
    ]
    const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length
    return colors[index]
  }

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

        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12 text-[#1a1a1a]">
          {/* Header Section */}
          <section className="space-y-4">
            <p className="text-sm font-semibold tracking-widest uppercase text-[#009b7d]">
              Medical Professionals
            </p>
            <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight text-[#1a1a1a]">
              Connect with <span className="text-[#009b7d]">Qualified</span> Doctors
            </h1>
           
          </section>

          {/* Doctors List */}
          <section className="space-y-6">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="relative">
                  <div className="h-16 w-16 rounded-full border-4 border-[#e0f5ed] border-t-[#009b7d] animate-spin" />
                  <p className="mt-4 text-sm font-medium text-[#009b7d]">Loading doctors...</p>
                </div>
              </div>
            ) : error ? (
              <div className="rounded-3xl bg-red-50/80 backdrop-blur-xl p-8 shadow-[0_8px_32px_rgba(239,68,68,0.15)] border border-red-100">
                <p className="text-red-600 font-medium">Error: {error}</p>
                <button
                  onClick={fetchDoctors}
                  className="mt-4 px-6 py-2 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors"
                >
                  Retry
                </button>
              </div>
            ) : doctors.length === 0 ? (
              <div className="rounded-3xl bg-white/40 backdrop-blur-xl p-12 shadow-[0_8px_32px_rgba(0,155,125,0.15)] border border-white/60 text-center">
                <p className="text-[#2a2a2a] font-medium">No doctors available at the moment.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {doctors.map((doctor) => (
                  <article
                    key={doctor._id || doctor.id}
                    className="group relative rounded-3xl bg-white/40 backdrop-blur-xl p-6 shadow-[0_8px_32px_rgba(0,155,125,0.15)] border border-white/60 transition-all duration-300 hover:bg-white/60 hover:shadow-[0_12px_48px_rgba(0,155,125,0.25)] hover:-translate-y-1 overflow-hidden"
                  >
                    {/* Hover shine effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {/* Content */}
                    <div className="relative z-10 flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                      {/* Doctor Icon */}
                      <div className="flex-shrink-0">
                        <div className={`relative h-24 w-24 sm:h-28 sm:w-28 rounded-2xl overflow-hidden shadow-lg ring-4 ring-white/50 group-hover:ring-[#009b7d]/30 transition-all bg-gradient-to-br ${getColorForDoctor(doctor.name)} flex items-center justify-center`}>
                          <User className="h-12 w-12 sm:h-14 sm:w-14 text-white" strokeWidth={2} />
                        </div>
                      </div>

                      {/* Doctor Info */}
                      <div className="flex-1 space-y-2">
                        <div>
                          <h3 className="text-xl sm:text-2xl font-bold text-[#1a1a1a]">
                            Dr. {doctor.name}
                          </h3>
                      
                        </div>

                        {doctor.specialization && (
                          <p className="text-sm text-[#2a2a2a] font-medium">
                            {doctor.specialization}
                          </p>
                        )}

                        {doctor.experience && (
                          <p className="text-xs text-[#4a4a4a] font-medium">
                            {doctor.experience} years of experience
                          </p>
                        )}

                        <div className="flex flex-wrap gap-4 items-center">
                          {doctor.hospital && (
                            <div className="flex items-center gap-2 text-xs text-[#4a4a4a] font-medium">
                              <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#009b7d]" />
                              <span>{doctor.hospital}</span>
                            </div>
                          )}

                          {doctor.availability && (
                            <div className="flex items-center gap-2 text-xs font-semibold">
                              <span className={`inline-block h-1.5 w-1.5 rounded-full ${
                                doctor.availability === 'Available' ? 'bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.8)]' :
                                doctor.availability === 'Busy' ? 'bg-yellow-500 shadow-[0_0_6px_rgba(234,179,8,0.8)]' :
                                'bg-gray-400'
                              }`} />
                              <span className={
                                doctor.availability === 'Available' ? 'text-green-600' :
                                doctor.availability === 'Busy' ? 'text-yellow-600' :
                                'text-gray-500'
                              }>{doctor.availability}</span>
                            </div>
                          )}

                          {doctor.rating > 0 && (
                            <div className="flex items-center gap-1 text-xs text-[#4a4a4a] font-medium">
                              <span className="text-yellow-500">★</span>
                              <span>{doctor.rating.toFixed(1)}</span>
                            </div>
                          )}

                          {doctor.patients > 0 && (
                            <div className="text-xs text-[#4a4a4a] font-medium">
                              {doctor.patients} patients
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Message Button */}
                      <div className="flex-shrink-0 w-full sm:w-auto">
                        <button
                          onClick={() => handleMessage(doctor)}
                          type="button"
                          className="w-full sm:w-auto group/btn relative inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-[#00b894] to-[#009b7d] px-6 py-3 text-sm font-bold text-white shadow-[0_4px_0_rgba(0,122,99,1),0_8px_20px_rgba(0,155,125,0.3)] transition-all hover:translate-y-0.5 hover:shadow-[0_2px_0_rgba(0,122,99,1),0_4px_15px_rgba(0,155,125,0.2)] active:translate-y-1 active:shadow-[0_0px_0_rgba(0,122,99,1),0_2px_10px_rgba(0,155,125,0.15)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#009b7d] focus-visible:ring-offset-2"
                        >
                          <span className="relative z-10">Message</span>
                          {/* Shine effect */}
                          <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-transparent via-white/30 to-transparent opacity-0 transition-opacity group-hover/btn:opacity-100" />
                        </button>
                      </div>
                    </div>

                    {/* Ambient glow */}
                    <div className="absolute -bottom-10 -right-10 h-32 w-32 rounded-full bg-[#009b7d]/20 blur-3xl transition-all group-hover:bg-[#009b7d]/30" />
                  </article>
                ))}
              </div>
            )}
          </section>

          {/* Info Section */}
          <section className="pt-6">
            <div className="group relative rounded-3xl bg-white/40 backdrop-blur-xl p-6 sm:p-8 shadow-[0_8px_32px_rgba(0,155,125,0.15)] border border-white/60 transition-all duration-300 hover:bg-white/60 hover:shadow-[0_12px_48px_rgba(0,155,125,0.25)] overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <div className="relative z-10 max-w-3xl">
                <h3 className="text-lg font-bold text-[#009b7d]">Direct communication with medical experts</h3>
                <p className="mt-3 text-sm text-[#2a2a2a] font-medium">
                  Send messages directly to qualified doctors for consultations, follow-ups, or second opinions. Our secure messaging system ensures your privacy and enables timely responses from healthcare professionals.
                </p>
                <div className="flex items-center gap-2 mt-4 text-xs text-[#4a4a4a] font-medium">
                  <span className="inline-block h-2 w-2 rounded-full bg-[#009b7d] shadow-[0_0_8px_rgba(0,155,125,0.6)]" />
                  <span>All communications are encrypted and HIPAA compliant.</span>
                </div>
              </div>

              <div className="absolute -bottom-16 -right-16 h-48 w-48 rounded-full bg-[#009b7d]/20 blur-3xl transition-all group-hover:bg-[#009b7d]/30" />
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </div>
  )
}

export default Doctor