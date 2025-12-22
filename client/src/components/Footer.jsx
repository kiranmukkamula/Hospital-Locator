import React from 'react'

const Footer = () => {
  return (
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
  )
}

export default Footer
