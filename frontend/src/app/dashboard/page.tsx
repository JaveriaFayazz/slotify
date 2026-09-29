"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { getStoredUser, logout, User } from "../services/auth.service";

import {
  getAllBusinesses,
  Business,
} from "../services/business.service";

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);

  const [businesses, setBusinesses] = useState<Business[]>([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    const storedUser = getStoredUser();

    setUser(storedUser);

    async function loadBusinesses() {
      try {
        const data = await getAllBusinesses();

        setBusinesses(data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load businesses"
        );
      } finally {
        setLoading(false);
      }
    }

    loadBusinesses();
  }, []);

  function handleLogout() {
    logout();

    window.location.href = "/login";
  }

  /*
   * OWNER DASHBOARD
   */

  if (user?.role === "OWNER") {
    return (
      <main className="dashboard-page">

        {/* ---------- Navbar ---------- */}

        <nav className="navbar">

          <Link href="/" className="logo">
            Slotify
          </Link>

          <div className="nav-links">

            <Link href="/dashboard">
              Dashboard
            </Link>

            <Link href="/owner/businesses">
              My Businesses
            </Link>

            <Link href="/owner/services">
              Services
            </Link>

            <Link href="/owner/availability">
              Availability
            </Link>

            <Link href="/owner/appointments">
              Appointments
            </Link>

            <button
              onClick={handleLogout}
              className="logout-button"
            >
              Logout
            </button>

          </div>

        </nav>


        {/* ---------- Hero ---------- */}

        <section className="dashboard-hero">

          <div>

            <p className="eyebrow">
              OWNER DASHBOARD
            </p>

            <h1>
              Welcome back
              {user?.name ? `, ${user.name}` : ""}!
            </h1>

            <p>
              Manage your businesses, services,
              availability, and customer appointments
              through Slotify.
            </p>

          </div>

        </section>


        {/* ---------- Owner Cards ---------- */}

        <section className="dashboard-grid">

          {/* My Businesses */}

          <Link
            href="/owner/businesses"
            className="dashboard-card"
          >

            <div className="card-icon">
              🏢
            </div>

            <h2>
              My Businesses
            </h2>

            <p>
              Create and manage the businesses
              connected to your owner account.
            </p>

            <span>
              Manage Businesses →
            </span>

          </Link>


          {/* Manage Services */}

          <Link
            href="/owner/services"
            className="dashboard-card"
          >

            <div className="card-icon">
              ⚙️
            </div>

            <h2>
              Manage Services
            </h2>

            <p>
              Add and manage the services,
              prices, and appointment durations
              offered by your business.
            </p>

            <span>
              Manage Services →
            </span>

          </Link>


          {/* Availability */}

          <Link
            href="/owner/availability"
            className="dashboard-card"
          >

            <div className="card-icon">
              🕐
            </div>

            <h2>
              Availability
            </h2>

            <p>
              Set the working days and hours
              when customers can book appointments.
            </p>

            <span>
              Manage Availability →
            </span>

          </Link>


          {/* Appointments */}

          <Link
            href="/owner/appointments"
            className="dashboard-card"
          >

            <div className="card-icon">
              📅
            </div>

            <h2>
              Appointments
            </h2>

            <p>
              Review and manage customer bookings
              and appointment statuses.
            </p>

            <span>
              View Appointments →
            </span>

          </Link>

        </section>


        {/* ---------- Owner Quick Information ---------- */}

        <section className="businesses-section">

          <div className="section-heading">

            <p className="eyebrow">
              SLOTIFY FOR BUSINESS OWNERS
            </p>

            <h2>
              Manage your business
            </h2>

            <p>
              Use the modules above to create your
              business, add services, set working
              hours, and manage customer appointments.
            </p>

          </div>

        </section>

      </main>
    );
  }


  /*
   * CUSTOMER DASHBOARD
   */

  return (
    <main className="dashboard-page">

      {/* ---------- Navbar ---------- */}

      <nav className="navbar">

        <Link href="/" className="logo">
          Slotify
        </Link>

        <div className="nav-links">

          <Link href="/dashboard">
            Dashboard
          </Link>

          <Link href="/bookings">
            My Bookings
          </Link>

          <button
            onClick={handleLogout}
            className="logout-button"
          >
            Logout
          </button>

        </div>

      </nav>


      {/* ---------- Hero ---------- */}

      <section className="dashboard-hero">

        <div>

          <p className="eyebrow">
            CUSTOMER DASHBOARD
          </p>

          <h1>
            Welcome back
            {user?.name ? `, ${user.name}` : ""}!
          </h1>

          <p>
            Manage your appointments and discover
            services available through Slotify.
          </p>

        </div>

      </section>


      {/* ---------- Customer Cards ---------- */}

      <section className="dashboard-grid">

        <Link
          href="/bookings"
          className="dashboard-card"
        >

          <div className="card-icon">
            📅
          </div>

          <h2>
            My Bookings
          </h2>

          <p>
            View your upcoming and previous
            appointments.
          </p>

          <span>
            View bookings →
          </span>

        </Link>


        <div className="dashboard-card">

          <div className="card-icon">
            🔎
          </div>

          <h2>
            Find a Service
          </h2>

          <p>
            Browse available businesses and
            services.
          </p>

          <span>
            {businesses.length} businesses available
          </span>

        </div>


        <div className="dashboard-card">

          <div className="card-icon">
            👤
          </div>

          <h2>
            My Profile
          </h2>

          <p>
            View and manage your Slotify account.
          </p>

          <span>
            Coming next →
          </span>

        </div>

      </section>


      {/* ---------- Available Businesses ---------- */}

      <section className="businesses-section">

        <div className="section-heading">

          <p className="eyebrow">
            DISCOVER
          </p>

          <h2>
            Available Businesses
          </h2>

          <p>
            Choose a business to explore its
            services and book an appointment.
          </p>

        </div>


        {/* Loading */}

        {loading && (
          <div className="business-state">
            Loading businesses...
          </div>
        )}


        {/* Error */}

        {error && (
          <div className="business-state error">
            {error}
          </div>
        )}


        {/* Empty */}

        {!loading &&
          !error &&
          businesses.length === 0 && (
            <div className="business-state">
              No businesses are available right now.
            </div>
          )}


        {/* Business List */}

        {!loading &&
          !error &&
          businesses.length > 0 && (

            <div className="businesses-grid">

              {businesses.map((business) => (

                <div
                  key={business.id}
                  className="business-card"
                >

                  <div className="business-card-top">

                    <span className="business-category">
                      {business.category}
                    </span>

                  </div>


                  <h3>
                    {business.name}
                  </h3>


                  <p className="business-description">
                    {business.description}
                  </p>


                  <p className="business-location">
                    📍 {business.location}
                  </p>


                  <Link
                    href={`/businesses/${business.id}`}
                    className="business-button"
                  >
                    View Services →
                  </Link>

                </div>

              ))}

            </div>

          )}

      </section>

    </main>
  );
}