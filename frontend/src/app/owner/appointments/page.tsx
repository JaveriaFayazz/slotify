"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import {
  getStoredUser,
  logout,
  User,
} from "../../services/auth.service";

import {
  getMyBusinesses,
  Business,
} from "../../services/business.service";

import {
  Booking,
  getBusinessBookings,
  updateBookingStatus,
} from "../../services/booking.service";

export default function OwnerAppointmentsPage() {
  const [user, setUser] = useState<User | null>(null);

  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState("");

  const [bookings, setBookings] = useState<Booking[]>([]);

  const [loadingBusinesses, setLoadingBusinesses] = useState(true);
  const [loadingBookings, setLoadingBookings] = useState(false);

  const [updatingBookingId, setUpdatingBookingId] = useState("");

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const storedUser = getStoredUser();

    setUser(storedUser);

    async function loadBusinesses() {
      try {
        const data = await getMyBusinesses();

        setBusinesses(data);

        if (data.length > 0) {
          setSelectedBusinessId(data[0].id);
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load businesses"
        );
      } finally {
        setLoadingBusinesses(false);
      }
    }

    loadBusinesses();
  }, []);

  useEffect(() => {
    if (!selectedBusinessId) {
      setBookings([]);
      return;
    }

    async function loadBookings() {
      setLoadingBookings(true);
      setError("");

      try {
        const data = await getBusinessBookings(
          selectedBusinessId
        );

        setBookings(data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load appointments"
        );
      } finally {
        setLoadingBookings(false);
      }
    }

    loadBookings();
  }, [selectedBusinessId]);

  function handleLogout() {
    logout();

    window.location.href = "/login";
  }

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

  function getStatusClass(status: string) {
    switch (status) {
      case "PENDING":
        return "appointment-status pending";

      case "CONFIRMED":
        return "appointment-status confirmed";

      case "COMPLETED":
        return "appointment-status completed";

      case "CANCELLED":
        return "appointment-status cancelled";

      default:
        return "appointment-status";
    }
  }

  async function handleStatusUpdate(
    booking: Booking,
    status: "CONFIRMED" | "COMPLETED"
  ) {
    if (!selectedBusinessId) {
      return;
    }

    setUpdatingBookingId(booking.id);
    setError("");
    setMessage("");

    try {
      const updatedBooking =
        await updateBookingStatus(
          booking.id,
          selectedBusinessId,
          status
        );

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

      if (status === "CONFIRMED") {
        setMessage(
          "Appointment confirmed successfully."
        );
      }

      if (status === "COMPLETED") {
        setMessage(
          "Appointment marked as completed."
        );
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to update appointment"
      );
    } finally {
      setUpdatingBookingId("");
    }
  }

  async function handleCancel(booking: Booking) {
    if (!selectedBusinessId) {
      return;
    }

    setUpdatingBookingId(booking.id);
    setError("");
    setMessage("");

    try {
      const data = await import(
        "../../services/api"
      );

      await data.apiRequest(
        `/bookings/${booking.id}/cancel`,
        {
          method: "PUT",
        }
      );

      setBookings((currentBookings) =>
        currentBookings.map((item) =>
          item.id === booking.id
            ? {
                ...item,
                status: "CANCELLED",
              }
            : item
        )
      );

      setMessage(
        "Appointment cancelled successfully."
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to cancel appointment"
      );
    } finally {
      setUpdatingBookingId("");
    }
  }

  const selectedBusiness = businesses.find(
    (business) =>
      business.id === selectedBusinessId
  );

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
            BUSINESS OWNER
          </p>

          <h1>
            Appointments
          </h1>

          <p>
            Review customer bookings and manage
            appointment confirmations and completion.
          </p>

        </div>

      </section>


      {/* ---------- Main Content ---------- */}

      <section className="businesses-section">

        {/* Business Selector */}

        <div className="section-heading">

          <p className="eyebrow">
            MANAGE APPOINTMENTS
          </p>

          <h2>
            Choose a business
          </h2>

          <p>
            Select which business you want to
            manage customer appointments for.
          </p>

        </div>


        {loadingBusinesses ? (
          <div className="business-state">
            Loading businesses...
          </div>
        ) : businesses.length === 0 ? (

          <div className="business-state">
            You do not have any businesses yet.
            Create a business first.
          </div>

        ) : (

          <div className="appointment-selector-card">

            <label>
              Business
            </label>

            <select
              value={selectedBusinessId}
              onChange={(event) =>
                setSelectedBusinessId(
                  event.target.value
                )
              }
            >

              {businesses.map((business) => (
                <option
                  key={business.id}
                  value={business.id}
                >
                  {business.name}
                </option>
              ))}

            </select>

          </div>

        )}


        {/* Selected Business */}

        {selectedBusiness && (
          <div className="appointment-business-banner">

            <div className="appointment-business-icon">
              🏢
            </div>

            <div>
              <p className="eyebrow">
                MANAGING APPOINTMENTS FOR
              </p>

              <h2>
                {selectedBusiness.name}
              </h2>

              <p>
                {selectedBusiness.category}
                {" • "}
                {selectedBusiness.location}
              </p>
            </div>

          </div>
        )}


        {/* Messages */}

        {message && (
          <div className="appointment-message success">
            {message}
          </div>
        )}

        {error && (
          <div className="appointment-message error">
            {error}
          </div>
        )}


        {/* Appointment Heading */}

        {selectedBusiness && (
          <div className="section-heading appointment-heading">

            <p className="eyebrow">
              CUSTOMER BOOKINGS
            </p>

            <h2>
              Appointments
            </h2>

            <p>
              Confirm pending bookings, mark
              confirmed appointments as completed,
              or cancel appointments when necessary.
            </p>

          </div>
        )}


        {/* Loading */}

        {loadingBookings && (
          <div className="business-state">
            Loading appointments...
          </div>
        )}


        {/* Empty */}

        {!loadingBookings &&
          selectedBusiness &&
          bookings.length === 0 && (

            <div className="empty-appointments-card">

              <div className="empty-appointments-icon">
                📅
              </div>

              <h3>
                No appointments yet
              </h3>

              <p>
                Customer bookings for this business
                will appear here.
              </p>

            </div>
          )}


        {/* Appointments */}

        {!loadingBookings &&
          bookings.length > 0 && (

            <div className="appointments-grid">

              {bookings.map((booking) => (

                <article
                  key={booking.id}
                  className="appointment-card"
                >

                  <div className="appointment-card-top">

                    <div>
                      <p className="appointment-service-label">
                        SERVICE
                      </p>

                      <h3>
                        {booking.service_name ||
                          "Service"}
                      </h3>
                    </div>

                    <span
                      className={getStatusClass(
                        booking.status
                      )}
                    >
                      {booking.status}
                    </span>

                  </div>


                  <div className="appointment-details">

                    <div className="appointment-detail">
                      <span>
                        👤
                      </span>

                      <div>
                        <small>
                          CUSTOMER
                        </small>

                        <strong>
                          {booking.customer_name ||
                            "Customer"}
                        </strong>

                        {booking.customer_email && (
                          <p>
                            {booking.customer_email}
                          </p>
                        )}
                      </div>
                    </div>


                    <div className="appointment-detail">
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


                    <div className="appointment-detail">
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


                    <div className="appointment-detail">
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


                  {/* Actions */}

                  {booking.status === "PENDING" && (

                    <div className="appointment-actions">

                      <button
                        className="confirm-appointment-button"
                        disabled={
                          updatingBookingId ===
                          booking.id
                        }
                        onClick={() =>
                          handleStatusUpdate(
                            booking,
                            "CONFIRMED"
                          )
                        }
                      >
                        {updatingBookingId ===
                        booking.id
                          ? "Updating..."
                          : "✓ Confirm"}
                      </button>

                      <button
                        className="cancel-appointment-button"
                        disabled={
                          updatingBookingId ===
                          booking.id
                        }
                        onClick={() =>
                          handleCancel(booking)
                        }
                      >
                        Cancel
                      </button>

                    </div>
                  )}


                  {booking.status === "CONFIRMED" && (

                    <div className="appointment-actions">

                      <button
                        className="complete-appointment-button"
                        disabled={
                          updatingBookingId ===
                          booking.id
                        }
                        onClick={() =>
                          handleStatusUpdate(
                            booking,
                            "COMPLETED"
                          )
                        }
                      >
                        {updatingBookingId ===
                        booking.id
                          ? "Updating..."
                          : "✓ Mark Completed"}
                      </button>

                      <button
                        className="cancel-appointment-button"
                        disabled={
                          updatingBookingId ===
                          booking.id
                        }
                        onClick={() =>
                          handleCancel(booking)
                        }
                      >
                        Cancel
                      </button>

                    </div>
                  )}


                  {booking.status === "COMPLETED" && (

                    <div className="appointment-completed-note">
                      ✓ This appointment has been
                      completed.
                    </div>
                  )}


                  {booking.status === "CANCELLED" && (

                    <div className="appointment-cancelled-note">
                      This appointment was cancelled.
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