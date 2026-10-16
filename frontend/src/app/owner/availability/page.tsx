"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";

import {
  AiOutlineAppstore,
  AiOutlineCalendar,
  AiOutlineCheckCircle,
  AiOutlineClockCircle,
  AiOutlineDelete,
  AiOutlineEdit,
  AiOutlineEnvironment,
  AiOutlineLogout,
  AiOutlinePlus,
  AiOutlineRight,
  AiOutlineShop,
  AiOutlineTool,
  AiOutlineUser,
} from "react-icons/ai";

import { toast } from "sonner";

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
  const [selectedBusinessId, setSelectedBusinessId] = useState("");

  const [availability, setAvailability] = useState<Availability[]>([]);

  const [loadingBusinesses, setLoadingBusinesses] = useState(true);
  const [loadingAvailability, setLoadingAvailability] = useState(false);

  const [showForm, setShowForm] = useState(false);

  const [editingAvailabilityId, setEditingAvailabilityId] =
    useState<string | null>(null);

  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

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
      setError("This page is only available to business owners.");
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
      console.error("Failed to load businesses:", err);

      const message =
        err instanceof Error
          ? err.message
          : "Failed to load businesses.";

      setError(message);
      toast.error(message);
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

  async function loadAvailability(businessId: string) {
    try {
      setLoadingAvailability(true);
      setError("");

      const data = await getMyAvailability(businessId);

      setAvailability(data);
    } catch (err) {
      console.error("Failed to load availability:", err);

      const message =
        err instanceof Error
          ? err.message
          : "Failed to load availability.";

      setError(message);
      toast.error(message);
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
    setError("");
  }

  function openAddForm() {
    setError("");

    setDayOfWeek("1");
    setStartTime("09:00");
    setEndTime("17:00");

    setEditingAvailabilityId(null);
    setShowForm(true);
  }

  function openEditForm(item: Availability) {
    setError("");

    setDayOfWeek(String(item.day_of_week));
    setStartTime(item.start_time.slice(0, 5));
    setEndTime(item.end_time.slice(0, 5));

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

    if (!selectedBusinessId) {
      toast.error("Please select a business.");
      return;
    }

    if (!startTime || !endTime) {
      toast.error("Please select both start and end times.");
      return;
    }

    if (startTime >= endTime) {
      toast.error("End time must be later than start time.");
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
        const updated = await updateAvailability(
          editingAvailabilityId,
          data
        );

        setAvailability((current) =>
          current.map((item) =>
            item.id === editingAvailabilityId
              ? updated
              : item
          )
        );

        toast.success(
          "Availability updated successfully."
        );
      } else {
        const created = await createAvailability(data);

        setAvailability((current) => [
          ...current,
          created,
        ]);

        toast.success(
          "Availability added successfully."
        );
      }

      setDayOfWeek("1");
      setStartTime("09:00");
      setEndTime("17:00");
      setEditingAvailabilityId(null);
      setShowForm(false);
    } catch (err) {
      console.error(
        "Save availability error:",
        err
      );

      const message =
        err instanceof Error
          ? err.message
          : "Failed to save availability.";

      toast.error(message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(item: Availability) {
    const dayName =
      DAYS.find(
        (day) => day.value === item.day_of_week
      )?.label || "Unknown day";

    const confirmed = window.confirm(
      `Are you sure you want to delete ${dayName}'s availability?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await deleteAvailability(
        item.id,
        selectedBusinessId
      );

      setAvailability((current) =>
        current.filter(
          (availabilityItem) =>
            availabilityItem.id !== item.id
        )
      );

      toast.success(
        "Availability deleted successfully."
      );
    } catch (err) {
      console.error(
        "Delete availability error:",
        err
      );

      const message =
        err instanceof Error
          ? err.message
          : "Failed to delete availability.";

      toast.error(message);
    }
  }

  function handleLogout() {
    logout();
    window.location.href = "/login";
  }

  const selectedBusiness = businesses.find(
    (business) =>
      business.id === selectedBusinessId
  );

  function getDayName(dayOfWeek: number) {
    return (
      DAYS.find(
        (day) => day.value === dayOfWeek
      )?.label || "Unknown"
    );
  }

  function formatTime(time: string) {
    const [hours, minutes] = time.split(":");

    const hour = Number(hours);

    const suffix = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;

    return `${displayHour}:${minutes} ${suffix}`;
  }

  if (loadingBusinesses) {
    return (
      <main className="owner-availability-page">
        <div className="availability-loading">
          <div className="loading-spinner" />
          <p>Loading availability...</p>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="owner-availability-page">
        <div className="availability-message error">
          <AiOutlineUser />

          <div>
            <strong>Please log in</strong>

            <p>
              {error || "Please log in first."}
            </p>
          </div>

          <Link href="/login">
            Go to Login
          </Link>
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
            <span className="availability-logo-mark">
              S
            </span>

            Slotify
          </Link>

          <div className="availability-nav-links">

            <Link href="/dashboard">
              <AiOutlineAppstore />
              Dashboard
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className="availability-logout"
            >
              <AiOutlineLogout />
              Logout
            </button>

          </div>

        </nav>

        <div className="availability-message error">
          <AiOutlineUser />

          <div>
            <strong>Access denied</strong>

            <p>
              This page is only available to
              business owners.
            </p>
          </div>
        </div>

      </main>
    );
  }

  return (
    <main className="owner-availability-page">

      {/* SIDEBAR */}

      <aside className="availability-sidebar">

        <Link
          href="/dashboard"
          className="availability-sidebar-logo"
        >
          <span className="availability-logo-mark">
            S
          </span>

          <span>Slotify</span>
        </Link>

        <div className="availability-sidebar-section">

          <span className="availability-sidebar-label">
            MANAGEMENT
          </span>

          <nav className="availability-sidebar-nav">

            <Link
              href="/owner/businesses"
              className="availability-sidebar-link"
            >
              <AiOutlineShop />
              <span>My Businesses</span>
            </Link>

            <Link
              href="/owner/services"
              className="availability-sidebar-link"
            >
              <AiOutlineTool />
              <span>Manage Services</span>
            </Link>

            <Link
              href="/owner/availability"
              className="availability-sidebar-link active"
            >
              <AiOutlineClockCircle />
              <span>Availability</span>
            </Link>

            <Link
              href="/owner/appointments"
              className="availability-sidebar-link"
            >
              <AiOutlineCalendar />
              <span>Appointments</span>
            </Link>

          </nav>

        </div>

        <div className="availability-sidebar-section availability-sidebar-lower">

          <span className="availability-sidebar-label">
            QUICK ACCESS
          </span>

          <nav className="availability-sidebar-nav">

            <Link
              href="/dashboard"
              className="availability-sidebar-link"
            >
              <AiOutlineAppstore />
              <span>Customer Dashboard</span>
            </Link>

          </nav>

        </div>

        <div className="availability-sidebar-bottom">

          <div className="availability-sidebar-user">

            <div className="availability-user-avatar">
              <AiOutlineUser />
            </div>

            <div className="availability-user-info">

              <strong>
                {user.name}
              </strong>

              <span>
                Business Owner
              </span>

            </div>

          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="availability-logout-icon"
            aria-label="Logout"
            title="Logout"
          >
            <AiOutlineLogout />
          </button>

        </div>

      </aside>

      {/* MAIN */}

      <section className="availability-main">

        <div className="availability-topbar">

          <div className="availability-breadcrumb">

            <span>Owner</span>

            <AiOutlineRight />

            <strong>
              Availability
            </strong>

          </div>

          <Link
            href="/owner/businesses"
            className="availability-topbar-link"
          >
            My Businesses
            <AiOutlineRight />
          </Link>

        </div>

        <div className="availability-content">

          {/* PAGE HEADER */}

          <header className="availability-page-header">

            <div>

              <span className="availability-eyebrow">
                BUSINESS MANAGEMENT
              </span>

              <h1>
                Availability
              </h1>

              <p>
                Set the days and hours when customers
                can book appointments with your business.
              </p>

            </div>

            <div className="availability-header-icon">
              <AiOutlineClockCircle />
            </div>

          </header>

          {/* BUSINESS SELECTOR */}

          <section className="availability-selector-card">

            <div className="availability-selector-info">

              <div className="availability-selector-icon">
                <AiOutlineShop />
              </div>

              <div>

                <span className="availability-selector-label">
                  SELECT BUSINESS
                </span>

                <h2>
                  Which business are you managing?
                </h2>

                <p>
                  Choose a business to manage its
                  working hours.
                </p>

              </div>

            </div>

            {businesses.length > 0 ? (

              <div className="availability-select-wrapper">

                <select
                  value={selectedBusinessId}
                  onChange={(event) => {

                    setSelectedBusinessId(
                      event.target.value
                    );

                    setShowForm(false);
                    setEditingAvailabilityId(null);
                    setError("");

                  }}
                  className="availability-selector"
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

            ) : (

              <div className="no-business-selected">
                You don't have any businesses yet.
              </div>

            )}

          </section>

          {/* NO BUSINESS */}

          {businesses.length === 0 ? (

            <div className="empty-availability-card">

              <div className="empty-availability-icon">
                <AiOutlineShop />
              </div>

              <span className="empty-card-label">
                GET STARTED
              </span>

              <h2>
                Create a business first
              </h2>

              <p>
                You need to create a business before
                setting availability.
              </p>

              <Link
                href="/owner/businesses"
                className="primary-availability-button"
              >
                Go to My Businesses
                <AiOutlineRight />
              </Link>

            </div>

          ) : (

            <>

              {/* CURRENT BUSINESS */}

              {selectedBusiness && (

                <div className="selected-availability-banner">

                  <div className="selected-availability-icon">
                    <AiOutlineShop />
                  </div>

                  <div className="selected-availability-info">

                    <span>
                      MANAGING AVAILABILITY FOR
                    </span>

                    <h2>
                      {selectedBusiness.name}
                    </h2>

                    <p>

                      <span>
                        {selectedBusiness.category}
                      </span>

                      <span className="banner-dot">
                        •
                      </span>

                      <span className="banner-location">

                        <AiOutlineEnvironment />

                        {selectedBusiness.location}

                      </span>

                    </p>

                  </div>

                  <div className="selected-business-check">

                    <AiOutlineCheckCircle />

                    <span>
                      Active
                    </span>

                  </div>

                </div>

              )}

              {/* SECTION HEADER */}

              <div className="availability-section-header">

                <div>

                  <span className="availability-section-eyebrow">
                    WORKING HOURS
                  </span>

                  <h2>
                    Your Availability
                  </h2>

                  <p>
                    Define when customers can book
                    your services.
                  </p>

                </div>

                <button
                  type="button"
                  onClick={openAddForm}
                  className="add-availability-button"
                >
                  <AiOutlinePlus />
                  Add Availability
                </button>

              </div>

              {/* FORM */}

              {showForm && (

                <div className="availability-form-card">

                  <div className="availability-form-heading">

                    <div className="availability-form-icon">

                      {editingAvailabilityId ? (
                        <AiOutlineEdit />
                      ) : (
                        <AiOutlinePlus />
                      )}

                    </div>

                    <div>

                      <span>
                        {editingAvailabilityId
                          ? "UPDATE HOURS"
                          : "NEW SCHEDULE"}
                      </span>

                      <h2>
                        {editingAvailabilityId
                          ? "Edit Availability"
                          : "Add Availability"}
                      </h2>

                      <p>
                        Set the working hours for
                        a day of the week.
                      </p>

                    </div>

                  </div>

                  <form onSubmit={handleSubmit}>

                    <div className="availability-form-grid">

                      <div className="availability-form-group">

                        <label htmlFor="availability-day">
                          Day of Week
                        </label>

                        <div className="availability-input-with-icon">

                          <AiOutlineCalendar />

                          <select
                            id="availability-day"
                            value={dayOfWeek}
                            onChange={(event) =>
                              setDayOfWeek(
                                event.target.value
                              )
                            }
                          >

                            {DAYS.map((day) => (

                              <option
                                key={day.value}
                                value={day.value}
                              >
                                {day.label}
                              </option>

                            ))}

                          </select>

                        </div>

                      </div>

                      <div className="availability-form-group">

                        <label htmlFor="start-time">
                          Start Time
                        </label>

                        <div className="availability-input-with-icon">

                          <AiOutlineClockCircle />

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

                      </div>

                      <div className="availability-form-group">

                        <label htmlFor="end-time">
                          End Time
                        </label>

                        <div className="availability-input-with-icon">

                          <AiOutlineClockCircle />

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

                    </div>

                    {error && (

                      <div className="availability-form-message error">
                        {error}
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

                        {saving ? (
                          "Saving..."
                        ) : (
                          <>
                            {editingAvailabilityId
                              ? "Update Availability"
                              : "Add Availability"}

                            <AiOutlineRight />
                          </>
                        )}

                      </button>

                    </div>

                  </form>

                </div>

              )}

              {/* GLOBAL ERROR */}

              {!showForm && error && (

                <div className="availability-message error">
                  {error}
                </div>

              )}

              {/* AVAILABILITY LIST */}

              <section className="availability-list-section">

                <div className="availability-list-heading">

                  <div>

                    <span>
                      ACTIVE SCHEDULE
                    </span>

                    <h3>

                      {availability.length}{" "}

                      {availability.length === 1
                        ? "time slot"
                        : "time slots"}

                    </h3>

                  </div>

                </div>

                {loadingAvailability ? (

                  <div className="availability-loading-card">

                    <div className="loading-spinner" />

                    <span>
                      Loading your availability...
                    </span>

                  </div>

                ) : availability.length === 0 ? (

                  <div className="empty-availability-card compact">

                    <div className="empty-availability-icon">
                      <AiOutlineClockCircle />
                    </div>

                    <span className="empty-card-label">
                      NO HOURS SET
                    </span>

                    <h2>
                      No availability yet
                    </h2>

                    <p>
                      Add your working hours so
                      customers know when they can
                      book appointments.
                    </p>

                    <button
                      type="button"
                      onClick={openAddForm}
                      className="primary-availability-button"
                    >
                      <AiOutlinePlus />
                      Add Your First Availability
                    </button>

                  </div>

                ) : (

                  <div className="availability-grid">

                    {availability.map((item) => (

                      <div
                        key={item.id}
                        className="availability-card"
                      >

                        <div className="availability-card-top">

                          <div className="availability-day-icon">
                            <AiOutlineCalendar />
                          </div>

                          <div className="availability-card-actions">

                            <button
                              type="button"
                              onClick={() =>
                                openEditForm(item)
                              }
                              className="edit-availability-button"
                              title="Edit availability"
                            >
                              <AiOutlineEdit />
                              <span>
                                Edit
                              </span>
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleDelete(item)
                              }
                              className="delete-availability-button"
                              title="Delete availability"
                            >
                              <AiOutlineDelete />
                            </button>

                          </div>

                        </div>

                        <div className="availability-card-content">

                          <span className="availability-day-label">
                            WORKING DAY
                          </span>

                          <h3>
                            {getDayName(
                              item.day_of_week
                            )}
                          </h3>

                          <div className="availability-time-display">

                            <div className="availability-time-block">

                              <small>
                                START
                              </small>

                              <strong>
                                {formatTime(
                                  item.start_time
                                )}
                              </strong>

                            </div>

                            <div className="availability-time-line">

                              <span />

                              <AiOutlineRight />

                              <span />

                            </div>

                            <div className="availability-time-block">

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

                      </div>

                    ))}

                  </div>

                )}

              </section>

            </>

          )}

        </div>

        <footer className="availability-page-footer">

          <span>
            Slotify
          </span>

          <span>
            Business availability management
          </span>

        </footer>

      </section>

    </main>
  );
}