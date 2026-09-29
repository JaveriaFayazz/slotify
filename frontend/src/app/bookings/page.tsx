"use client";

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

  // =========================================================
  // LOAD USER + BOOKINGS
  // =========================================================

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

  // =========================================================
  // LOGOUT
  // =========================================================

  function handleLogout() {
    logout();

    window.location.href = "/login";
  }

  // =========================================================
  // FORMAT DATE
  // =========================================================

  function formatDate(dateString: string) {
    const date = new Date(
      `${dateString}T00:00:00`
    );

    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  // =========================================================
  // FORMAT TIME
  // =========================================================

  function formatTime(timeString: string) {
    const [hours, minutes] =
      timeString.split(":").map(Number);

    const date = new Date();

    date.setHours(hours, minutes, 0, 0);

    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  }

  // =========================================================
  // STATUS CLASS
  // =========================================================

  function getStatusClass(status: string) {
    switch (status) {
      case "PENDING":
        return "customer-booking-status pending";

      case "CONFIRMED":
        return "customer-booking-status confirmed";

      case "COMPLETED":
        return "customer-booking-status completed";

      case "CANCELLED":
        return "customer-booking-status cancelled";

      default:
        return "customer-booking-status";
    }
  }

  // =========================================================
  // STATUS MESSAGE
  // =========================================================

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

  // =========================================================
  // CANCEL BOOKING
  // =========================================================

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

  // =========================================================
  // COUNTS
  // =========================================================

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
    <main className="dashboard-page">

      {/* =====================================================
          NAVBAR
          ===================================================== */}

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


      {/* =====================================================
          HERO
          ===================================================== */}

      <section className="dashboard-hero">

        <div>

          <p className="eyebrow">
            CUSTOMER DASHBOARD
          </p>

          <h1>
            My Bookings
          </h1>

          <p>
            {user?.name
              ? `Hello ${user.name}, here are your appointments.`
              : "View and manage your appointments."}
          </p>

        </div>

      </section>


      {/* =====================================================
          MAIN CONTENT
          ===================================================== */}

      <section className="businesses-section">

        {/* =================================================
            SUMMARY CARDS
            ================================================= */}

        {!loading && bookings.length > 0 && (

          <div className="customer-booking-summary">

            <div className="customer-summary-card">

              <span className="customer-summary-number">
                {bookings.length}
              </span>

              <span className="customer-summary-label">
                Total Bookings
              </span>

            </div>


            <div className="customer-summary-card">

              <span className="customer-summary-number">
                {pendingCount}
              </span>

              <span className="customer-summary-label">
                Pending
              </span>

            </div>


            <div className="customer-summary-card">

              <span className="customer-summary-number">
                {confirmedCount}
              </span>

              <span className="customer-summary-label">
                Confirmed
              </span>

            </div>


            <div className="customer-summary-card">

              <span className="customer-summary-number">
                {completedCount}
              </span>

              <span className="customer-summary-label">
                Completed
              </span>

            </div>

          </div>
        )}


        {/* =================================================
            MESSAGES
            ================================================= */}

        {message && (
          <div className="customer-booking-message success">
            {message}
          </div>
        )}

        {error && (
          <div className="customer-booking-message error">
            {error}
          </div>
        )}


        {/* =================================================
            SECTION HEADING
            ================================================= */}

        <div className="section-heading">

          <p className="eyebrow">
            YOUR APPOINTMENTS
          </p>

          <h2>
            Booking History
          </h2>

          <p>
            Track the status of your appointments
            and manage upcoming bookings.
          </p>

        </div>


        {/* =================================================
            LOADING
            ================================================= */}

        {loading && (
          <div className="business-state">
            Loading your bookings...
          </div>
        )}


        {/* =================================================
            EMPTY STATE
            ================================================= */}

        {!loading && bookings.length === 0 && (

          <div className="customer-empty-bookings">

            <div className="customer-empty-icon">
              📅
            </div>

            <h3>
              No bookings yet
            </h3>

            <p>
              You haven't made any appointments yet.
              Browse businesses and book a service
              to get started.
            </p>

            <Link
              href="/dashboard"
              className="customer-browse-button"
            >
              Browse Businesses →
            </Link>

          </div>
        )}


        {/* =================================================
            BOOKINGS
            ================================================= */}

        {!loading && bookings.length > 0 && (

          <div className="customer-bookings-grid">

            {bookings.map((booking) => (

              <article
                key={booking.id}
                className="customer-booking-card"
              >

                {/* -----------------------------------------
                    CARD HEADER
                    ----------------------------------------- */}

                <div className="customer-booking-top">

                  <div>

                    <p className="customer-booking-label">
                      SERVICE
                    </p>

                    <h3>
                      {booking.service_name ||
                        "Service"}
                    </h3>

                    <p className="customer-business-name">
                      {booking.business_name ||
                        "Business"}
                    </p>

                  </div>


                  <span
                    className={getStatusClass(
                      booking.status
                    )}
                  >
                    {booking.status}
                  </span>

                </div>


                {/* -----------------------------------------
                    DETAILS
                    ----------------------------------------- */}

                <div className="customer-booking-details">

                  <div className="customer-booking-detail">

                    <span>
                      📅
                    </span>

                    <div>

                      <small>
                        DATE
                      </small>

                      <strong>
                        {formatDate(
                          booking.booking_date
                        )}
                      </strong>

                    </div>

                  </div>


                  <div className="customer-booking-detail">

                    <span>
                      🕐
                    </span>

                    <div>

                      <small>
                        TIME
                      </small>

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


                  <div className="customer-booking-detail">

                    <span>
                      ⏱
                    </span>

                    <div>

                      <small>
                        DURATION
                      </small>

                      <strong>
                        {booking.duration
                          ? `${booking.duration} min`
                          : "—"}
                      </strong>

                    </div>

                  </div>


                  <div className="customer-booking-detail">

                    <span>
                      💰
                    </span>

                    <div>

                      <small>
                        PRICE
                      </small>

                      <strong>
                        {booking.price !==
                        undefined
                          ? `PKR ${booking.price}`
                          : "—"}
                      </strong>

                    </div>

                  </div>

                </div>


                {/* -----------------------------------------
                    STATUS INFORMATION
                    ----------------------------------------- */}

                <div
                  className={`customer-booking-status-message ${booking.status.toLowerCase()}`}
                >

                  <span>
                    {booking.status === "PENDING" &&
                      "⏳"}

                    {booking.status === "CONFIRMED" &&
                      "✓"}

                    {booking.status === "COMPLETED" &&
                      "✓"}

                    {booking.status === "CANCELLED" &&
                      "×"}
                  </span>

                  <p>
                    {getStatusMessage(
                      booking.status
                    )}
                  </p>

                </div>


                {/* -----------------------------------------
                    ACTIONS
                    ----------------------------------------- */}

                {(booking.status === "PENDING" ||
                  booking.status === "CONFIRMED") && (

                  <div className="customer-booking-actions">

                    <button
                      className="customer-cancel-button"
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

                  <div className="customer-completed-note">
                    ✓ Thank you for using Slotify.
                  </div>

                )}


                {booking.status === "CANCELLED" && (

                  <div className="customer-cancelled-note">
                    This booking is no longer active.
                  </div>

                )}

              </article>

            ))}

          </div>
        )}

      </section>

    </main>
  );
}