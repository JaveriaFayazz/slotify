"use client";

import {
  AiOutlineArrowLeft,
  AiOutlineCalendar,
  AiOutlineCheckCircle,
  AiOutlineClockCircle,
  AiOutlineEnvironment,
  AiOutlineRight,
  AiOutlineShop,
} from "react-icons/ai";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import {
  getAllBusinesses,
  Business,
} from "../../../services/business.service";

import {
  getBusinessServices,
  Service,
} from "../../../services/service.service";

import {
  getAvailableSlots,
  createBooking,
} from "../../../services/booking.service";

export default function BookingPage() {
  const params = useParams();
  const searchParams = useSearchParams();

  const businessId = String(params.id);
  const serviceId = searchParams.get("serviceId");

  const [business, setBusiness] = useState<Business | null>(null);
  const [service, setService] = useState<Service | null>(null);

  const [bookingDate, setBookingDate] = useState("");
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [selectedTime, setSelectedTime] = useState("");

  const [loading, setLoading] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [booking, setBooking] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Load business and selected service
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError("");

        if (!serviceId) {
          setError("No service was selected.");
          return;
        }

        const businesses = await getAllBusinesses();

        const selectedBusiness = businesses.find(
          (item) => item.id === businessId
        );

        if (!selectedBusiness) {
          setError("Business not found.");
          return;
        }

        setBusiness(selectedBusiness);

        const services = await getBusinessServices(businessId);

        const selectedService = services.find(
          (item) => item.id === serviceId
        );

        if (!selectedService) {
          setError("Service not found.");
          return;
        }

        setService(selectedService);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load booking information."
        );
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [businessId, serviceId]);

  // Load available slots when date changes
  useEffect(() => {
    async function loadAvailableSlots() {
      if (!bookingDate || !serviceId) {
        setAvailableSlots([]);
        setSelectedTime("");
        return;
      }

      try {
        setLoadingSlots(true);
        setError("");
        setSuccess("");
        setSelectedTime("");

        const slots = await getAvailableSlots(
          serviceId,
          bookingDate
        );

        setAvailableSlots(slots);
      } catch (err) {
        setAvailableSlots([]);

        setError(
          err instanceof Error
            ? err.message
            : "Failed to load available times."
        );
      } finally {
        setLoadingSlots(false);
      }
    }

    loadAvailableSlots();
  }, [bookingDate, serviceId]);

  async function handleBooking() {
    if (!serviceId || !bookingDate || !selectedTime) {
      setError("Please select a date and time.");
      return;
    }

    try {
      setBooking(true);
      setError("");
      setSuccess("");

      await createBooking(
        serviceId,
        bookingDate,
        selectedTime
      );

      setSuccess(
        "Your booking has been created successfully!"
      );

      const updatedSlots = await getAvailableSlots(
        serviceId,
        bookingDate
      );

      setAvailableSlots(updatedSlots);
      setSelectedTime("");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to create booking."
      );
    } finally {
      setBooking(false);
    }
  }

  // Loading state
  if (loading) {
    return (
      <main className="booking-saas-page">
        <nav className="booking-navbar">
          <Link href="/" className="booking-logo">
            <span className="booking-logo-mark">S</span>
            Slotify
          </Link>

          <div className="booking-nav-links">
            <Link href="/dashboard">Dashboard</Link>
            <Link href="/bookings">My Bookings</Link>
          </div>
        </nav>

        <div className="booking-loading">
          <div className="booking-loading-card">
            <AiOutlineClockCircle />
            <h2>Loading booking information</h2>
            <p>Please wait while we prepare your appointment.</p>
          </div>
        </div>
      </main>
    );
  }

  // Error state
  if (error && (!business || !service)) {
    return (
      <main className="booking-saas-page">
        <nav className="booking-navbar">
          <Link href="/" className="booking-logo">
            <span className="booking-logo-mark">S</span>
            Slotify
          </Link>

          <div className="booking-nav-links">
            <Link href="/dashboard">Dashboard</Link>
            <Link href="/bookings">My Bookings</Link>
          </div>
        </nav>

        <div className="booking-error-page">
          <div className="booking-error-card">
            <div className="booking-error-icon">!</div>

            <h2>Unable to load booking</h2>
            <p>{error}</p>

            <Link
              href={`/businesses/${businessId}`}
              className="booking-primary-button"
            >
              <AiOutlineArrowLeft />
              Back to Services
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="booking-saas-page">
      {/* Navigation */}
      <nav className="booking-navbar">
        <Link href="/" className="booking-logo">
          <span className="booking-logo-mark">S</span>
          Slotify
        </Link>

        <div className="booking-nav-links">
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/bookings">My Bookings</Link>
        </div>
      </nav>

      {/* Main */}
      <div className="booking-main">
        <div className="booking-content">

          {/* Back */}
          <Link
            href={`/businesses/${businessId}`}
            className="booking-back-link"
          >
            <AiOutlineArrowLeft />
            Back to Services
          </Link>

          {/* Header */}
          <div className="booking-page-header">
            <div>
              <p className="booking-eyebrow">
                BOOK APPOINTMENT
              </p>

              <h1>
                Schedule your appointment
              </h1>

              <p className="booking-header-description">
                Choose a date and time that works best for you.
              </p>
            </div>
          </div>

          {/* Booking layout */}
          <div className="booking-layout">

            {/* Left column */}
            <section className="booking-service-card">

              <div className="booking-service-icon">
                <AiOutlineShop />
              </div>

              <div className="booking-service-content">
                <p className="booking-card-label">
                  SERVICE
                </p>

                <h2>
                  {service?.name}
                </h2>

                <p className="booking-business-name">
                  {business?.name}
                </p>
              </div>

              <div className="booking-service-details">

                <div className="booking-detail">
                  <AiOutlineClockCircle />

                  <div>
                    <span>Duration</span>
                    <strong>
                      {service?.duration} minutes
                    </strong>
                  </div>
                </div>

                <div className="booking-detail">
                  <span className="booking-price-icon">
                    PKR
                  </span>

                  <div>
                    <span>Price</span>
                    <strong>
                      PKR{" "}
                      {Number(
                        service?.price || 0
                      ).toLocaleString()}
                    </strong>
                  </div>
                </div>

                {business?.location && (
                  <div className="booking-detail">
                    <AiOutlineEnvironment />

                    <div>
                      <span>Location</span>
                      <strong>
                        {business.location}
                      </strong>
                    </div>
                  </div>
                )}

              </div>

              <div className="booking-service-note">
                <AiOutlineCheckCircle />

                <p>
                  Your appointment will be confirmed
                  after you complete the booking.
                </p>
              </div>

            </section>

            {/* Right column */}
            <section className="booking-form-card">

              {/* Step 1 */}
              <div className="booking-step">

                <div className="booking-step-heading">
                  <div className="booking-step-number">
                    01
                  </div>

                  <div>
                    <h2>Choose a Date</h2>
                    <p>
                      Select the day for your appointment.
                    </p>
                  </div>
                </div>

                <div className="booking-date-wrapper">
                  <AiOutlineCalendar />

                  <input
                    type="date"
                    value={bookingDate}
                    min={
                      new Date()
                        .toISOString()
                        .split("T")[0]
                    }
                    onChange={(event) =>
                      setBookingDate(event.target.value)
                    }
                    className="booking-date-input"
                  />
                </div>

              </div>

              {/* Step 2 */}
              {bookingDate && (
                <div className="booking-step">

                  <div className="booking-step-heading">
                    <div className="booking-step-number">
                      02
                    </div>

                    <div>
                      <h2>Choose a Time</h2>
                      <p>
                        Select one of the available appointment
                        times.
                      </p>
                    </div>
                  </div>

                  {loadingSlots && (
                    <div className="booking-slots-loading">
                      <AiOutlineClockCircle />
                      <span>
                        Checking available times...
                      </span>
                    </div>
                  )}

                  {!loadingSlots &&
                    availableSlots.length === 0 && (
                      <div className="booking-empty-slots">
                        <AiOutlineCalendar />

                        <div>
                          <strong>
                            No available times
                          </strong>

                          <p>
                            Try selecting another date.
                          </p>
                        </div>
                      </div>
                    )}

                  {!loadingSlots &&
                    availableSlots.length > 0 && (
                      <div className="booking-time-grid">

                        {availableSlots.map(
                          (slot) => (
                            <button
                              key={slot}
                              type="button"
                              className={`booking-time-slot ${
                                selectedTime === slot
                                  ? "selected"
                                  : ""
                              }`}
                              onClick={() => {
                                setSelectedTime(slot);
                                setSuccess("");
                                setError("");
                              }}
                            >
                              <AiOutlineClockCircle />
                              {slot}

                              {selectedTime === slot && (
                                <AiOutlineCheckCircle />
                              )}
                            </button>
                          )
                        )}

                      </div>
                    )}

                </div>
              )}

              {/* Messages */}
              {error && (
                <div className="booking-message booking-message-error">
                  <strong>Booking error</strong>
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="booking-message booking-message-success">
                  <AiOutlineCheckCircle />

                  <div>
                    <strong>Booking confirmed</strong>
                    <span>{success}</span>
                  </div>
                </div>
              )}

              {/* Summary */}
              {bookingDate && selectedTime && !success && (
                <div className="booking-summary">

                  <div className="booking-summary-header">
                    <span>YOUR APPOINTMENT</span>
                  </div>

                  <div className="booking-summary-row">
                    <span>Date</span>
                    <strong>{bookingDate}</strong>
                  </div>

                  <div className="booking-summary-row">
                    <span>Time</span>
                    <strong>{selectedTime}</strong>
                  </div>

                  <div className="booking-summary-row">
                    <span>Service</span>
                    <strong>{service?.name}</strong>
                  </div>

                </div>
              )}

              {/* Booking button */}
              {bookingDate &&
                availableSlots.length > 0 &&
                !success && (
                  <button
                    type="button"
                    onClick={handleBooking}
                    disabled={!selectedTime || booking}
                    className="booking-confirm-button"
                  >
                    {booking ? (
                      <>
                        <span className="booking-spinner" />
                        Creating Booking...
                      </>
                    ) : selectedTime ? (
                      <>
                        Confirm Booking
                        <AiOutlineRight />
                      </>
                    ) : (
                      <>
                        Select a Time
                        <AiOutlineRight />
                      </>
                    )}
                  </button>
                )}

              {success && (
                <Link
                  href="/bookings"
                  className="booking-view-button"
                >
                  View My Bookings
                  <AiOutlineRight />
                </Link>
              )}

            </section>
          </div>

        </div>
      </div>
    </main>
  );
}