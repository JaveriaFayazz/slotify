"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";

import {
  Business,
  createBusiness,
  deleteBusiness,
  getMyBusinesses,
} from "../../services/business.service";

import {
  getStoredUser,
  logout,
  User,
} from "../../services/auth.service";

import {
  AiOutlineAppstore,
  AiOutlineCalendar,
  AiOutlineClockCircle,
  AiOutlineDelete,
  AiOutlineEnvironment,
  AiOutlineLogout,
  AiOutlinePlus,
  AiOutlineRight,
  AiOutlineSetting,
  AiOutlineShop,
  AiOutlineUser,
} from "react-icons/ai";

import { toast } from "sonner";

export default function OwnerBusinessesPage() {
  const [user, setUser] = useState<User | null>(null);
  const [businesses, setBusinesses] = useState<Business[]>([]);

  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("");

  useEffect(() => {
    const storedUser = getStoredUser();

    if (!storedUser) {
      setError("Please log in first.");
      setLoading(false);
      return;
    }

    setUser(storedUser);

    if (storedUser.role !== "OWNER") {
      setError("This page is only available to business owners.");
      setLoading(false);
      return;
    }

    loadBusinesses();
  }, []);

  async function loadBusinesses() {
    try {
      setLoading(true);
      setError("");

      const data = await getMyBusinesses();

      setBusinesses(data);
    } catch (err) {
      console.error("Failed to load businesses:", err);

      const message =
        err instanceof Error
          ? err.message
          : "Failed to load your businesses.";

      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateBusiness(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");

    if (
      !name.trim() ||
      !description.trim() ||
      !location.trim() ||
      !category.trim()
    ) {
      toast.error("Please fill in all fields.");
      return;
    }

    try {
      setCreating(true);

      const newBusiness = await createBusiness({
        name: name.trim(),
        description: description.trim(),
        location: location.trim(),
        category: category.trim(),
      });

      setBusinesses((current) => [
        ...current,
        newBusiness,
      ]);

      setName("");
      setDescription("");
      setLocation("");
      setCategory("");

      toast.success("Business created successfully.");
    } catch (err) {
      console.error("Create business error:", err);

      const message =
        err instanceof Error
          ? err.message
          : "Failed to create business.";

      toast.error(message);
    } finally {
      setCreating(false);
    }
  }

  async function handleDeleteBusiness(id: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this business?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await deleteBusiness(id);

      setBusinesses((current) =>
        current.filter(
          (business) => business.id !== id
        )
      );

      toast.success("Business deleted successfully.");
    } catch (err) {
      console.error("Delete business error:", err);

      const message =
        err instanceof Error
          ? err.message
          : "Failed to delete business.";

      toast.error(message);
    }
  }

  function handleLogout() {
    logout();
    window.location.href = "/login";
  }

  if (loading && !user) {
    return (
      <main className="owner-saas-page">
        <div className="owner-loading">
          <div className="loading-spinner" />
          <p>Loading your businesses...</p>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="owner-saas-page">
        <div className="owner-error-state">
          <h2>Please log in</h2>

          <p>
            {error || "You need to log in to continue."}
          </p>

          <Link
            href="/login"
            className="primary-owner-button"
          >
            Go to Login
          </Link>
        </div>
      </main>
    );
  }

  if (user.role !== "OWNER") {
    return (
      <main className="owner-saas-page">
        <div className="owner-error-state">
          <h2>Access denied</h2>

          <p>
            This page is only available to business owners.
          </p>

          <Link
            href="/dashboard"
            className="primary-owner-button"
          >
            Go to Dashboard
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="owner-saas-page">

      {/* SIDEBAR */}

      <aside className="owner-sidebar">

        <Link
          href="/dashboard"
          className="owner-sidebar-logo"
        >
          <div className="owner-logo-mark">
            <AiOutlineCalendar />
          </div>

          <span>Slotify</span>
        </Link>

        <div className="owner-sidebar-section">

          <span className="owner-sidebar-label">
            WORKSPACE
          </span>

          <nav className="owner-sidebar-nav">

            <Link
              href="/dashboard"
              className="owner-sidebar-link"
            >
              <AiOutlineAppstore />
              <span>Dashboard</span>
            </Link>

            <Link
              href="/owner/businesses"
              className="owner-sidebar-link active"
            >
              <AiOutlineShop />
              <span>My Businesses</span>
            </Link>

            <Link
              href="/owner/services"
              className="owner-sidebar-link"
            >
              <AiOutlineSetting />
              <span>Manage Services</span>
            </Link>

            <Link
              href="/owner/availability"
              className="owner-sidebar-link"
            >
              <AiOutlineClockCircle />
              <span>Availability</span>
            </Link>

            <Link
              href="/owner/appointments"
              className="owner-sidebar-link"
            >
              <AiOutlineCalendar />
              <span>Appointments</span>
            </Link>

          </nav>

        </div>

        <div className="owner-sidebar-bottom">

          <div className="owner-sidebar-user">

            <div className="owner-user-avatar">
              <AiOutlineUser />
            </div>

            <div className="owner-user-info">

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
            className="owner-sidebar-logout"
          >
            <AiOutlineLogout />
            <span>Log out</span>
          </button>

        </div>

      </aside>

      {/* MAIN CONTENT */}

      <div className="owner-main-content">

        {/* TOP BAR */}

        <header className="owner-topbar">

          <div>
            <span className="owner-breadcrumb">
              Workspace / My Businesses
            </span>
          </div>

          <Link
            href="/dashboard"
            className="owner-topbar-dashboard"
          >
            <AiOutlineAppstore />
            Dashboard
          </Link>

        </header>

        {/* PAGE HEADER */}

        <section className="owner-business-page-header">

          <div>

            <span className="owner-page-label">
              BUSINESS MANAGEMENT
            </span>

            <h1>
              My Businesses
            </h1>

            <p>
              Create and manage the businesses you
              offer through Slotify.
            </p>

          </div>

          <a
            href="#create-business"
            className="owner-add-business-button"
          >
            <AiOutlinePlus />
            Add Business
          </a>

        </section>

        {/* STATS */}

        <section className="owner-business-stats">

          <div className="owner-business-stat">

            <div className="owner-stat-icon">
              <AiOutlineShop />
            </div>

            <div>

              <span>
                Total Businesses
              </span>

              <strong>
                {businesses.length}
              </strong>

            </div>

          </div>

          <div className="owner-business-stat">

            <div className="owner-stat-icon">
              <AiOutlineCalendar />
            </div>

            <div>

              <span>
                Workspace
              </span>

              <strong>
                Active
              </strong>

            </div>

          </div>

        </section>

        {/* CREATE BUSINESS */}

        <section
          id="create-business"
          className="owner-create-section"
        >

          <div className="owner-section-title">

            <span>
              CREATE BUSINESS
            </span>

            <h2>
              Add a new business
            </h2>

            <p>
              Enter your business information to
              make it available to customers.
            </p>

          </div>

          <div className="owner-create-card">

            <form onSubmit={handleCreateBusiness}>

              <div className="owner-form-grid">

                <div className="owner-input-group">

                  <label htmlFor="business-name">
                    Business Name
                  </label>

                  <input
                    id="business-name"
                    type="text"
                    placeholder="e.g. FitZone Personal Training"
                    value={name}
                    onChange={(event) =>
                      setName(event.target.value)
                    }
                  />

                </div>

                <div className="owner-input-group">

                  <label htmlFor="business-category">
                    Category
                  </label>

                  <input
                    id="business-category"
                    type="text"
                    placeholder="e.g. Fitness"
                    value={category}
                    onChange={(event) =>
                      setCategory(event.target.value)
                    }
                  />

                </div>

              </div>

              <div className="owner-form-grid">

                <div className="owner-input-group">

                  <label htmlFor="business-location">
                    Location
                  </label>

                  <div className="owner-input-with-icon">

                    <AiOutlineEnvironment />

                    <input
                      id="business-location"
                      type="text"
                      placeholder="e.g. G11 Islamabad"
                      value={location}
                      onChange={(event) =>
                        setLocation(event.target.value)
                      }
                    />

                  </div>

                </div>

                <div className="owner-input-group">

                  <label>
                    Business Status
                  </label>

                  <div className="owner-status-input">
                    <span />
                    Active
                  </div>

                </div>

              </div>

              <div className="owner-input-group">

                <label htmlFor="business-description">
                  Description
                </label>

                <textarea
                  id="business-description"
                  placeholder="Describe your business and what customers can expect..."
                  rows={5}
                  value={description}
                  onChange={(event) =>
                    setDescription(event.target.value)
                  }
                />

              </div>

              {error && (
                <div className="owner-inline-error">
                  {error}
                </div>
              )}

              <div className="owner-form-footer">

                <p>
                  You can manage your services and
                  availability after creating the business.
                </p>

                <button
                  type="submit"
                  className="owner-create-button"
                  disabled={creating}
                >
                  {creating ? (
                    "Creating..."
                  ) : (
                    <>
                      <AiOutlinePlus />
                      Create Business
                    </>
                  )}
                </button>

              </div>

            </form>

          </div>

        </section>

        {/* BUSINESSES */}

        <section className="owner-businesses-section">

          <div className="owner-businesses-heading">

            <div>

              <span>
                YOUR BUSINESSES
              </span>

              <h2>
                Businesses you manage
              </h2>

              <p>
                Manage your businesses and their
                appointment services.
              </p>

            </div>

            <div className="owner-business-count">

              {businesses.length}

              <span>
                {businesses.length === 1
                  ? " business"
                  : " businesses"}
              </span>

            </div>

          </div>

          {loading && (
            <div className="owner-loading-card">

              <div className="loading-spinner" />

              <span>
                Loading your businesses...
              </span>

            </div>
          )}

          {!loading && businesses.length === 0 && (
            <div className="owner-empty-business">

              <div className="owner-empty-icon">
                <AiOutlineShop />
              </div>

              <h3>
                No businesses yet
              </h3>

              <p>
                Create your first business above
                to start accepting appointments.
              </p>

              <a
                href="#create-business"
                className="owner-empty-button"
              >
                <AiOutlinePlus />
                Create Business
              </a>

            </div>
          )}

          {!loading && businesses.length > 0 && (

            <div className="owner-business-grid">

              {businesses.map((business) => (

                <article
                  key={business.id}
                  className="owner-business-item"
                >

                  <div className="owner-business-item-top">

                    <div className="owner-business-avatar">
                      <AiOutlineShop />
                    </div>

                    <div className="owner-business-item-meta">

                      <span className="owner-business-category">
                        {business.category}
                      </span>

                      <span className="owner-business-active">
                        <span />
                        Active
                      </span>

                    </div>

                  </div>

                  <div className="owner-business-item-content">

                    <h3>
                      {business.name}
                    </h3>

                    <p>
                      {business.description}
                    </p>

                    <div className="owner-business-location">

                      <AiOutlineEnvironment />

                      <span>
                        {business.location}
                      </span>

                    </div>

                  </div>

                  <div className="owner-business-item-footer">

                    <Link
                      href={`/owner/businesses/${business.id}`}
                      className="owner-manage-button"
                    >
                      Manage Business
                      <AiOutlineRight />
                    </Link>

                    <button
                      type="button"
                      onClick={() =>
                        handleDeleteBusiness(
                          business.id
                        )
                      }
                      className="owner-delete-button"
                      title="Delete business"
                    >
                      <AiOutlineDelete />
                    </button>

                  </div>

                </article>

              ))}

            </div>

          )}

        </section>

        {/* FOOTER */}

        <footer className="owner-page-footer">

          <span>
            © {new Date().getFullYear()} Slotify
          </span>

          <span>
            Appointment management made simple.
          </span>

        </footer>

      </div>

    </main>
  );
}