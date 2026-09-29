"use client";

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

        // Get business
        const businesses = await getAllBusinesses();

        const selectedBusiness = businesses.find(
          (item) => item.id === businessId
        );

        if (!selectedBusiness) {
          setError("Business not found.");
          return;
        }

        setBusiness(selectedBusiness);

        // Get services for this business
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

      // Show success message
      setSuccess(
        "Your booking has been created successfully!"
      );

      // Refresh available slots after booking
      const updatedSlots = await getAvailableSlots(
        serviceId,
        bookingDate
      );

      setAvailableSlots(updatedSlots);

      // Clear selected time after successful booking
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
      <main className="dashboard-page">
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
          </div>
        </nav>

        <div className="business-state">
          Loading booking information...
        </div>
      </main>
    );
  }

  // Error state
  if (error && (!business || !service)) {
    return (
      <main className="dashboard-page">
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
          </div>
        </nav>

        <div className="business-state error">
          {error}
        </div>

        <div className="business-back">
          <Link
            href={`/businesses/${businessId}`}
            className="business-button"
          >
            ← Back to Services
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
          <Link href="/dashboard">
            Dashboard
          </Link>

          <Link href="/bookings">
            My Bookings
          </Link>
        </div>
      </nav>

      {/* Booking Header */}
      <section className="booking-page-container">

        <Link
          href={`/businesses/${businessId}`}
          className="back-link"
        >
          ← Back to Services
        </Link>

        <div className="booking-header">
          <p className="eyebrow">
            BOOK APPOINTMENT
          </p>

          <h1>
            {service?.name}
          </h1>

          <p>
            {business?.name}
          </p>
        </div>

        {/* Service information */}
        <div className="booking-service-card">

          <div>
            <h2>
              {service?.name}
            </h2>

            <p>
              {service?.description ||
                "No description provided."}
            </p>
          </div>

          <div className="booking-service-details">

            <span>
              ⏱ {service?.duration} minutes
            </span>

            <span>
              PKR{" "}
              {Number(
                service?.price || 0
              ).toLocaleString()}
            </span>

          </div>
        </div>

        {/* Date selection */}
        <section className="booking-section">

          <h2>
            1. Choose a Date
          </h2>

          <p>
            Select the date you want to book your
            appointment.
          </p>

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

        </section>

        {/* Time selection */}
        {bookingDate && (
          <section className="booking-section">

            <h2>
              2. Choose a Time
            </h2>

            <p>
              Available appointment times for{" "}
              {bookingDate}.
            </p>

            {loadingSlots && (
              <div className="business-state">
                Loading available times...
              </div>
            )}

            {!loadingSlots &&
              availableSlots.length === 0 && (
                <div className="business-state">
                  No available times for this date.
                </div>
              )}

            {!loadingSlots &&
              availableSlots.length > 0 && (
                <div className="time-slots-grid">

                  {availableSlots.map(
                    (slot) => (
                      <button
                        key={slot}
                        type="button"
                        className={`time-slot ${
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
                        {slot}
                      </button>
                    )
                  )}

                </div>
              )}

          </section>
        )}

        {/* Error */}
        {error && (
          <div className="booking-message error">
            {error}
          </div>
        )}

        {/* Success */}
        {success && (
          <div className="booking-message success">
            {success}
          </div>
        )}

        {/* Booking button */}
        {bookingDate &&
          availableSlots.length > 0 &&
          !success && (
            <section className="booking-action">

              <button
                type="button"
                onClick={handleBooking}
                disabled={
                  !selectedTime || booking
                }
                className="business-button booking-button"
              >
                {booking
                  ? "Creating Booking..."
                  : selectedTime
                    ? `Book ${selectedTime}`
                    : "Select a Time"}
              </button>

            </section>
          )}

      </section>
    </main>
  );
}