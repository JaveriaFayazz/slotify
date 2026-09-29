"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import {
  getAllBusinesses,
  Business,
} from "../../services/business.service";

import {
  getBusinessServices,
  Service,
} from "../../services/service.service";

import {
  getStoredUser,
  logout,
  User,
} from "../../services/auth.service";

export default function BusinessDetailsPage() {
  const params = useParams();

  const businessId = String(params.id);

  const [user, setUser] = useState<User | null>(null);
  const [business, setBusiness] = useState<Business | null>(null);
  const [services, setServices] = useState<Service[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setUser(getStoredUser());

    async function loadBusiness() {
      try {
        setLoading(true);
        setError("");

        // Get all businesses and find the selected one
        const businesses = await getAllBusinesses();

        const selectedBusiness = businesses.find(
          (item) => item.id === businessId
        );

        if (!selectedBusiness) {
          setError("Business not found");
          return;
        }

        setBusiness(selectedBusiness);

        // Get services belonging to this business
        const businessServices =
          await getBusinessServices(businessId);

        setServices(businessServices);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load business"
        );
      } finally {
        setLoading(false);
      }
    }

    loadBusiness();
  }, [businessId]);

  function handleLogout() {
    logout();
    window.location.href = "/login";
  }

  if (loading) {
    return (
      <main className="dashboard-page">
        <nav className="navbar">
          <Link href="/" className="logo">
            Slotify
          </Link>

          <div className="nav-links">
            <Link href="/dashboard">Dashboard</Link>

            <Link href="/bookings">My Bookings</Link>

            <button
              onClick={handleLogout}
              className="logout-button"
            >
              Logout
            </button>
          </div>
        </nav>

        <div className="business-state">
          Loading business...
        </div>
      </main>
    );
  }

  if (error || !business) {
    return (
      <main className="dashboard-page">
        <nav className="navbar">
          <Link href="/" className="logo">
            Slotify
          </Link>

          <div className="nav-links">
            <Link href="/dashboard">Dashboard</Link>

            <Link href="/bookings">My Bookings</Link>

            <button
              onClick={handleLogout}
              className="logout-button"
            >
              Logout
            </button>
          </div>
        </nav>

        <div className="business-state error">
          {error || "Business not found"}
        </div>

        <div className="business-back">
          <Link
            href="/dashboard"
            className="business-button"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="dashboard-page">
      {/* Navbar */}
      <nav className="navbar">
        <Link href="/" className="logo">
          Slotify
        </Link>

        <div className="nav-links">
          <Link href="/dashboard">Dashboard</Link>

          <Link href="/bookings">My Bookings</Link>

          <button
            onClick={handleLogout}
            className="logout-button"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Business Header */}
      <section className="business-detail-hero">
        <div className="business-detail-hero-content">
          <Link
            href="/dashboard"
            className="back-link"
          >
            ← Back to Businesses
          </Link>

          <span className="business-category">
            {business.category}
          </span>

          <h1>{business.name}</h1>

          <p>{business.description}</p>

          <div className="business-detail-location">
            📍 {business.location}
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="services-section">
        <div className="section-heading">
          <p className="eyebrow">SERVICES</p>

          <h2>Choose a Service</h2>

          <p>
            Select a service to view available dates and
            appointment times.
          </p>
        </div>

        {services.length === 0 ? (
          <div className="business-state">
            This business has no services available right now.
          </div>
        ) : (
          <div className="customer-services-grid">
            {services.map((service) => (
              <div
                key={service.id}
                className="customer-service-card"
              >
                <div className="customer-service-content">
                  <h3>{service.name}</h3>

                  <p className="customer-service-description">
                    {service.description ||
                      "No description provided."}
                  </p>

                  <div className="customer-service-details">
                    <span>
                      ⏱ {service.duration} minutes
                    </span>

                    <span>
                      PKR {Number(service.price).toLocaleString()}
                    </span>
                  </div>
                </div>

                <Link
                  href={`/businesses/${businessId}/book?serviceId=${service.id}`}
                  className="business-button"
                >
                  Book Now →
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}