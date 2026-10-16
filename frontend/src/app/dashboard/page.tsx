
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import {
  getStoredUser,
  logout,
  User,
} from "../services/auth.service";

import {
  getAllBusinesses,
  Business,
} from "../services/business.service";

import {
  AiOutlineAppstore,
  AiOutlineCalendar,
  AiOutlineClockCircle,
  AiOutlineEnvironment,
  AiOutlineLogout,
  AiOutlineSearch,
  AiOutlineSetting,
  AiOutlineShop,
  AiOutlineUser,
  AiOutlineRight,
  AiOutlineSafetyCertificate,
} from "react-icons/ai";

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setUser(getStoredUser());

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

  const isOwner = user?.role === "OWNER";

  return (
    <main className="saas-dashboard">
      {/* SIDEBAR */}
      <aside className="dashboard-sidebar">
        <Link href="/" className="sidebar-logo">
          <span className="sidebar-logo-mark">S</span>
          <span>Slotify</span>
        </Link>

        <div className="sidebar-divider" />

        <div className="sidebar-section-label">MENU</div>

        <nav className="sidebar-nav">
          <Link href="/dashboard" className="sidebar-link active">
            <AiOutlineAppstore />
            <span>Dashboard</span>
          </Link>

          {isOwner ? (
            <>
              <Link
                href="/owner/businesses"
                className="sidebar-link"
              >
                <AiOutlineShop />
                <span>My Businesses</span>
              </Link>

              <Link
                href="/owner/services"
                className="sidebar-link"
              >
                <AiOutlineSetting />
                <span>Services</span>
              </Link>

              <Link
                href="/owner/availability"
                className="sidebar-link"
              >
                <AiOutlineClockCircle />
                <span>Availability</span>
              </Link>

              <Link
                href="/owner/appointments"
                className="sidebar-link"
              >
                <AiOutlineCalendar />
                <span>Appointments</span>
              </Link>
            </>
          ) : (
            <Link href="/bookings" className="sidebar-link">
              <AiOutlineCalendar />
              <span>My Bookings</span>
            </Link>
          )}
        </nav>

        {/* ACCOUNT NAVIGATION */}
        <div className="sidebar-bottom">
          <div className="sidebar-divider" />

          <div className="sidebar-section-label">ACCOUNT</div>

          <nav className="sidebar-nav">
            <Link
              href="/settings/profile"
              className="sidebar-link"
            >
              <AiOutlineUser />
              <span>Profile Settings</span>
            </Link>

            <Link
              href="/settings/password"
              className="sidebar-link"
            >
              <AiOutlineSetting />
              <span>Password</span>
            </Link>

            <Link
              href="/settings/security"
              className="sidebar-link"
            >
              <AiOutlineSafetyCertificate />
              <span>Security &amp; 2FA</span>
            </Link>
          </nav>

          <div className="sidebar-user">
            <div className="sidebar-user-avatar">
              {user?.name?.charAt(0).toUpperCase() || "U"}
            </div>

            <div className="sidebar-user-info">
              <strong>{user?.name || "User"}</strong>
              <span>
                {isOwner ? "Business Owner" : "Customer"}
              </span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="sidebar-logout"
          >
            <AiOutlineLogout />
            <span>Log out</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <section className="dashboard-content">
        {/* TOP BAR */}
        <header className="dashboard-topbar">
          <div>
            <span className="dashboard-breadcrumb">
              Dashboard
            </span>
          </div>

          <div className="dashboard-topbar-user">
            <div className="topbar-avatar">
              {user?.name?.charAt(0).toUpperCase() || "U"}
            </div>

            <div className="topbar-user-text">
              <strong>{user?.name || "User"}</strong>
              <span>{isOwner ? "Owner" : "Customer"}</span>
            </div>
          </div>
        </header>

        {/* WELCOME */}
        <section className="dashboard-welcome">
          <div>
            <span className="dashboard-eyebrow">
              {isOwner ? "OWNER DASHBOARD" : "CUSTOMER DASHBOARD"}
            </span>

            <h1>
              Welcome back{user?.name ? `, ${user.name}` : ""}.
            </h1>

            <p>
              {isOwner
                ? "Manage your businesses, services, availability and appointments from one place."
                : "Discover businesses, manage your bookings and schedule your next appointment."}
            </p>
          </div>

          {!isOwner && (
            <Link
              href="#businesses"
              className="primary-dashboard-button"
            >
              <AiOutlineSearch />
              Find a service
            </Link>
          )}

          {isOwner && (
            <Link
              href="/owner/businesses"
              className="primary-dashboard-button"
            >
              <AiOutlineShop />
              Manage businesses
            </Link>
          )}
        </section>

        {/* OWNER OVERVIEW / CUSTOMER SHORTCUTS */}
        {isOwner ? (
          <>
            <section className="dashboard-stats">
              <div className="dashboard-stat-card">
                <div className="stat-icon">
                  <AiOutlineShop />
                </div>
                <div>
                  <span>Businesses</span>
                  <strong>Manage</strong>
                </div>
              </div>

              <div className="dashboard-stat-card">
                <div className="stat-icon">
                  <AiOutlineSetting />
                </div>
                <div>
                  <span>Services</span>
                  <strong>Manage</strong>
                </div>
              </div>

              <div className="dashboard-stat-card">
                <div className="stat-icon">
                  <AiOutlineClockCircle />
                </div>
                <div>
                  <span>Availability</span>
                  <strong>Set hours</strong>
                </div>
              </div>

              <div className="dashboard-stat-card">
                <div className="stat-icon">
                  <AiOutlineCalendar />
                </div>
                <div>
                  <span>Appointments</span>
                  <strong>View bookings</strong>
                </div>
              </div>
            </section>

            <section className="dashboard-section">
              <div className="dashboard-section-heading">
                <div>
                  <span className="dashboard-eyebrow">
                    QUICK ACTIONS
                  </span>
                  <h2>Manage your Slotify workspace</h2>
                </div>
              </div>

              <div className="dashboard-action-grid">
                <Link
                  href="/owner/businesses"
                  className="dashboard-action-card"
                >
                  <div className="action-icon">
                    <AiOutlineShop />
                  </div>
                  <div className="action-content">
                    <h3>My Businesses</h3>
                    <p>
                      Create and manage the businesses connected
                      to your account.
                    </p>
                    <span>
                      Manage businesses <AiOutlineRight />
                    </span>
                  </div>
                </Link>

                <Link
                  href="/owner/services"
                  className="dashboard-action-card"
                >
                  <div className="action-icon">
                    <AiOutlineSetting />
                  </div>
                  <div className="action-content">
                    <h3>Manage Services</h3>
                    <p>
                      Add services, prices and appointment durations.
                    </p>
                    <span>
                      Manage services <AiOutlineRight />
                    </span>
                  </div>
                </Link>

                <Link
                  href="/owner/availability"
                  className="dashboard-action-card"
                >
                  <div className="action-icon">
                    <AiOutlineClockCircle />
                  </div>
                  <div className="action-content">
                    <h3>Availability</h3>
                    <p>
                      Set working days and hours for your customers.
                    </p>
                    <span>
                      Set availability <AiOutlineRight />
                    </span>
                  </div>
                </Link>

                <Link
                  href="/owner/appointments"
                  className="dashboard-action-card"
                >
                  <div className="action-icon">
                    <AiOutlineCalendar />
                  </div>
                  <div className="action-content">
                    <h3>Appointments</h3>
                    <p>
                      Review and manage customer appointment requests.
                    </p>
                    <span>
                      View appointments <AiOutlineRight />
                    </span>
                  </div>
                </Link>
              </div>
            </section>
          </>
        ) : (
          <section className="dashboard-stats">
            <Link
              href="/bookings"
              className="dashboard-stat-card stat-link"
            >
              <div className="stat-icon">
                <AiOutlineCalendar />
              </div>

              <div className="stat-shortcut-content">
                <span>My Bookings</span>
                <strong>View appointments</strong>
              </div>

              <AiOutlineRight className="stat-arrow" />
            </Link>

            <div className="dashboard-stat-card">
              <div className="stat-icon">
                <AiOutlineShop />
              </div>

              <div className="stat-shortcut-content">
                <span>Businesses</span>
                <strong>{businesses.length} available</strong>
              </div>
            </div>

            <Link
              href="#businesses"
              className="dashboard-stat-card stat-link"
            >
              <div className="stat-icon">
                <AiOutlineSearch />
              </div>

              <div className="stat-shortcut-content">
                <span>Discover</span>
                <strong>Find services</strong>
              </div>

              <AiOutlineRight className="stat-arrow" />
            </Link>

            <Link
              href="/settings/profile"
              className="dashboard-stat-card stat-link"
            >
              <div className="stat-icon">
                <AiOutlineUser />
              </div>

              <div className="stat-shortcut-content">
                <span>My Profile</span>
                <strong>Manage account</strong>
              </div>

              <AiOutlineRight className="stat-arrow" />
            </Link>
          </section>
        )}

        {/* ACCOUNT SETTINGS */}
        <section className="dashboard-section">
          <div className="dashboard-section-heading">
            <div>
              <span className="dashboard-eyebrow">YOUR ACCOUNT</span>
              <h2>Account Settings</h2>
              <p>
                Update your personal information and keep your
                account secure.
              </p>
            </div>
          </div>

          <div className="dashboard-action-grid">
            <Link
              href="/settings/profile"
              className="dashboard-action-card"
            >
              <div className="action-icon">
                <AiOutlineUser />
              </div>
              <div className="action-content">
                <h3>Profile Information</h3>
                <p>
                  Update your name and phone number and review
                  your account information.
                </p>
                <span>
                  Edit profile <AiOutlineRight />
                </span>
              </div>
            </Link>

            <Link
              href="/settings/password"
              className="dashboard-action-card"
            >
              <div className="action-icon">
                <AiOutlineSetting />
              </div>
              <div className="action-content">
                <h3>Change Password</h3>
                <p>
                  Update your password to help protect your
                  Slotify account.
                </p>
                <span>
                  Change password <AiOutlineRight />
                </span>
              </div>
            </Link>

            <Link
              href="/settings/security"
              className="dashboard-action-card"
            >
              <div className="action-icon">
                <AiOutlineSafetyCertificate />
              </div>
              <div className="action-content">
                <h3>Security &amp; 2FA</h3>
                <p>
                  Review your two-factor authentication settings
                  and manage additional account protection.
                </p>
                <span>
                  Manage security <AiOutlineRight />
                </span>
              </div>
            </Link>
          </div>
        </section>

        {/* BUSINESSES */}
        <section
          id="businesses"
          className="dashboard-section businesses-dashboard-section"
        >
          <div className="dashboard-section-heading">
            <div>
              <span className="dashboard-eyebrow">DISCOVER</span>
              <h2>Available Businesses</h2>
              <p>
                Explore businesses, view their services and book
                your next appointment.
              </p>
            </div>

            <span className="business-count">
              {businesses.length} businesses
            </span>
          </div>

          {loading && (
            <div className="business-state">
              <div className="dashboard-loading-spinner" />
              Loading businesses...
            </div>
          )}

          {error && (
            <div className="business-state dashboard-error">
              {error}
            </div>
          )}

          {!loading && !error && businesses.length === 0 && (
            <div className="business-state">
              No businesses are available right now.
            </div>
          )}

          {!loading && !error && businesses.length > 0 && (
            <div className="businesses-grid">
              {businesses.map((business) => (
                <article
                  key={business.id}
                  className="business-card"
                >
                  <div className="business-card-header">
                    <div className="business-avatar">
                      <AiOutlineShop />
                    </div>

                    <span className="business-category">
                      {business.category}
                    </span>
                  </div>

                  <div className="business-card-body">
                    <h3>{business.name}</h3>

                    <p className="business-description">
                      {business.description}
                    </p>

                    <div className="business-location">
                      <AiOutlineEnvironment />
                      <span>{business.location}</span>
                    </div>
                  </div>

                  <div className="business-card-footer">
                    <Link
                      href={`/businesses/${business.id}`}
                      className="business-button"
                    >
                      View services
                      <AiOutlineRight />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* FOOTER */}
        <footer className="dashboard-footer">
          <span>© {new Date().getFullYear()} Slotify</span>
          <span>Appointment management made simple.</span>
        </footer>
      </section>
    </main>
  );
}
