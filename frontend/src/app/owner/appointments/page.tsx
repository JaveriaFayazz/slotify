"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import {
  AiOutlineAppstore,
  AiOutlineCalendar,
  AiOutlineCheck,
  AiOutlineCheckCircle,
  AiOutlineClockCircle,
  AiOutlineClose,
  AiOutlineEnvironment,
  AiOutlineLogout,
  AiOutlineShop,
  AiOutlineUser,
} from "react-icons/ai";

import { toast } from "sonner";

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
  const [selectedBusinessId, setSelectedBusinessId] = useState<string | null>(null);

  const [bookings, setBookings] = useState<Booking[]>([]);

  const [loadingBusinesses, setLoadingBusinesses] = useState(true);
  const [loadingBookings, setLoadingBookings] = useState(false);

  const [updatingBookingId, setUpdatingBookingId] = useState<string | null>(null);

  const [error, setError] = useState("");

  useEffect(() => {
    const storedUser = getStoredUser();

    if (!storedUser) {
      setError("Please log in to continue.");
      setLoadingBusinesses(false);
      return;
    }

    if (storedUser.role !== "OWNER") {
      setError("Only business owners can access appointments.");
      setLoadingBusinesses(false);
      return;
    }

    setUser(storedUser);
    loadBusinesses();
  }, []);

  useEffect(() => {
    if (selectedBusinessId) {
      loadBookings(selectedBusinessId);
    }
  }, [selectedBusinessId]);

  async function loadBusinesses() {
    try {
      setLoadingBusinesses(true);
      setError("");

      const data = await getMyBusinesses();

      setBusinesses(data);

      if (data.length > 0) {
        setSelectedBusinessId(data[0].id);
      }
    } catch (err: any) {
      const message =
        err?.message || "Failed to load your businesses.";

      setError(message);
      toast.error(message);
    } finally {
      setLoadingBusinesses(false);
    }
  }

  async function loadBookings(businessId: string) {
    try {
      setLoadingBookings(true);
      setError("");

      const data = await getBusinessBookings(businessId);

      setBookings(data);
    } catch (err: any) {
      const message =
        err?.message || "Failed to load appointments.";

      setError(message);
      toast.error(message);
    } finally {
      setLoadingBookings(false);
    }
  }

  function handleLogout() {
    logout();
  }

  function formatDate(dateValue: string) {
    const dateOnly = String(dateValue).split("T")[0];

    const [year, month, day] = dateOnly.split("-").map(Number);

    if (!year || !month || !day) {
      return dateValue;
    }

    const date = new Date(year, month - 1, day);

    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  function formatTime(timeValue: string) {
    const [hours, minutes] = String(timeValue).split(":").map(Number);

    if (Number.isNaN(hours) || Number.isNaN(minutes)) {
      return timeValue;
    }

    const date = new Date();

    date.setHours(hours, minutes, 0, 0);

    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  }

  function getStatusClass(status: string) {
    return status.toLowerCase();
  }

  async function handleStatusUpdate(
    booking: Booking,
    status: "CONFIRMED" | "COMPLETED"
  ) {
    try {
      setUpdatingBookingId(booking.id);
      setError("");

      if (selectedBusinessId === null) {
        toast.error("Please select a business first.");
        return;
}

const updatedBooking = await updateBookingStatus(
  booking.id,
  String(selectedBusinessId),
  status
);

      setBookings((current) =>
        current.map((item) =>
          item.id === booking.id ? updatedBooking : item
        )
      );

      if (status === "CONFIRMED") {
        toast.success("Appointment confirmed successfully.");
      } else {
        toast.success("Appointment marked as completed.");
      }
    } catch (err: any) {
      const message =
        err?.message || "Failed to update appointment.";

      toast.error(message);
    } finally {
      setUpdatingBookingId(null);
    }
  }

  async function handleCancel(booking: Booking) {
    try {
      setUpdatingBookingId(booking.id);
      setError("");

      const { apiRequest } = await import("../../services/api");

      await apiRequest(`/bookings/${booking.id}/cancel`, {
        method: "PUT",
      });

      setBookings((current) =>
        current.map((item) =>
          item.id === booking.id
            ? { ...item, status: "CANCELLED" }
            : item
        )
      );

      toast.success("Appointment cancelled successfully.");
    } catch (err: any) {
      const message =
        err?.message || "Failed to cancel appointment.";

      toast.error(message);
    } finally {
      setUpdatingBookingId(null);
    }
  }

  const selectedBusiness = businesses.find(
    (business) => business.id === selectedBusinessId
  );

  const totalAppointments = bookings.length;

  const pendingAppointments = bookings.filter(
    (booking) => booking.status === "PENDING"
  ).length;

  const confirmedAppointments = bookings.filter(
    (booking) => booking.status === "CONFIRMED"
  ).length;

  const completedAppointments = bookings.filter(
    (booking) => booking.status === "COMPLETED"
  ).length;

  if (error && !user) {
    return (
      <main className="owner-appointments-page">
        <div className="appointments-error-page">
          <div className="appointments-error-card">
            <div className="appointments-error-icon">
              <AiOutlineClose />
            </div>

            <h1>Access unavailable</h1>
            <p>{error}</p>

            <Link
              href="/login"
              className="appointments-error-button"
            >
              Go to Login
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="owner-appointments-page">
      {/* SIDEBAR */}
      <aside className="appointments-sidebar">
        <Link href="/dashboard" className="appointments-logo">
          <span className="appointments-logo-mark">S</span>
          <span>Slotify</span>
        </Link>

        <div className="appointments-sidebar-section">
          <span className="appointments-sidebar-label">
            WORKSPACE
          </span>

          <nav className="appointments-sidebar-nav">
            <Link
              href="/owner/businesses"
              className="appointments-sidebar-link"
            >
              <AiOutlineShop />
              <span>My Businesses</span>
            </Link>

            <Link
              href="/owner/services"
              className="appointments-sidebar-link"
            >
              <AiOutlineAppstore />
              <span>Manage Services</span>
            </Link>

            <Link
              href="/owner/availability"
              className="appointments-sidebar-link"
            >
              <AiOutlineClockCircle />
              <span>Availability</span>
            </Link>

            <Link
              href="/owner/appointments"
              className="appointments-sidebar-link active"
            >
              <AiOutlineCalendar />
              <span>Appointments</span>
            </Link>
          </nav>
        </div>

        <div className="appointments-sidebar-section appointments-sidebar-section-lower">
          <span className="appointments-sidebar-label">
            QUICK ACCESS
          </span>

          <nav className="appointments-sidebar-nav">
            <Link
              href="/dashboard"
              className="appointments-sidebar-link"
            >
              <AiOutlineAppstore />
              <span>Customer Dashboard</span>
            </Link>
          </nav>
        </div>

        <div className="appointments-sidebar-bottom">
          {user && (
            <div className="appointments-user">
              <div className="appointments-user-avatar">
                {user.name?.charAt(0).toUpperCase()}
              </div>

              <div className="appointments-user-info">
                <strong>{user.name}</strong>
                <span>Business Owner</span>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="appointments-logout-icon"
                aria-label="Logout"
                title="Logout"
              >
                <AiOutlineLogout />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* MAIN */}
      <section className="appointments-main">
        <header className="appointments-topbar">
          <div className="appointments-breadcrumb">
            <span>Owner</span>
            <span>/</span>
            <strong>Appointments</strong>
          </div>

          <Link
            href="/dashboard"
            className="appointments-topbar-link"
          >
            Customer Dashboard
          </Link>
        </header>

        <div className="appointments-content">
          {/* PAGE HEADER */}
          <div className="appointments-page-header">
            <div>
              <div className="appointments-eyebrow">
                <span className="appointments-header-icon">
                  <AiOutlineCalendar />
                </span>
                BUSINESS MANAGEMENT
              </div>

              <h1>Appointments</h1>

              <p>
                Review and manage appointments booked with your
                business.
              </p>
            </div>
          </div>

          {/* BUSINESS SELECTOR */}
          <div className="appointments-selector-card">
            <div className="appointments-selector-info">
              <div className="appointments-selector-icon">
                <AiOutlineShop />
              </div>

              <div>
                <span className="appointments-selector-label">
                  MANAGE BUSINESS
                </span>

                <strong>
                  Select a business to view appointments
                </strong>
              </div>
            </div>

            {loadingBusinesses ? (
              <div className="appointments-selector-loading">
                Loading businesses...
              </div>
            ) : businesses.length > 0 ? (
              <select
                value={selectedBusinessId ?? ""}
                onChange={(event) =>
                  setSelectedBusinessId(event.target.value || null) }
                className="appointments-selector"
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
            ) : (
              <Link
                href="/owner/businesses"
                className="appointments-create-business-button"
              >
                Create Business
              </Link>
            )}
          </div>

          {/* SELECTED BUSINESS */}
          {selectedBusiness && (
            <div className="appointments-selected-banner">
              <div className="appointments-selected-icon">
                <AiOutlineShop />
              </div>

              <div className="appointments-selected-info">
                <span>APPOINTMENTS FOR</span>

                <h2>{selectedBusiness.name}</h2>

                <div className="appointments-selected-meta">
                  {selectedBusiness.category && (
                    <span>{selectedBusiness.category}</span>
                  )}

                  {selectedBusiness.location && (
                    <>
                      <span className="appointments-meta-divider">
                        •
                      </span>

                      <span>
                        <AiOutlineEnvironment />
                        {selectedBusiness.location}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ERROR */}
          {error && (
            <div className="appointments-message appointments-message-error">
              <AiOutlineClose />
              <span>{error}</span>
            </div>
          )}

          {selectedBusiness && (
            <>
              {/* STATS */}
              <section className="appointments-stats">
                <div className="appointments-stat">
                  <div className="appointments-stat-icon">
                    <AiOutlineCalendar />
                  </div>

                  <div>
                    <span>Total</span>
                    <strong>{totalAppointments}</strong>
                  </div>
                </div>

                <div className="appointments-stat">
                  <div className="appointments-stat-icon">
                    <AiOutlineClockCircle />
                  </div>

                  <div>
                    <span>Pending</span>
                    <strong>{pendingAppointments}</strong>
                  </div>
                </div>

                <div className="appointments-stat">
                  <div className="appointments-stat-icon">
                    <AiOutlineCheck />
                  </div>

                  <div>
                    <span>Confirmed</span>
                    <strong>{confirmedAppointments}</strong>
                  </div>
                </div>

                <div className="appointments-stat">
                  <div className="appointments-stat-icon">
                    <AiOutlineCheckCircle />
                  </div>

                  <div>
                    <span>Completed</span>
                    <strong>{completedAppointments}</strong>
                  </div>
                </div>
              </section>

              {/* APPOINTMENTS */}
              <section className="appointments-section">
                <div className="appointments-section-header">
                  <div>
                    <span className="appointments-section-eyebrow">
                      BOOKING ACTIVITY
                    </span>

                    <h2>Appointment History</h2>
                  </div>

                  <span className="appointments-count">
                    {totalAppointments}{" "}
                    {totalAppointments === 1
                      ? "appointment"
                      : "appointments"}
                  </span>
                </div>

                {loadingBookings ? (
                  <div className="appointments-loading-card">
                    <div className="appointments-loading-spinner" />
                    <p>Loading appointments...</p>
                  </div>
                ) : bookings.length === 0 ? (
                  <div className="appointments-empty-card">
                    <div className="appointments-empty-icon">
                      <AiOutlineCalendar />
                    </div>

                    <h3>No appointments yet</h3>

                    <p>
                      When customers book services with this
                      business, their appointments will appear
                      here.
                    </p>

                    <Link
                      href={`/businesses/${selectedBusiness.id}`}
                      className="appointments-empty-button"
                    >
                      View Business
                    </Link>
                  </div>
                ) : (
                  <div className="appointments-list">
                    {bookings.map((booking) => {
                      const isUpdating =
                        updatingBookingId === booking.id;

                      return (
                        <article
                          key={booking.id}
                          className="appointment-card"
                        >
                          {/* CARD HEADER */}
                          <div className="appointment-card-header">
                            <div className="appointment-service">
                              <span className="appointment-service-label">
                                SERVICE
                              </span>

                              <h3>
                                {booking.service_name ||
                                  "Service"}
                              </h3>
                            </div>

                            <span
                              className={`appointment-status ${getStatusClass(
                                booking.status
                              )}`}
                            >
                              {booking.status === "PENDING" && (
                                <AiOutlineClockCircle />
                              )}

                              {booking.status === "CONFIRMED" && (
                                <AiOutlineCheck />
                              )}

                              {booking.status === "COMPLETED" && (
                                <AiOutlineCheckCircle />
                              )}

                              {booking.status === "CANCELLED" && (
                                <AiOutlineClose />
                              )}

                              {booking.status}
                            </span>
                          </div>

                          {/* DETAILS */}
                          <div className="appointment-details">
                            <div className="appointment-detail">
                              <div className="appointment-detail-icon">
                                <AiOutlineUser />
                              </div>

                              <div>
                                <span className="appointment-detail-label">
                                  CUSTOMER
                                </span>

                                <strong className="appointment-detail-value">
                                  {booking.customer_name ||
                                    "Customer"}
                                </strong>
                              </div>
                            </div>

                            <div className="appointment-detail">
                              <div className="appointment-detail-icon">
                                <AiOutlineCalendar />
                              </div>

                              <div>
                                <span className="appointment-detail-label">
                                  DATE
                                </span>

                                <strong className="appointment-detail-value">
                                  {formatDate(
                                    booking.booking_date
                                  )}
                                </strong>
                              </div>
                            </div>

                            <div className="appointment-detail">
                              <div className="appointment-detail-icon">
                                <AiOutlineClockCircle />
                              </div>

                              <div>
                                <span className="appointment-detail-label">
                                  TIME
                                </span>

                                <strong className="appointment-detail-value">
                                  {formatTime(
                                    booking.start_time
                                  )}
                                </strong>

                                {booking.duration && (
                                  <span className="appointment-detail-subtext">
                                    {booking.duration} min
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="appointment-detail">
                              <div className="appointment-detail-icon">
                                <span className="appointment-currency">
                                  ₨
                                </span>
                              </div>

                              <div>
                                <span className="appointment-detail-label">
                                  PRICE
                                </span>

                                <strong className="appointment-detail-value">
                                  ₨{" "}
                                  {Number(
                                    booking.price || 0
                                  ).toLocaleString()}
                                </strong>
                              </div>
                            </div>
                          </div>

                          {/* ACTIONS */}
                          {(booking.status === "PENDING" ||
                            booking.status === "CONFIRMED") && (
                            <div className="appointment-actions">
                              {booking.status === "PENDING" && (
                                <button
                                  type="button"
                                  className="appointment-action-button appointment-confirm-button"
                                  disabled={isUpdating}
                                  onClick={() =>
                                    handleStatusUpdate(
                                      booking,
                                      "CONFIRMED"
                                    )
                                  }
                                >
                                  <AiOutlineCheck />

                                  {isUpdating
                                    ? "Updating..."
                                    : "Confirm"}
                                </button>
                              )}

                              {booking.status === "CONFIRMED" && (
                                <button
                                  type="button"
                                  className="appointment-action-button appointment-complete-button"
                                  disabled={isUpdating}
                                  onClick={() =>
                                    handleStatusUpdate(
                                      booking,
                                      "COMPLETED"
                                    )
                                  }
                                >
                                  <AiOutlineCheckCircle />

                                  {isUpdating
                                    ? "Updating..."
                                    : "Mark Completed"}
                                </button>
                              )}

                              <button
                                type="button"
                                className="appointment-action-button appointment-cancel-button"
                                disabled={isUpdating}
                                onClick={() =>
                                  handleCancel(booking)
                                }
                              >
                                <AiOutlineClose />

                                {isUpdating
                                  ? "Updating..."
                                  : "Cancel"}
                              </button>
                            </div>
                          )}

                          {booking.status === "COMPLETED" && (
                            <div className="appointment-note appointment-note-completed">
                              <AiOutlineCheckCircle />

                              <span>
                                This appointment has been
                                completed.
                              </span>
                            </div>
                          )}

                          {booking.status === "CANCELLED" && (
                            <div className="appointment-note appointment-note-cancelled">
                              <AiOutlineClose />

                              <span>
                                This appointment was cancelled.
                              </span>
                            </div>
                          )}
                        </article>
                      );
                    })}
                  </div>
                )}
              </section>
            </>
          )}
        </div>

        <footer className="appointments-page-footer">
          <span>Slotify</span>
          <span>•</span>
          <span>Appointment Management</span>
        </footer>
      </section>
    </main>
  );
}