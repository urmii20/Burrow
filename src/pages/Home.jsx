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
    <div className="min-h-screen bg-burrow-background page-fade">
      <section className="section-hero">
        <div className="layout-container">
          <div className="text-center">
            <h1 className="text-5xl font-bold text-burrow-text-primary mb-6">
              Take Control <span className="text-burrow-primary">of Your Deliveries</span>
            </h1>
            <p className="text-xl text-burrow-text-secondary mb-10 max-w-3xl mx-auto italic">
              Reschedule anytime. Perfect for gifts, travel, or safe storage.
            </p>
            <button
              onClick={handleGetStarted}
              className="btn-primary btn-lg"
            >
              <span>Get Started</span>
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </section>

      <section className="section-muted">
        <div className="layout-container">
          <div className="section-heading">
            <h2 className="section-heading-title mb-4">Why Choose Burrow?</h2>
            <p className="section-heading-subtitle max-w-2xl mx-auto">
              Trusted storage and flexible delivery options at your fingertips
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-16 fade-stagger">
            {benefits.map((benefit, idx) => (
              <div
                key={idx}
                className={`feature-card ${
                  idx % 3 === 0
                    ? 'bg-burrow-accent/20'
                    : idx % 3 === 1
                      ? 'bg-burrow-secondary/20'
                      : 'bg-burrow-primary/20'
                }`}
              >
                <div
                  className={`feature-icon ${
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
            <div className="card overflow-hidden">
              <WarehouseMap
                onWarehouseSelect={setSelectedWarehouse}
                selectedWarehouseId={selectedWarehouse?.id}
              />
            </div>

            <div className="list-panel fade-stagger">
              {warehouses.map((warehouse) => (
                <div
                  key={warehouse.id}
                  className={`list-card ${
                    selectedWarehouse?.id === warehouse.id
                      ? 'list-card-active'
                      : 'list-card-inactive'
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

      <section className="section-white">
        <div className="layout-container">
          <div className="section-heading">
            <h2 className="section-heading-title mb-4">How It Works</h2>
            <p className="section-heading-subtitle">Three simple steps to take control of your deliveries</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 fade-stagger">
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

      <section className="section-primary">
        <div className="layout-container text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Take Control of Your Deliveries?
          </h2>
          <p className="text-xl text-burrow-background mb-8">
            Join thousands of customers who trust Burrow with their packages
          </p>
          <button
            onClick={handleGetStarted}
            className="btn-secondary btn-lg"
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
