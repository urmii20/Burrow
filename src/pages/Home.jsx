import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Shield, MapPin, Calendar, ArrowRight } from 'lucide-react';
import WarehouseMap from '../components/Map/WarehouseMap';
import { warehouses } from '../data/mockData';

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
    <div className="min-h-screen bg-burrow-background">
      <section className="bg-gradient-to-br from-burrow-background to-burrow-primary/10 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl font-bold text-burrow-text-primary mb-6">
              Take Control <span className="text-burrow-primary">of Your Deliveries</span>
            </h1>
            <p className="text-xl text-burrow-text-secondary mb-10 max-w-3xl mx-auto italic">
              Reschedule anytime. Perfect for gifts, travel, or safe storage.
            </p>
            <button
              onClick={handleGetStarted}
              className="bg-burrow-primary text-white px-10 py-4 rounded-lg text-lg font-semibold hover:bg-burrow-accent transition-all inline-flex items-center space-x-3"
            >
              <span>Get Started</span>
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-burrow-text-primary mb-4">Why Choose Burrow?</h2>
            <p className="text-lg text-burrow-text-secondary max-w-2xl mx-auto">
              Trusted storage and flexible delivery options at your fingertips
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-16">
            {benefits.map((benefit, idx) => (
              <div
                key={idx}
                className={`p-8 rounded-lg shadow-lg transition-transform transform hover:-translate-y-2 ${
                  idx % 3 === 0
                    ? 'bg-burrow-accent/20'
                    : idx % 3 === 1
                      ? 'bg-burrow-secondary/20'
                      : 'bg-burrow-primary/20'
                }`}
              >
                <div
                  className={`text-4xl mb-4 flex items-center justify-center ${
                    idx % 3 === 0
                      ? 'text-burrow-accent'
                      : idx % 3 === 1
                        ? 'text-burrow-secondary'
                        : 'text-burrow-primary'
                  }`}
                >
                  <benefit.icon className="h-8 w-8" />
                </div>
                <h4 className="font-semibold text-burrow-text-primary mb-2 text-center">{benefit.title}</h4>
                <p className="text-burrow-text-secondary text-sm text-center">{benefit.description}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div className="h-fit rounded-lg shadow-md overflow-hidden">
              <WarehouseMap
                onWarehouseSelect={setSelectedWarehouse}
                selectedWarehouseId={selectedWarehouse?.id}
              />
            </div>

            <div className="flex flex-col space-y-4 max-h-[650px] overflow-y-auto">
              {warehouses.map((warehouse) => (
                <div
                  key={warehouse.id}
                  className={`p-6 border-2 rounded-lg cursor-pointer transition-all ${
                    selectedWarehouse?.id === warehouse.id
                      ? 'border-burrow-primary bg-burrow-primary/10 shadow-md'
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                  }`}
                  onClick={() => setSelectedWarehouse(warehouse)}
                >
                  <h5 className="font-semibold text-burrow-text-primary">{warehouse.name}</h5>
                  <p className="text-burrow-text-secondary">{warehouse.address}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-burrow-text-secondary">
                    <span>Capacity: {warehouse.capacity}</span>
                    <span>Hours: {warehouse.operatingHours}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-burrow-text-primary mb-4">How It Works</h2>
            <p className="text-lg text-burrow-text-secondary">Three simple steps to take control of your deliveries</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {howItWorks.map((step, index) => (
              <div key={index} className="text-center">
                <div className="w-20 h-20 bg-burrow-primary text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  {step.step}
                </div>
                <h3 className="text-xl font-semibold text-burrow-text-primary mb-3">{step.title}</h3>
                <p className="text-burrow-text-secondary">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-burrow-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Take Control of Your Deliveries?
          </h2>
          <p className="text-xl text-burrow-background mb-8">
            Join thousands of customers who trust Burrow with their packages
          </p>
          <button
            onClick={handleGetStarted}
            className="bg-white text-burrow-primary px-10 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-all inline-flex items-center space-x-3"
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
