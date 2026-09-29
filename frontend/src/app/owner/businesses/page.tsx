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

export default function OwnerBusinessesPage() {
  const [user, setUser] = useState<User | null>(null);
  const [businesses, setBusinesses] = useState<Business[]>([]);

  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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

      setError(
        err instanceof Error
          ? err.message
          : "Failed to load your businesses."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateBusiness(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (
      !name.trim() ||
      !description.trim() ||
      !location.trim() ||
      !category.trim()
    ) {
      setError("Please fill in all fields.");
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

      setSuccess("Business created successfully.");
    } catch (err) {
      console.error("Create business error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to create business."
      );
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
      setSuccess("");

      await deleteBusiness(id);

      setBusinesses((current) =>
        current.filter(
          (business) => business.id !== id
        )
      );

      setSuccess("Business deleted successfully.");
    } catch (err) {
      console.error("Delete business error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to delete business."
      );
    }
  }

  function handleLogout() {
    logout();
    window.location.href = "/login";
  }

  if (loading && !user) {
    return (
      <main className="owner-businesses-page">
        <div className="owner-loading">
          Loading...
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="owner-businesses-page">
        <div className="owner-message error">
          {error || "Please log in first."}
        </div>
      </main>
    );
  }

  if (user.role !== "OWNER") {
    return (
      <main className="owner-businesses-page">
        <nav className="owner-navbar">
          <Link href="/" className="owner-logo">
            Slotify
          </Link>

          <div className="owner-nav-links">
            <Link href="/dashboard">
              Dashboard
            </Link>

            <button
              onClick={handleLogout}
              className="owner-logout"
            >
              Logout
            </button>
          </div>
        </nav>

        <div className="owner-message error">
          This page is only available to business owners.
        </div>
      </main>
    );
  }

  return (
    <main className="owner-businesses-page">

      {/* NAVBAR */}
      <nav className="owner-navbar">

        <Link href="/" className="owner-logo">
          Slotify
        </Link>

        <div className="owner-nav-links">

          <Link href="/dashboard">
            Dashboard
          </Link>

          <Link
            href="/owner/businesses"
            className="active-nav-link"
          >
            My Businesses
          </Link>

          <Link href="/owner/services">
            Services
          </Link>

          <button
            onClick={handleLogout}
            className="owner-logout"
          >
            Logout
          </button>

        </div>

      </nav>

      {/* HERO */}
      <section className="owner-page-hero">

        <div className="owner-hero-content">

          <span className="owner-eyebrow">
            BUSINESS OWNER
          </span>

          <h1>
            My Businesses
          </h1>

          <p>
            Create and manage the businesses you
            offer through Slotify.
          </p>

        </div>

        <div className="owner-hero-icon">
          🏢
        </div>

      </section>

      {/* CREATE BUSINESS */}
      <section className="owner-section">

        <div className="owner-section-heading">

          <span className="owner-eyebrow">
            CREATE
          </span>

          <h2>
            Add a New Business
          </h2>

          <p>
            Add your business information so customers
            can discover your services and book appointments.
          </p>

        </div>

        <div className="business-form-card">

          <form onSubmit={handleCreateBusiness}>

            <div className="form-group">

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

            <div className="form-group">

              <label htmlFor="business-description">
                Description
              </label>

              <textarea
                id="business-description"
                placeholder="Describe your business..."
                rows={4}
                value={description}
                onChange={(event) =>
                  setDescription(event.target.value)
                }
              />

            </div>

            <div className="business-form-row">

              <div className="form-group">

                <label htmlFor="business-location">
                  Location
                </label>

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

              <div className="form-group">

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

            {error && (
              <div className="owner-form-message error">
                {error}
              </div>
            )}

            {success && (
              <div className="owner-form-message success">
                {success}
              </div>
            )}

            <button
              type="submit"
              className="create-business-button"
              disabled={creating}
            >
              {creating
                ? "Creating..."
                : "Create Business →"}
            </button>

          </form>

        </div>

      </section>

      {/* EXISTING BUSINESSES */}
      <section className="owner-section owner-business-list">

        <div className="owner-section-heading">

          <span className="owner-eyebrow">
            YOUR BUSINESSES
          </span>

          <div className="business-heading-row">

            <div>
              <h2>
                Businesses You Manage
              </h2>

              <p>
                Manage the businesses connected to
                your owner account.
              </p>
            </div>

            <div className="business-count">
              {businesses.length}
              <span>
                {businesses.length === 1
                  ? " Business"
                  : " Businesses"}
              </span>
            </div>

          </div>

        </div>

        {loading && (
          <div className="owner-message">
            Loading your businesses...
          </div>
        )}

        {!loading && businesses.length === 0 && (
          <div className="empty-business-card">

            <div className="empty-business-icon">
              🏢
            </div>

            <h3>
              No businesses yet
            </h3>

            <p>
              Create your first business using
              the form above.
            </p>

          </div>
        )}

        {!loading && businesses.length > 0 && (
          <div className="owner-business-grid">

            {businesses.map((business) => (

              <article
                key={business.id}
                className="owner-business-card"
              >

                <div className="business-card-header">

                  <span className="business-category-badge">
                    {business.category}
                  </span>

                  <span className="business-status">
                    Active
                  </span>

                </div>

                <div className="business-card-icon">
                  🏢
                </div>

                <h3>
                  {business.name}
                </h3>

                <p className="owner-business-description">
                  {business.description}
                </p>

                <div className="owner-business-location">
                  <span>📍</span>
                  {business.location}
                </div>

                <div className="owner-business-actions">

                  <Link
                    href={`/owner/businesses/${business.id}`}
                    className="manage-business-button"
                  >
                    Manage Business
                    <span>→</span>
                  </Link>

                  <button
                    type="button"
                    onClick={() =>
                      handleDeleteBusiness(
                        business.id
                      )
                    }
                    className="delete-business-button"
                  >
                    Delete
                  </button>

                </div>

              </article>

            ))}

          </div>
        )}

      </section>

    </main>
  );
}