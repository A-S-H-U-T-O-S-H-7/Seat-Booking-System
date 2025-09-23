const HeroBackground = () => {
  return (
    <>
      {/* Enhanced Layered Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-yellow-50/95 to-red-50/85"></div>
      <div className="absolute inset-0 bg-gradient-to-tr from-yellow-100/30 via-transparent to-orange-100/25"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-orange-200/30 via-transparent to-transparent"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-yellow-200/25 via-transparent to-transparent"></div>
      
      {/* Animated Floating Background Elements */}
      <div className="absolute top-16 right-16 w-72 h-72 bg-gradient-to-r from-orange-300/25 to-yellow-300/25 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-28 left-12 w-56 h-56 bg-gradient-to-r from-red-300/20 to-orange-300/20 rounded-full blur-2xl animate-pulse delay-1000"></div>
      <div className="absolute top-1/3 right-1/4 w-40 h-40 bg-gradient-to-r from-yellow-400/15 to-red-400/15 rounded-full blur-xl animate-pulse delay-500"></div>
      <div className="absolute bottom-1/3 left-1/4 w-24 h-24 bg-gradient-to-r from-orange-400/20 to-yellow-400/20 rounded-full blur-lg animate-pulse delay-700"></div>
    </>
  );
};

export default HeroBackground;
