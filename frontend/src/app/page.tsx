"use client";

import Link from "next/link";

export default function HomePage() {
  return (
    <main className="home-page">
      <nav className="home-navbar">
        <Link href="/" className="home-logo">
          Slotify
        </Link>

        <div className="home-nav-links">
          <Link href="/login">Log in</Link>

          <Link href="/register" className="home-nav-button">
            Get Started
          </Link>
        </div>
      </nav>

      <section className="home-hero">
        <div className="hero-content">
          <div className="hero-badge">
            <span>✦</span>
            Simple appointment booking
          </div>

          <h1>
            Your time.
            <br />
            <span>Simply scheduled.</span>
          </h1>

          <p>
            Slotify makes booking appointments simple. Discover services,
            choose a convenient time, and manage everything in one place.
          </p>

          <div className="hero-actions">
            <Link href="/register" className="hero-primary-button">
              Get Started
              <span>→</span>
            </Link>

            <Link href="/login" className="hero-secondary-button">
              Sign in
            </Link>
          </div>
        </div>

        <div className="hero-visual">
          <div className="glow glow-one"></div>
          <div className="glow glow-two"></div>

          <div className="booking-preview">
            <div className="preview-top">
              <div>
                <span className="preview-label">UPCOMING</span>
                <h3>Your appointment</h3>
              </div>

              <div className="preview-check">✓</div>
            </div>

            <div className="preview-business">
              <div className="business-icon">F</div>

              <div>
                <strong>FitZone Personal Training</strong>
                <span>Personal Training Session</span>
              </div>
            </div>

            <div className="preview-details">
              <div>
                <span>DATE</span>
                <strong>Mon, Sep 29</strong>
              </div>

              <div>
                <span>TIME</span>
                <strong>10:00 AM</strong>
              </div>
            </div>

            <div className="preview-status">
              <span></span>
              Confirmed
            </div>
          </div>
        </div>
      </section>

      <section className="home-features">
        <div className="section-heading">
          <p className="eyebrow">WHY SLOTIFY</p>

          <h2>
            Everything you need to
            <br />
            manage your appointments.
          </h2>
        </div>

        <div className="feature-grid">
          <article className="feature-card">
            <div className="feature-icon purple">◷</div>

            <h3>Find a convenient time</h3>

            <p>
              See available appointment slots and choose the time that works
              best for you.
            </p>
          </article>

          <article className="feature-card">
            <div className="feature-icon violet">✓</div>

            <h3>Stay organized</h3>

            <p>
              Keep your upcoming and previous appointments together in one
              simple dashboard.
            </p>
          </article>

          <article className="feature-card">
            <div className="feature-icon pink">⌁</div>

            <h3>Simple for businesses</h3>

            <p>
              Businesses can manage services, availability, and customer
              bookings from one place.
            </p>
          </article>
        </div>
      </section>

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
          <span>→</span>
        </Link>
      </section>

      <footer className="home-footer">
        <span>© 2026 Slotify</span>

        <span>Simple booking. Better scheduling.</span>
      </footer>
    </main>
  );
}