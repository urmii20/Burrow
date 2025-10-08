import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Shield, MapPin, Calendar, ArrowRight } from 'lucide-react';
import WarehouseMap from '../components/Map/WarehouseMap';
import { warehouses } from '../data/mockData';
import mascot from '../assets/mascot-4.png';
import '../styles/index.css';

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
    { icon: Calendar, title: 'Perfect Gift Timing', description: 'Schedule deliveries for birthdays, anniversaries, and special occasions' },
    { icon: Shield, title: 'Avoid Porch Piracy', description: "Secure storage until you're ready to receive your packages" },
    { icon: Clock, title: 'Vacation Holds', description: "Store packages while you're away and schedule delivery for your return" },
    { icon: MapPin, title: 'Flexible Locations', description: 'Redirect office deliveries to home when working remotely' }
  ];

  const howItWorks = [
    { step: '1', title: 'Order to Our Warehouse', description: 'Use our warehouse address as your delivery location when shopping online' },
    { step: '2', title: 'Schedule Your Delivery', description: 'Choose your preferred date and time slot for final delivery' },
    { step: '3', title: 'We Handle the Rest', description: 'We receive, store, and deliver your package exactly when you want it' }
  ];

  return (
    <div className="bg-burrow-background page-fade">

      {/* Hero Section */}
      <section className="hero-section max-h-[500px] flex items-center">
        <div className="layout-container flex items-center gap-12">
          <div className="hero-text flex-1">
            <h1 className="hero-title text-5xl font-bold mb-4">
              Take Control <span className="highlight">of Your Deliveries</span>
            </h1>
            <p className="hero-subtitle text-xl mb-6">
              Reschedule anytime. Perfect for gifts, travel, or safe storage.
            </p>
            <button
              onClick={handleGetStarted}
              className="btn-primary btn-lg shadow-md inline-flex items-center gap-2"
            >
              Get Started <ArrowRight className="h-5 w-5" />
            </button>
          </div>

          <div className="hero-mascot flex-1 flex justify-center lg:justify-end">
            <img
              src={mascot}
              alt="Burrow mascot"
              className="mascot-img lg:w-[rem]"
            />
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="section-muted py-16">
        <div className="layout-container">
          <div className="section-heading text-center mb-12">
            <h2 className="section-heading-title mb-4">Why Choose Burrow?</h2>
            <p className="section-heading-subtitle max-w-2xl mx-auto">
              Trusted storage and flexible delivery options at your fingertips
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 fade-stagger">
            {benefits.map((benefit, idx) => (
              <div
                key={idx}
                className={`card p-6 text-center ${
                  idx % 3 === 0
                    ? 'bg-burrow-accent/20'
                    : idx % 3 === 1
                    ? 'bg-burrow-secondary/20'
                    : 'bg-burrow-primary/20'
                }`}
              >
                <benefit.icon className="h-8 w-8 mx-auto mb-3 text-current" />
                <h4 className="font-semibold text-burrow-text-primary mb-2">
                  {benefit.title}
                </h4>
                <p className="text-burrow-text-secondary text-sm">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Warehouse Map & List */}
      <section className="section-white py-16">
        <div className="layout-container grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="card overflow-hidden">
            <WarehouseMap
              onWarehouseSelect={setSelectedWarehouse}
              selectedWarehouseId={selectedWarehouse?.id}
            />
          </div>

          <div className="space-y-4 fade-stagger">
            {warehouses.map((warehouse) => (
              <div
                key={warehouse.id}
                onClick={() => setSelectedWarehouse(warehouse)}
                className={`card p-4 cursor-pointer ${
                  selectedWarehouse?.id === warehouse.id
                    ? 'border-burrow-primary border-2'
                    : 'border border-gray-200'
                }`}
              >
                <h5 className="font-semibold text-burrow-text-primary">
                  {warehouse.name}
                </h5>
                <p className="text-burrow-text-secondary">{warehouse.address}</p>
                <div className="flex items-center gap-4 mt-2 text-xs text-burrow-text-secondary">
                  <span>Capacity: {warehouse.capacity}</span>
                  <span>Hours: {warehouse.operatingHours}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="section-muted">
        <div className="layout-container">
          <div className="section-heading text-center mb-12">
            <h2 className="section-heading-title mb-4">How It Works</h2>
            <p className="section-heading-subtitle">
              Three simple steps to take control of your deliveries
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 fade-stagger text-center">
            {howItWorks.map((step, idx) => (
              <div key={idx}>
                <div
                className="step-circle mb-4"
                >
                  {step.step}</div>
                <h3 className="text-xl font-semibold text-burrow-text-primary mb-2">
                  {step.title}
                </h3>
                <p className="text-burrow-text-secondary">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
