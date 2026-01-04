import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Star, ShoppingBag, Gift } from 'lucide-react';

const Home = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="space-y-20">
      {/* Hero Section */}
      <section className="text-center py-32 bg-gradient-to-br from-[#A8C5D1]/30 to-[#B8D4DB]/50 rounded-2xl backdrop-blur-sm">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-6xl md:text-8xl font-extrabold text-white mb-4 tracking-tight drop-shadow-lg">
            BeautyShop
          </h1>
          <p className="text-lg md:text-xl text-white/90 mb-4 uppercase tracking-widest font-light">
            L'Alliance de la Science & de la Nature
          </p>
          <p className="text-xl md:text-2xl text-white mb-12 max-w-2xl mx-auto leading-relaxed font-medium">
            Pour une nouvelle génération de soins
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link 
              to="/products" 
              className="bg-gray-900 text-white px-12 py-4 rounded-full font-semibold text-base hover:bg-gray-800 transition-all duration-300 shadow-xl"
            >
              Découvrir
            </Link>
            {!isAuthenticated && (
              <Link 
                to="/register" 
                className="border-2 border-white text-white px-12 py-4 rounded-full font-semibold text-base hover:bg-white/10 transition-all duration-300"
              >
                Écrire maintenant
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="grid md:grid-cols-4 gap-6">
        <div className="text-center p-8 bg-white/70 backdrop-blur-md rounded-xl hover:bg-white/90 transition-all">
          <div className="w-16 h-16 bg-white rounded-full border-2 border-gray-200 flex items-center justify-center mx-auto mb-6">
            <Star className="w-8 h-8 text-gray-700" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-3 uppercase tracking-wide">Capillaire</h3>
          <p className="text-gray-600 text-sm">Soins professionnels pour vos cheveux</p>
        </div>
        <div className="text-center p-8 bg-white/70 backdrop-blur-md rounded-xl hover:bg-white/90 transition-all">
          <div className="w-16 h-16 bg-white rounded-full border-2 border-gray-200 flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-8 h-8 text-gray-700" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-3 uppercase tracking-wide">Corps</h3>
          <p className="text-gray-600 text-sm">Produits pour sublimer votre peau</p>
        </div>
        <div className="text-center p-8 bg-white/70 backdrop-blur-md rounded-xl hover:bg-white/90 transition-all">
          <div className="w-16 h-16 bg-white rounded-full border-2 border-gray-200 flex items-center justify-center mx-auto mb-6">
            <Gift className="w-8 h-8 text-gray-700" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-3 uppercase tracking-wide">Visage</h3>
          <p className="text-gray-600 text-sm">Soins adaptés à votre type de peau</p>
        </div>
        <div className="text-center p-8 bg-white/70 backdrop-blur-md rounded-xl hover:bg-white/90 transition-all">
          <div className="w-16 h-16 bg-white rounded-full border-2 border-gray-200 flex items-center justify-center mx-auto mb-6">
            <Star className="w-8 h-8 text-gray-700" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-3 uppercase tracking-wide">Pharma</h3>
          <p className="text-gray-600 text-sm">Solutions pharmaceutiques de qualité</p>
        </div>
      </section>

      {/* CTA */}
      <section className="text-center py-20 bg-gradient-to-br from-[#A8C5D1]/40 to-[#B8D4DB]/60 text-gray-800 rounded-xl backdrop-blur-sm">
        <h2 className="text-3xl md:text-4xl font-light mb-4 uppercase tracking-widest">Découvrir</h2>
        <p className="text-lg text-gray-700 mb-8 max-w-2xl mx-auto">Besoin d'un conseil personnalisé ?</p>
        <Link 
          to="/products" 
          className="inline-block bg-gray-900 text-white px-10 py-4 rounded-full font-semibold hover:bg-gray-800 transition-all duration-300 shadow-lg"
        >
          Écrire maintenant
        </Link>
      </section>
    </div>
  );
};

export default Home;
