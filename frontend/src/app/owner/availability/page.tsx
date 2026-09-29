"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";

import {
  Business,
  getMyBusinesses,
} from "../../services/business.service";

import {
  getStoredUser,
  logout,
  User,
} from "../../services/auth.service";

import {
  Availability,
  createAvailability,
  deleteAvailability,
  getMyAvailability,
  updateAvailability,
} from "../../services/availability.service";


const DAYS = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
];


export default function AvailabilityPage() {
  const [user, setUser] = useState<User | null>(null);

  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [selectedBusinessId, setSelectedBusinessId] =
    useState("");

  const [availability, setAvailability] =
    useState<Availability[]>([]);

  const [loadingBusinesses, setLoadingBusinesses] =
    useState(true);

  const [loadingAvailability, setLoadingAvailability] =
    useState(false);

  const [showForm, setShowForm] = useState(false);

  const [editingAvailabilityId, setEditingAvailabilityId] =
    useState<string | null>(null);

  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [dayOfWeek, setDayOfWeek] = useState("1");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");


  useEffect(() => {
    const storedUser = getStoredUser();

    if (!storedUser) {
      setError("Please log in first.");
      setLoadingBusinesses(false);
      return;
    }

    setUser(storedUser);

    if (storedUser.role !== "OWNER") {
      setError(
        "This page is only available to business owners."
      );
      setLoadingBusinesses(false);
      return;
    }

    loadBusinesses();
  }, []);


  async function loadBusinesses() {
    try {
      setLoadingBusinesses(true);
      setError("");

      const data = await getMyBusinesses();

      setBusinesses(data);

      if (data.length > 0) {
        setSelectedBusinessId(data[0].id);
      }
    } catch (err) {
      console.error(
        "Failed to load businesses:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to load businesses."
      );
    } finally {
      setLoadingBusinesses(false);
    }
  }


  useEffect(() => {
    if (!selectedBusinessId) {
      setAvailability([]);
      return;
    }

    loadAvailability(selectedBusinessId);
  }, [selectedBusinessId]);


  async function loadAvailability(
    businessId: string
  ) {
    try {
      setLoadingAvailability(true);
      setError("");

      const data =
        await getMyAvailability(businessId);

      setAvailability(data);
    } catch (err) {
      console.error(
        "Failed to load availability:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to load availability."
      );
    } finally {
      setLoadingAvailability(false);
    }
  }


  function resetForm() {
    setDayOfWeek("1");
    setStartTime("09:00");
    setEndTime("17:00");

    setEditingAvailabilityId(null);
    setShowForm(false);
  }


  function openAddForm() {
    setError("");
    setSuccess("");

    setDayOfWeek("1");
    setStartTime("09:00");
    setEndTime("17:00");

    setEditingAvailabilityId(null);
    setShowForm(true);
  }


  function openEditForm(
    item: Availability
  ) {
    setError("");
    setSuccess("");

    setDayOfWeek(
      String(item.day_of_week)
    );

    setStartTime(
      item.start_time.slice(0, 5)
    );

    setEndTime(
      item.end_time.slice(0, 5)
    );

    setEditingAvailabilityId(item.id);
    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }


  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!selectedBusinessId) {
      setError("Please select a business.");
      return;
    }

    if (!startTime || !endTime) {
      setError(
        "Please select both start and end times."
      );
      return;
    }

    if (startTime >= endTime) {
      setError(
        "End time must be later than start time."
      );
      return;
    }

    try {
      setSaving(true);

      const data = {
        businessId: selectedBusinessId,
        dayOfWeek: Number(dayOfWeek),
        startTime,
        endTime,
      };

      if (editingAvailabilityId) {
        const updated =
          await updateAvailability(
            editingAvailabilityId,
            data
          );

        setAvailability(
          (current) =>
            current.map((item) =>
              item.id ===
              editingAvailabilityId
                ? updated
                : item
            )
        );

        setSuccess(
          "Availability updated successfully."
        );
      } else {
        const created =
          await createAvailability(data);

        setAvailability(
          (current) => [
            ...current,
            created,
          ]
        );

        setSuccess(
          "Availability added successfully."
        );
      }

      resetForm();

    } catch (err) {
      console.error(
        "Save availability error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to save availability."
      );
    } finally {
      setSaving(false);
    }
  }


  async function handleDelete(
    item: Availability
  ) {
    const dayName =
      DAYS.find(
        (day) =>
          day.value === item.day_of_week
      )?.label || "Unknown day";

    const confirmed =
      window.confirm(
        `Are you sure you want to delete ${dayName}'s availability?`
      );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      await deleteAvailability(
        item.id,
        selectedBusinessId
      );

      setAvailability(
        (current) =>
          current.filter(
            (availabilityItem) =>
              availabilityItem.id !==
              item.id
          )
      );

      setSuccess(
        "Availability deleted successfully."
      );

    } catch (err) {
      console.error(
        "Delete availability error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to delete availability."
      );
    }
  }


  function handleLogout() {
    logout();
    window.location.href = "/login";
  }


  const selectedBusiness =
    businesses.find(
      (business) =>
        business.id ===
        selectedBusinessId
    );


  function getDayName(
    dayOfWeek: number
  ) {
    return (
      DAYS.find(
        (day) =>
          day.value === dayOfWeek
      )?.label || "Unknown"
    );
  }


  function formatTime(
    time: string
  ) {
    const [hours, minutes] =
      time.split(":");

    const hour =
      Number(hours);

    const suffix =
      hour >= 12
        ? "PM"
        : "AM";

    const displayHour =
      hour % 12 || 12;

    return `${displayHour}:${minutes} ${suffix}`;
  }


  if (loadingBusinesses) {
    return (
      <main className="owner-availability-page">
        <div className="availability-loading">
          Loading availability...
        </div>
      </main>
    );
  }


  if (!user) {
    return (
      <main className="owner-availability-page">
        <div className="availability-message error">
          {error || "Please log in first."}
        </div>
      </main>
    );
  }


  if (user.role !== "OWNER") {
    return (
      <main className="owner-availability-page">

        <nav className="availability-navbar">

          <Link
            href="/"
            className="availability-logo"
          >
            Slotify
          </Link>

          <div className="availability-nav-links">

            <Link href="/dashboard">
              Dashboard
            </Link>

            <button
              onClick={handleLogout}
              className="availability-logout"
            >
              Logout
            </button>

          </div>

        </nav>

        <div className="availability-message error">
          This page is only available to
          business owners.
        </div>

      </main>
    );
  }


  return (
    <main className="owner-availability-page">

      {/* NAVBAR */}

      <nav className="availability-navbar">

        <Link
          href="/"
          className="availability-logo"
        >
          Slotify
        </Link>

        <div className="availability-nav-links">

          <Link href="/dashboard">
            Dashboard
          </Link>

          <Link href="/owner/businesses">
            My Businesses
          </Link>

          <Link href="/owner/services">
            Services
          </Link>

          <Link
            href="/owner/availability"
            className="active"
          >
            Availability
          </Link>

          <button
            onClick={handleLogout}
            className="availability-logout"
          >
            Logout
          </button>

        </div>

      </nav>


      {/* MAIN CONTENT */}

      <section className="availability-content">

        <div className="availability-hero">

          <div>

            <span className="availability-eyebrow">
              BUSINESS OWNER
            </span>

            <h1>
              Availability
            </h1>

            <p>
              Set the days and hours when
              customers can book appointments.
            </p>

          </div>

          <div className="availability-hero-icon">
            🕐
          </div>

        </div>


        {/* BUSINESS SELECTOR */}

        <div className="availability-selector-card">

          <div>

            <span className="selector-label">
              SELECT BUSINESS
            </span>

            <h2>
              Which business are you managing?
            </h2>

            <p>
              Choose a business to manage
              its working hours.
            </p>

          </div>


          {businesses.length > 0 ? (

            <select
              value={selectedBusinessId}
              onChange={(event) => {
                setSelectedBusinessId(
                  event.target.value
                );

                setShowForm(false);
                setEditingAvailabilityId(
                  null
                );

                setSuccess("");
                setError("");
              }}
              className="availability-selector"
            >

              {businesses.map(
                (business) => (

                  <option
                    key={business.id}
                    value={business.id}
                  >
                    {business.name}
                  </option>

                )
              )}

            </select>

          ) : (

            <div className="no-business-selected">
              You don't have any businesses yet.
            </div>

          )}

        </div>


        {/* NO BUSINESS */}

        {businesses.length === 0 ? (

          <div className="empty-availability-card">

            <div className="empty-icon">
              🏢
            </div>

            <h2>
              Create a business first
            </h2>

            <p>
              You need to create a business
              before setting availability.
            </p>

            <Link
              href="/owner/businesses"
              className="primary-availability-button"
            >
              Go to My Businesses →
            </Link>

          </div>

        ) : (

          <>

            {/* CURRENT BUSINESS */}

            {selectedBusiness && (

              <div className="selected-availability-banner">

                <div className="selected-availability-icon">
                  🏢
                </div>

                <div>

                  <span>
                    MANAGING AVAILABILITY FOR
                  </span>

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


            {/* HEADER */}

            <div className="availability-section-header">

              <div>

                <span className="availability-section-eyebrow">
                  WORKING HOURS
                </span>

                <h2>
                  Your Availability
                </h2>

              </div>

              <button
                onClick={openAddForm}
                className="add-availability-button"
              >
                + Add Availability
              </button>

            </div>


            {/* FORM */}

            {showForm && (

              <div className="availability-form-card">

                <div className="availability-form-heading">

                  <div className="availability-form-icon">
                    {editingAvailabilityId
                      ? "✏️"
                      : "➕"}
                  </div>

                  <div>

                    <h2>
                      {editingAvailabilityId
                        ? "Edit Availability"
                        : "Add Availability"}
                    </h2>

                    <p>
                      Set the working hours
                      for a day of the week.
                    </p>

                  </div>

                </div>


                <form onSubmit={handleSubmit}>

                  <div className="availability-form-group">

                    <label htmlFor="availability-day">
                      Day of Week
                    </label>

                    <select
                      id="availability-day"
                      value={dayOfWeek}
                      onChange={(event) =>
                        setDayOfWeek(
                          event.target.value
                        )
                      }
                    >

                      {DAYS.map(
                        (day) => (

                          <option
                            key={day.value}
                            value={day.value}
                          >
                            {day.label}
                          </option>

                        )
                      )}

                    </select>

                  </div>


                  <div className="availability-time-row">

                    <div className="availability-form-group">

                      <label htmlFor="start-time">
                        Start Time
                      </label>

                      <input
                        id="start-time"
                        type="time"
                        value={startTime}
                        onChange={(event) =>
                          setStartTime(
                            event.target.value
                          )
                        }
                      />

                    </div>


                    <div className="availability-form-group">

                      <label htmlFor="end-time">
                        End Time
                      </label>

                      <input
                        id="end-time"
                        type="time"
                        value={endTime}
                        onChange={(event) =>
                          setEndTime(
                            event.target.value
                          )
                        }
                      />

                    </div>

                  </div>


                  {error && (

                    <div className="availability-form-message error">
                      {error}
                    </div>

                  )}


                  {success && (

                    <div className="availability-form-message success">
                      {success}
                    </div>

                  )}


                  <div className="availability-form-actions">

                    <button
                      type="button"
                      onClick={resetForm}
                      className="cancel-availability-button"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      className="save-availability-button"
                      disabled={saving}
                    >
                      {saving
                        ? "Saving..."
                        : editingAvailabilityId
                        ? "Update Availability →"
                        : "Add Availability →"}
                    </button>

                  </div>

                </form>

              </div>

            )}


            {/* GLOBAL MESSAGES */}

            {!showForm && error && (

              <div className="availability-message error">
                {error}
              </div>

            )}

            {!showForm && success && (

              <div className="availability-message success">
                {success}
              </div>

            )}


            {/* AVAILABILITY LIST */}

            {loadingAvailability ? (

              <div className="availability-loading-card">
                Loading your availability...
              </div>

            ) : availability.length === 0 ? (

              <div className="empty-availability-card">

                <div className="empty-icon">
                  🕐
                </div>

                <h2>
                  No availability yet
                </h2>

                <p>
                  Add your working hours so
                  customers know when they can
                  book appointments.
                </p>

                <button
                  onClick={openAddForm}
                  className="primary-availability-button"
                >
                  + Add Your First Availability
                </button>

              </div>

            ) : (

              <div className="availability-grid">

                {availability.map(
                  (item) => (

                    <div
                      key={item.id}
                      className="availability-card"
                    >

                      <div className="availability-card-top">

                        <div className="availability-day-icon">
                          📅
                        </div>

                        <div className="availability-card-actions">

                          <button
                            onClick={() =>
                              openEditForm(item)
                            }
                            className="edit-availability-button"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() =>
                              handleDelete(item)
                            }
                            className="delete-availability-button"
                          >
                            Delete
                          </button>

                        </div>

                      </div>


                      <h3>
                        {getDayName(
                          item.day_of_week
                        )}
                      </h3>


                      <div className="availability-time-display">

                        <div>

                          <small>
                            START
                          </small>

                          <strong>
                            {formatTime(
                              item.start_time
                            )}
                          </strong>

                        </div>


                        <span>
                          →
                        </span>


                        <div>

                          <small>
                            END
                          </small>

                          <strong>
                            {formatTime(
                              item.end_time
                            )}
                          </strong>

                        </div>

                      </div>

                    </div>

                  )
                )}

              </div>

            )}

          </>

        )}

      </section>

    </main>
  );
}