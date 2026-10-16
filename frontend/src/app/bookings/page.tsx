"use client";

import {
  AiOutlineArrowRight,
  AiOutlineCalendar,
  AiOutlineCheckCircle,
  AiOutlineClockCircle,
  AiOutlineEnvironment,
  AiOutlineHistory,
  AiOutlineLogout,
  AiOutlineShop,
  AiOutlineUser,
} from "react-icons/ai";
import Link from "next/link";
import { useEffect, useState } from "react";

import {
  getStoredUser,
  logout,
  User,
} from "../services/auth.service";

import {
  Booking,
  getMyBookings,
  cancelBooking,
} from "../services/booking.service";

export default function MyBookingsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const [cancellingBookingId, setCancellingBookingId] =
    useState("");

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // LOAD USER + BOOKINGS
  useEffect(() => {
    const storedUser = getStoredUser();
    setUser(storedUser);

    async function loadBookings() {
      try {
        setLoading(true);
        setError("");

        const response = await getMyBookings();
        setBookings(response.bookings);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load your bookings"
        );
      } finally {
        setLoading(false);
      }
    }

    loadBookings();
  }, []);

  // LOGOUT
  function handleLogout() {
    logout();
    window.location.href = "/login";
  }

  // FORMAT DATE
  function formatDate(dateString: string) {
    const date = new Date(`${dateString}T00:00:00`);

    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  // FORMAT TIME
  function formatTime(timeString: string) {
    const [hours, minutes] = timeString
      .split(":")
      .map(Number);

    const date = new Date();
    date.setHours(hours, minutes, 0, 0);

    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  }

  // STATUS CLASS
  function getStatusClass(status: string) {
    switch (status) {
      case "PENDING":
        return "bookings-status pending";

      case "CONFIRMED":
        return "bookings-status confirmed";

      case "COMPLETED":
        return "bookings-status completed";

      case "CANCELLED":
        return "bookings-status cancelled";

      default:
        return "bookings-status";
    }
  }

  // STATUS MESSAGE
  function getStatusMessage(status: string) {
    switch (status) {
      case "PENDING":
        return "Waiting for the business owner to confirm your appointment.";

      case "CONFIRMED":
        return "Your appointment has been confirmed.";

      case "COMPLETED":
        return "This appointment has been completed.";

      case "CANCELLED":
        return "This appointment has been cancelled.";

      default:
        return "";
    }
  }

  // CANCEL BOOKING
  async function handleCancel(booking: Booking) {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this appointment?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setCancellingBookingId(booking.id);
      setError("");
      setMessage("");

      const updatedBooking =
        await cancelBooking(booking.id);

      setBookings((currentBookings) =>
        currentBookings.map((item) =>
          item.id === updatedBooking.id
            ? {
                ...item,
                ...updatedBooking,
              }
            : item
        )
      );

      setMessage(
        "Your appointment has been cancelled successfully."
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to cancel appointment"
      );
    } finally {
      setCancellingBookingId("");
    }
  }

  // COUNTS
  const pendingCount = bookings.filter(
    (booking) => booking.status === "PENDING"
  ).length;

  const confirmedCount = bookings.filter(
    (booking) => booking.status === "CONFIRMED"
  ).length;

  const completedCount = bookings.filter(
    (booking) => booking.status === "COMPLETED"
  ).length;

  return (
    <main className="bookings-saas-page">

      {/* SIDEBAR */}
      <aside className="bookings-sidebar">

        <Link href="/" className="bookings-logo">
          <span className="bookings-logo-mark">
            S
          </span>

          <span>Slotify</span>
        </Link>

        <div className="bookings-sidebar-section">
          <span className="bookings-sidebar-label">
            MENU
          </span>

          <nav className="bookings-sidebar-nav">

            <Link
              href="/dashboard"
              className="bookings-sidebar-link"
            >
              <AiOutlineShop />
              <span>Dashboard</span>
            </Link>

            <Link
              href="/bookings"
              className="bookings-sidebar-link active"
            >
              <AiOutlineCalendar />
              <span>My Bookings</span>
            </Link>

          </nav>
        </div>

        <div className="bookings-sidebar-bottom">

          <div className="bookings-user">

            <div className="bookings-user-avatar">
              <AiOutlineUser />
            </div>

            <div className="bookings-user-info">
              <strong>
                {user?.name || "Customer"}
              </strong>

              <span>Customer</span>
            </div>

          </div>

          <button
            type="button"
            className="bookings-logout"
            onClick={handleLogout}
            title="Logout"
          >
            <AiOutlineLogout />
          </button>

        </div>

      </aside>

      {/* MAIN CONTENT */}
      <div className="bookings-main">

        {/* TOP BAR */}
        <header className="bookings-topbar">

          <div className="bookings-breadcrumb">
            <span>Dashboard</span>
            <AiOutlineArrowRight />
            <strong>My Bookings</strong>
          </div>

          <Link
            href="/dashboard"
            className="bookings-dashboard-link"
          >
            Browse Businesses
            <AiOutlineArrowRight />
          </Link>

        </header>

        {/* PAGE HEADER */}
        <section className="bookings-page-header">

          <div>

            <p className="bookings-eyebrow">
              APPOINTMENTS
            </p>

            <h1>
              My Bookings
            </h1>

            <p>
              {user?.name
                ? `Hello ${user.name}, here's an overview of your appointments.`
                : "View and manage your appointments."}
            </p>

          </div>

        </section>

        {/* STATS */}
        {!loading && bookings.length > 0 && (
          <section className="bookings-stats">

            <div className="bookings-stat-card">

              <div className="bookings-stat-icon">
                <AiOutlineHistory />
              </div>

              <div>
                <span>Total Bookings</span>
                <strong>{bookings.length}</strong>
              </div>

            </div>

            <div className="bookings-stat-card">

              <div className="bookings-stat-icon">
                <AiOutlineClockCircle />
              </div>

              <div>
                <span>Pending</span>
                <strong>{pendingCount}</strong>
              </div>

            </div>

            <div className="bookings-stat-card">

              <div className="bookings-stat-icon">
                <AiOutlineCheckCircle />
              </div>

              <div>
                <span>Confirmed</span>
                <strong>{confirmedCount}</strong>
              </div>

            </div>

            <div className="bookings-stat-card">

              <div className="bookings-stat-icon">
                <AiOutlineCheckCircle />
              </div>

              <div>
                <span>Completed</span>
                <strong>{completedCount}</strong>
              </div>

            </div>

          </section>
        )}

        {/* MESSAGES */}
        {message && (
          <div className="bookings-alert success">
            <AiOutlineCheckCircle />
            <span>{message}</span>
          </div>
        )}

        {error && (
          <div className="bookings-alert error">
            <span className="bookings-alert-icon">
              !
            </span>
            <span>{error}</span>
          </div>
        )}

        {/* SECTION HEADER */}
        <section className="bookings-history-section">

          <div className="bookings-section-header">

            <div>
              <p className="bookings-eyebrow">
                YOUR ACTIVITY
              </p>

              <h2>
                Booking History
              </h2>
            </div>

            {!loading && bookings.length > 0 && (
              <span className="bookings-count">
                {bookings.length}{" "}
                {bookings.length === 1
                  ? "appointment"
                  : "appointments"}
              </span>
            )}

          </div>

          {/* LOADING */}
          {loading && (
            <div className="bookings-loading">

              <AiOutlineClockCircle />

              <div>
                <strong>
                  Loading your bookings
                </strong>

                <span>
                  Please wait while we retrieve your appointments.
                </span>
              </div>

            </div>
          )}

          {/* EMPTY */}
          {!loading && bookings.length === 0 && (
            <div className="bookings-empty">

              <div className="bookings-empty-icon">
                <AiOutlineCalendar />
              </div>

              <h3>
                No bookings yet
              </h3>

              <p>
                You haven't made any appointments yet.
                Browse businesses and book a service to
                get started.
              </p>

              <Link
                href="/dashboard"
                className="bookings-browse-button"
              >
                Browse Businesses
                <AiOutlineArrowRight />
              </Link>

            </div>
          )}

          {/* BOOKINGS */}
          {!loading && bookings.length > 0 && (
            <div className="bookings-list">

              {bookings.map((booking) => (

                <article
                  key={booking.id}
                  className="bookings-card"
                >

                  {/* CARD TOP */}
                  <div className="bookings-card-top">

                    <div className="bookings-card-service">

                      <div className="bookings-service-icon">
                        <AiOutlineShop />
                      </div>

                      <div>
                        <p className="bookings-card-label">
                          SERVICE
                        </p>

                        <h3>
                          {booking.service_name ||
                            "Service"}
                        </h3>

                        <span>
                          {booking.business_name ||
                            "Business"}
                        </span>
                      </div>

                    </div>

                    <span
                      className={getStatusClass(
                        booking.status
                      )}
                    >
                      {booking.status}
                    </span>

                  </div>

                  {/* DETAILS */}
                  <div className="bookings-card-details">

                    <div className="bookings-detail">

                      <AiOutlineCalendar />

                      <div>
                        <span>Date</span>

                        <strong>
                          {formatDate(
                            booking.booking_date
                          )}
                        </strong>
                      </div>

                    </div>

                    <div className="bookings-detail">

                      <AiOutlineClockCircle />

                      <div>
                        <span>Time</span>

                        <strong>
                          {formatTime(
                            booking.start_time
                          )}
                          {" – "}
                          {formatTime(
                            booking.end_time
                          )}
                        </strong>
                      </div>

                    </div>

                    <div className="bookings-detail">

                      <AiOutlineHistory />

                      <div>
                        <span>Duration</span>

                        <strong>
                          {booking.duration
                            ? `${booking.duration} min`
                            : "—"}
                        </strong>
                      </div>

                    </div>

                    <div className="bookings-detail">

                      <span className="bookings-price-icon">
                        PKR
                      </span>

                      <div>
                        <span>Price</span>

                        <strong>
                          {booking.price !== undefined
                            ? `PKR ${Number(
                                booking.price
                              ).toLocaleString()}`
                            : "—"}
                        </strong>
                      </div>

                    </div>

                  </div>

                  {/* STATUS MESSAGE */}
                  <div
                    className={`bookings-status-message ${booking.status.toLowerCase()}`}
                  >

                    <div className="bookings-status-message-icon">

                      {booking.status === "PENDING" && (
                        <AiOutlineClockCircle />
                      )}

                      {(booking.status === "CONFIRMED" ||
                        booking.status === "COMPLETED") && (
                        <AiOutlineCheckCircle />
                      )}

                      {booking.status === "CANCELLED" && (
                        <span>×</span>
                      )}

                    </div>

                    <p>
                      {getStatusMessage(
                        booking.status
                      )}
                    </p>

                  </div>

                  {/* ACTIONS */}
                  {(booking.status === "PENDING" ||
                    booking.status === "CONFIRMED") && (

                    <div className="bookings-card-actions">

                      <button
                        type="button"
                        className="bookings-cancel-button"
                        disabled={
                          cancellingBookingId ===
                          booking.id
                        }
                        onClick={() =>
                          handleCancel(booking)
                        }
                      >
                        {cancellingBookingId ===
                        booking.id
                          ? "Cancelling..."
                          : "Cancel Appointment"}
                      </button>

                    </div>
                  )}

                  {booking.status === "COMPLETED" && (
                    <div className="bookings-completed-note">
                      <AiOutlineCheckCircle />
                      Thank you for using Slotify.
                    </div>
                  )}

                  {booking.status === "CANCELLED" && (
                    <div className="bookings-cancelled-note">
                      This booking is no longer active.
                    </div>
                  )}

                </article>

              ))}

            </div>
          )}

        </section>

      </div>
    </main>
  );
}