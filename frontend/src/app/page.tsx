"use client";

import Link from "next/link";
import {
  AiOutlineArrowRight,
  AiOutlineCalendar,
  AiOutlineCheckCircle,
  AiOutlineClockCircle,
  AiOutlineMenu,
  AiOutlineSchedule,
} from "react-icons/ai";

export default function HomePage() {
  return (
    <main className="home-page">
      {/* NAVBAR */}
      <nav className="home-navbar">
        <Link href="/" className="home-logo">
          <span className="home-logo-mark">
            <AiOutlineSchedule />
          </span>

          <span>Slotify</span>
        </Link>

        <div className="home-nav-links">
          <Link href="#features">Features</Link>
          <Link href="#how-it-works">How it works</Link>
          <Link href="/login" className="home-login-link">
            Log in
          </Link>

          <Link href="/register" className="home-nav-button">
            Get Started
            <AiOutlineArrowRight />
          </Link>
        </div>

        <button className="mobile-menu-button" aria-label="Open menu">
          <AiOutlineMenu />
        </button>
      </nav>

      {/* HERO */}
      <section className="home-hero">
        <div className="hero-content">
          <div className="hero-badge">
            <span className="hero-badge-icon">
              <AiOutlineCheckCircle />
            </span>

            Simple appointment scheduling
          </div>

          <h1>
            Your time.
            <br />
            <span>Simply scheduled.</span>
          </h1>

          <p>
            Slotify makes appointment booking simple for everyone. Discover
            services, choose a convenient time, and manage your appointments
            from one place.
          </p>

          <div className="hero-actions">
            <Link href="/register" className="hero-primary-button">
              Get started
              <AiOutlineArrowRight />
            </Link>

            <Link href="/login" className="hero-secondary-button">
              Sign in
            </Link>
          </div>

          <div className="hero-trust">
            <div className="hero-trust-item">
              <AiOutlineCheckCircle />
              Easy booking
            </div>

            <div className="hero-trust-item">
              <AiOutlineCheckCircle />
              Real availability
            </div>

            <div className="hero-trust-item">
              <AiOutlineCheckCircle />
              Simple management
            </div>
          </div>
        </div>

        {/* BOOKING PREVIEW */}
        <div className="hero-visual">
          <div className="booking-window">
            <div className="booking-window-header">
              <div>
                <span className="preview-label">UPCOMING</span>
                <h3>Your appointment</h3>
              </div>

              <div className="preview-check">
                <AiOutlineCheckCircle />
              </div>
            </div>

            <div className="preview-business">
              <div className="business-icon">
                <AiOutlineSchedule />
              </div>

              <div>
                <strong>FitZone Personal Training</strong>
                <span>Personal Training Session</span>
              </div>
            </div>

            <div className="preview-details">
              <div className="preview-detail">
                <span className="preview-detail-icon">
                  <AiOutlineCalendar />
                </span>

                <div>
                  <span>DATE</span>
                  <strong>Mon, Sep 29</strong>
                </div>
              </div>

              <div className="preview-detail">
                <span className="preview-detail-icon">
                  <AiOutlineClockCircle />
                </span>

                <div>
                  <span>TIME</span>
                  <strong>10:00 AM</strong>
                </div>
              </div>
            </div>

            <div className="preview-status">
              <span className="status-dot"></span>
              Confirmed
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="home-features" id="features">
        <div className="section-heading">
          <p className="eyebrow">WHY SLOTIFY</p>

          <h2>
            Everything you need to
            <br />
            manage appointments.
          </h2>

          <p>
            A simple scheduling experience for customers and businesses,
            without unnecessary complexity.
          </p>
        </div>

        <div className="feature-grid">
          <article className="feature-card">
            <div className="feature-icon">
              <AiOutlineCalendar />
            </div>

            <h3>Find a convenient time</h3>

            <p>
              Browse available services and appointment slots and choose the
              time that works best for you.
            </p>
          </article>

          <article className="feature-card">
            <div className="feature-icon">
              <AiOutlineClockCircle />
            </div>

            <h3>Stay organized</h3>

            <p>
              Keep your upcoming and previous appointments organized in one
              simple dashboard.
            </p>
          </article>

          <article className="feature-card">
            <div className="feature-icon">
              <AiOutlineSchedule />
            </div>

            <h3>Manage your business</h3>

            <p>
              Businesses can manage services, availability, and customer
              bookings from one place.
            </p>
          </article>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="how-it-works" id="how-it-works">
        <div className="section-heading">
          <p className="eyebrow">HOW IT WORKS</p>

          <h2>Booking should be simple.</h2>

          <p>
            From finding a service to confirming your appointment, Slotify
            keeps the process straightforward.
          </p>
        </div>

        <div className="steps-grid">
          <div className="step-item">
            <span className="step-number">01</span>

            <h3>Find a service</h3>

            <p>
              Explore businesses and discover the services they offer.
            </p>
          </div>

          <div className="step-item">
            <span className="step-number">02</span>

            <h3>Choose a time</h3>

            <p>
              View available appointment slots and select the one that suits
              you.
            </p>
          </div>

          <div className="step-item">
            <span className="step-number">03</span>

            <h3>Book & manage</h3>

            <p>
              Confirm your appointment and manage it from your dashboard.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="home-cta">
        <div>
          <p className="eyebrow">GET STARTED</p>

          <h2>Ready to simplify your schedule?</h2>

          <p>
            Create your Slotify account and start managing appointments today.
          </p>
        </div>

        <Link href="/register" className="hero-primary-button">
          Create an account
          <AiOutlineArrowRight />
        </Link>
      </section>

      {/* FOOTER */}
      <footer className="home-footer">
        <div className="footer-brand">
          <span className="home-logo-mark">
            <AiOutlineSchedule />
          </span>

          <strong>Slotify</strong>
        </div>

        <span>© 2026 Slotify</span>

        <span>Simple booking. Better scheduling.</span>
      </footer>
    </main>
  );
}