export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cs-hero-from via-[#1a0a0a] to-cs-hero-to">
      <div className="w-full max-w-[420px] p-8 bg-white rounded-2xl shadow-xl">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="w-8 h-8 bg-cs-red text-white font-bold flex items-center justify-center text-sm">
              CS
            </div>
            <h1 className="text-2xl font-bold text-cs-black">OneSpace</h1>
          </div>
          <p className="text-cs-gray-500 text-sm">Operations platform for CS Coworking</p>
        </div>
        <p className="text-center text-sm text-cs-gray-500">Login content goes here (Phase 1/2).</p>
      </div>
    </div>
  );
}
