export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white mt-10">
      <div className="max-w-7xl mx-auto px-4 py-10 grid md:grid-cols-4 gap-6">

        {/* LOGO */}
        <div>
          <h2 className="text-xl font-bold">MediCare Connect</h2>
          <p className="text-sm text-gray-400 mt-2">
            Modern healthcare appointment system.
          </p>
        </div>

        {/* QUICK LINKS */}
        <div>
          <h3 className="font-semibold mb-2">Quick Links</h3>
          <ul className="space-y-1 text-gray-400">
            <li>Home</li>
            <li>Find Doctors</li>
            <li>About</li>
            <li>Contact</li>
          </ul>
        </div>

        {/* CONTACT */}
        <div>
          <h3 className="font-semibold mb-2">Contact</h3>
          <p className="text-gray-400">support@medicare.com</p>
          <p className="text-gray-400">+880 123 456 789</p>
        </div>

        {/* EMERGENCY */}
        <div>
          <h3 className="font-semibold mb-2">Emergency</h3>
          <p className="text-red-400 font-semibold">999 / 911</p>
        </div>

      </div>

      <div className="text-center py-4 border-t border-gray-700 text-sm text-gray-500">
        © 2026 MediCare Connect. All rights reserved.
      </div>
    </footer>
  );
}