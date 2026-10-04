export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto grid max-w-7xl gap-4 px-4 py-8 text-sm text-slate-500 md:grid-cols-3 lg:px-8">
        <p className="font-semibold text-ink">Smart Used Vehicle Price Prediction & Marketplace</p>
        <p>AI pricing, verified listings, spare parts, live chat, and nearby discovery.</p>
        <p className="md:text-right">Built with React, Flask, MySQL, Socket.io, and scikit-learn.</p>
      </div>
    </footer>
  );
}
