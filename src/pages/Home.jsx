import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Shield, MapPin, Calendar, ArrowRight, CheckCircle } from 'lucide-react';
import WarehouseMap from '../components/Map/WarehouseMap';

const Home = () => {
  const navigate = useNavigate();
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);

  const handleGetStarted = () => {
    if (selectedWarehouse) {
      localStorage.setItem('selectedWarehouse', JSON.stringify(selectedWarehouse));
    }
    navigate('/register');
  };

  const benefits = [
    {
      icon: Calendar,
      title: 'Perfect Gift Timing',
      description: 'Schedule deliveries for birthdays, anniversaries, and special occasions'
    },
    {
      icon: Shield,
      title: 'Avoid Porch Piracy',
      description: "Secure storage until you're ready to receive your packages"
    },
    {
      icon: Clock,
      title: 'Vacation Holds',
      description: "Store packages while you're away and schedule delivery for your return"
    },
    {
      icon: MapPin,
      title: 'Flexible Locations',
      description: 'Redirect office deliveries to home when working remotely'
    }
  ];

  const howItWorks = [
    {
      step: '1',
      title: 'Order to Our Warehouse',
      description: 'Use our warehouse address as your delivery location when shopping online'
    },
    {
      step: '2',
      title: 'Schedule Your Delivery',
      description: 'Choose your preferred date and time slot for final delivery'
    },
    {
      step: '3',
      title: 'We Handle the Rest',
      description: 'We receive, store, and deliver your package exactly when you want it'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Delivery Rescheduling Made
              <span className="text-blue-500"> Possible</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Take control of your deliveries. Schedule them on your terms. Perfect for gifts,
              vacation holds, and avoiding porch piracy.
            </p>
            <button
              onClick={handleGetStarted}
              className="bg-blue-500 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-600 transition-colors inline-flex items-center space-x-2"
            >
              <span>Get Started</span>
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Choose Your Nearest Warehouse
            </h2>
            <p className="text-lg text-gray-600">
              We have strategically located warehouses across India to serve you better
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <WarehouseMap
                onWarehouseSelect={setSelectedWarehouse}
                selectedWarehouseId={selectedWarehouse?.id}
              />
            </div>

            <div className="space-y-6">
              <h3 className="text-2xl font-semibold text-gray-900">Why Choose Burrow?</h3>

              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <benefit.icon className="h-6 w-6 text-blue-500" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">{benefit.title}</h4>
                      <p className="text-gray-600">{benefit.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              {selectedWarehouse && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="font-medium text-green-800">Warehouse Selected</span>
                  </div>
                  <p className="text-green-700 mt-1">{selectedWarehouse.name}</p>
                  <p className="text-green-600 text-sm">{selectedWarehouse.address}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-lg text-gray-600">Three simple steps to take control of your deliveries</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {howItWorks.map((step, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-blue-500 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  {step.step}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-blue-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Take Control of Your Deliveries?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of customers who trust Burrow with their packages
          </p>
          <button
            onClick={handleGetStarted}
            className="bg-white text-blue-500 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center space-x-2"
          >
            <span>Get Started Today</span>
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </section>
    </div>
  );
};

export default Home;
